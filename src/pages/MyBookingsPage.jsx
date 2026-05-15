import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Clock, Car, MapPin, Loader, Pencil, Save, X, Ban, RotateCcw } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuthContext } from "../context/AuthContext";
import {
  createPaymentReference,
  formatKesFromCents,
  startPaystackCheckout
} from "../lib/paystack";
import { verifyPaymentServerSide } from "../lib/paymentVerification";
import { sendBookingEmail } from "../lib/emailService";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function addBusinessDays(date, businessDays) {
  const result = new Date(date);
  let added = 0;
  while (added < businessDays) {
    result.setDate(result.getDate() + 1);
    const day = result.getDay();
    if (day !== 0 && day !== 6) {
      added += 1;
    }
  }
  return result;
}

function formatDateTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

export default function MyBookingsPage() {
  const { user } = useAuthContext();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);
  const [editingBookingId, setEditingBookingId] = useState(null);
  const [savingBookingId, setSavingBookingId] = useState(null);
  const [processingRefundBookingId, setProcessingRefundBookingId] = useState(null);
  const [processingFinalPaymentBookingId, setProcessingFinalPaymentBookingId] = useState(null);
  const [retryingVerificationBookingId, setRetryingVerificationBookingId] = useState(null);
  const [editForm, setEditForm] = useState({
    pickup_location: "",
    destination_location: "",
    booking_date: "",
    pickup_time: "",
    vehicle_type: "",
    passengers: 1
  });

  useEffect(() => {
    const loadBookings = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setError(null);
        const { data: bookingRows, error: queryError } = await supabase
          .from("bookings")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (queryError) throw queryError;

        const bookingIds = (bookingRows || []).map((b) => b.id);
        let paymentRows = [];
        if (bookingIds.length > 0) {
          const { data: paymentData, error: paymentError } = await supabase
            .from("payments")
            .select("booking_id, reference, created_at, status")
            .eq("user_id", user.id)
            .eq("status", "completed")
            .in("booking_id", bookingIds)
            .order("created_at", { ascending: false });

          if (paymentError) throw paymentError;
          paymentRows = paymentData || [];
        }

        const latestPaymentByBooking = new Map();
        paymentRows.forEach((payment) => {
          if (!latestPaymentByBooking.has(payment.booking_id)) {
            latestPaymentByBooking.set(payment.booking_id, payment);
          }
        });

        const merged = (bookingRows || []).map((booking) => {
          const payment = latestPaymentByBooking.get(booking.id);
          return {
            ...booking,
            reservation_paid_at: payment?.created_at || null,
            reservation_reference: payment?.reference || null
          };
        });

        setBookings(merged);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, [user]);

  const cancellableBookings = useMemo(
    () =>
      bookings.filter(
        (booking) =>
          (booking.payment_status === "reservation_paid" || booking.payment_status === "paid") &&
          booking.status !== "cancelled" &&
          booking.reservation_paid_at &&
          new Date().getTime() - new Date(booking.reservation_paid_at).getTime() <= ONE_DAY_MS
      ),
    [bookings]
  );

  const canProcessRefund = (booking) => {
    if (
      booking.payment_status !== "paid" ||
      booking.status !== "cancelled" ||
      booking.refund_status === "refunded" ||
      booking.refund_status === "processing"
    ) {
      return false;
    }
    if (!booking.refund_eligible_at) return false;
    return new Date().getTime() >= new Date(booking.refund_eligible_at).getTime();
  };

  const beginEdit = (booking) => {
    setEditingBookingId(booking.id);
    setActionMessage(null);
    setEditForm({
      pickup_location: booking.pickup_location || "",
      destination_location: booking.destination_location || "",
      booking_date: booking.booking_date || "",
      pickup_time: booking.pickup_time || "",
      vehicle_type: booking.vehicle_type || "",
      passengers: booking.passengers || 1
    });
  };

  const cancelEdit = () => {
    setEditingBookingId(null);
    setSavingBookingId(null);
    setEditForm({
      pickup_location: "",
      destination_location: "",
      booking_date: "",
      pickup_time: "",
      vehicle_type: "",
      passengers: 1
    });
  };

  const saveBookingUpdate = async (bookingId) => {
    setSavingBookingId(bookingId);
    setActionMessage(null);
    try {
      const updates = {
        pickup_location: editForm.pickup_location.trim(),
        destination_location: editForm.destination_location.trim(),
        booking_date: editForm.booking_date,
        pickup_time: editForm.pickup_time,
        vehicle_type: editForm.vehicle_type.trim() || null,
        passengers: Number(editForm.passengers) || 1,
        updated_at: new Date().toISOString()
      };

      const { data, error: updateError } = await supabase
        .from("bookings")
        .update(updates)
        .eq("id", bookingId)
        .eq("user_id", user.id)
        .select()
        .single();

      if (updateError) throw updateError;

      setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, ...data } : b)));
      setActionMessage({ type: "success", message: "Booking updated successfully." });
      cancelEdit();
    } catch (err) {
      setActionMessage({ type: "error", message: `Unable to update booking: ${err.message}` });
      setSavingBookingId(null);
    }
  };

  const cancelReservation = async (booking) => {
    const paidAt = booking.reservation_paid_at ? new Date(booking.reservation_paid_at).getTime() : null;
    const withinWindow = paidAt && new Date().getTime() - paidAt <= ONE_DAY_MS;
    if (!withinWindow) {
      setActionMessage({
        type: "error",
        message: "Cancellation window expired. Reservations can only be cancelled within 24 hours of payment."
      });
      return;
    }

    setSavingBookingId(booking.id);
    setActionMessage(null);
    try {
      const now = new Date();
      const refundEligibleAt = new Date(now.getTime() + ONE_DAY_MS);
      const refundDueAt = addBusinessDays(refundEligibleAt, 5);
      const { data, error: cancelError } = await supabase
        .from("bookings")
        .update({
          status: "cancelled",
          cancellation_requested_at: now.toISOString(),
          refund_status: "pending",
          refund_eligible_at: refundEligibleAt.toISOString(),
          refund_due_at: refundDueAt.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq("id", booking.id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (cancelError) throw cancelError;

      setBookings((prev) => prev.map((b) => (b.id === booking.id ? { ...b, ...data } : b)));
      setActionMessage({
        type: "success",
        message: `Reservation cancelled. Refund is scheduled after 24 hours and should complete within 5 business days (by ${refundDueAt.toLocaleDateString()}).`
      });
    } catch (err) {
      setActionMessage({ type: "error", message: `Unable to cancel reservation: ${err.message}` });
    } finally {
      setSavingBookingId(null);
    }
  };

  const processRefund = async (booking) => {
    if (!canProcessRefund(booking)) {
      setActionMessage({
        type: "error",
        message: "Refund is not yet eligible. It can only be processed after 24 hours from cancellation."
      });
      return;
    }

    setProcessingRefundBookingId(booking.id);
    setActionMessage(null);
    try {
      const { data, error: invokeError } = await supabase.functions.invoke("request-refund", {
        body: { bookingId: booking.id }
      });

      if (invokeError) {
        throw new Error(invokeError.message || "Failed to process refund request.");
      }
      if (!data?.success) {
        throw new Error(data?.error || "Refund request was not successful.");
      }

      if (data?.booking) {
        setBookings((prev) =>
          prev.map((b) => (b.id === booking.id ? { ...b, ...data.booking } : b))
        );
      }

      setActionMessage({
        type: "success",
        message: data?.message || "Refund request submitted successfully."
      });
    } catch (err) {
      setActionMessage({
        type: "error",
        message: `Unable to process refund: ${err.message}`
      });
    } finally {
      setProcessingRefundBookingId(null);
    }
  };

  const retryReservationVerification = async (booking) => {
    if (!booking.reservation_reference) {
      setActionMessage({ type: "error", message: "No reservation payment reference found." });
      return;
    }
    setRetryingVerificationBookingId(booking.id);
    setActionMessage(null);
    try {
      const result = await verifyPaymentServerSide(supabase, {
        reference: booking.reservation_reference,
        bookingId: booking.id,
        expectedAmount: booking.price_amount || 0,
        paymentStage: "reservation"
      });
      if (!result?.success) throw new Error(result?.error || "Verification failed.");
      setBookings((prev) =>
        prev.map((b) =>
          b.id === booking.id ? { ...b, payment_status: "reservation_paid", status: "confirmed" } : b
        )
      );
      setActionMessage({ type: "success", message: "Reservation payment verified successfully." });
    } catch (err) {
      setActionMessage({ type: "error", message: `Unable to verify reservation payment: ${err.message}` });
    } finally {
      setRetryingVerificationBookingId(null);
    }
  };

  const processFinalPayment = async (booking) => {
    const totalPrice = Number(booking.total_price || 0);
    const reservationFee = Number(booking.price_amount || 0);
    const balanceDue = Math.max(totalPrice - reservationFee, 0);

    if (balanceDue <= 0) {
      setActionMessage({ type: "error", message: "No outstanding final payment for this booking." });
      return;
    }

    setProcessingFinalPaymentBookingId(booking.id);
    setActionMessage(null);

    const reference = createPaymentReference(`${booking.id}_final`);
    try {
      const { error: insertError } = await supabase.from("payments").insert({
        booking_id: booking.id,
        user_id: user.id,
        amount: balanceDue,
        payment_method: "paystack_final",
        reference,
        status: "pending",
        paystack_response: null
      });

      if (insertError) throw insertError;

      startPaystackCheckout({
        email: user.email,
        amount: balanceDue,
        reference,
        metadata: {
          bookingId: booking.id,
          userId: user.id,
          paymentStage: "final"
        },
        onSuccess: async (transaction) => {
          try {
            const result = await verifyPaymentServerSide(supabase, {
              reference,
              bookingId: booking.id,
              expectedAmount: balanceDue,
              paymentStage: "final",
              checkoutResponse: transaction
            });
            if (!result?.success) throw new Error(result?.error || "Final payment verification failed.");

            setBookings((prev) =>
              prev.map((b) => (b.id === booking.id ? { ...b, payment_status: "paid", status: "confirmed" } : b))
            );
            setActionMessage({
              type: "success",
              message: "Trip confirmed and final payment completed successfully."
            });

            try {
              await sendBookingEmail({
                bookingId: booking.id,
                userEmail: user.email,
                userName: user.user_metadata?.full_name || user.email,
                pickupLocation: booking.pickup_location,
                destinationLocation: booking.destination_location,
                pickupDate: booking.booking_date,
                pickupTime: booking.pickup_time,
                passengers: booking.passengers,
                vehicleType: booking.vehicle_type,
                serviceType: `${booking.service_category || "Trip"} (Fully Paid & Confirmed)`
              });
            } catch (emailErr) {
              console.error("Final payment confirmation email failed:", emailErr);
            }
          } catch (err) {
            setActionMessage({ type: "error", message: `Final payment completed but verification failed: ${err.message}` });
          } finally {
            setProcessingFinalPaymentBookingId(null);
          }
        },
        onCancel: async () => {
          await supabase
            .from("payments")
            .update({ status: "cancelled", updated_at: new Date().toISOString() })
            .eq("reference", reference)
            .eq("user_id", user.id);
          setActionMessage({ type: "error", message: "Final payment was cancelled." });
          setProcessingFinalPaymentBookingId(null);
        }
      });
    } catch (err) {
      setActionMessage({ type: "error", message: `Unable to start final payment: ${err.message}` });
      setProcessingFinalPaymentBookingId(null);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto border border-gray-300 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">My Bookings</h1>
          <p className="text-gray-600 mb-6">Sign in to view your active and past bookings.</p>
          <Link to="/auth" className="inline-block px-6 py-3 bg-[#B35A38] text-white font-semibold hover:bg-[#8B4225] transition-colors">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-32 pb-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="border border-gray-300 p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-600">Track all your confirmed, pending, and completed rides.</p>
          {cancellableBookings.length > 0 && (
            <p className="text-sm text-[#B35A38] mt-2">
              You can cancel paid reservations within 24 hours of payment.
            </p>
          )}
        </div>

        {actionMessage && (
          <div
            className={`border p-4 mb-4 ${
              actionMessage.type === "success"
                ? "border-green-400 bg-green-50 text-green-700"
                : "border-red-400 bg-red-50 text-red-700"
            }`}
          >
            {actionMessage.message}
          </div>
        )}

        {loading ? (
          <div className="border border-gray-300 p-8 flex items-center gap-3 text-gray-700">
            <Loader size={18} className="animate-spin" />
            Loading bookings...
          </div>
        ) : error ? (
          <div className="border border-red-400 bg-red-50 p-8 text-red-700">
            Failed to load bookings: {error}
          </div>
        ) : bookings.length === 0 ? (
          <div className="border border-gray-300 p-8">
            <p className="text-gray-700 mb-4">No bookings yet.</p>
            <Link to="/booking" className="inline-block px-6 py-3 bg-[#B35A38] text-white font-semibold hover:bg-[#8B4225] transition-colors">
              Create a Booking
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <article key={booking.id} className="border border-gray-300 p-6">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <h2 className="text-xl font-bold text-gray-900">{booking.service_category || "Ride Booking"}</h2>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 text-sm font-semibold border border-gray-300 bg-gray-100 text-gray-800 uppercase">
                      {booking.status || "pending"}
                    </span>
                    <span
                      className={`px-3 py-1 text-sm font-semibold border uppercase ${
                        booking.payment_status === "paid"
                          ? "border-green-300 bg-green-100 text-green-700"
                          : booking.payment_status === "reservation_paid"
                            ? "border-blue-300 bg-blue-100 text-blue-700"
                          : "border-yellow-300 bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {booking.payment_status || "unpaid"}
                    </span>
                  </div>
                </div>

                {editingBookingId === booking.id ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <label className="text-gray-500 text-xs">Pickup</label>
                      <input
                        type="text"
                        value={editForm.pickup_location}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, pickup_location: e.target.value }))}
                        className="w-full border border-gray-300 px-3 py-2 text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="text-gray-500 text-xs">Destination</label>
                      <input
                        type="text"
                        value={editForm.destination_location}
                        onChange={(e) =>
                          setEditForm((prev) => ({ ...prev, destination_location: e.target.value }))
                        }
                        className="w-full border border-gray-300 px-3 py-2 text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="text-gray-500 text-xs">Date</label>
                      <input
                        type="date"
                        value={editForm.booking_date}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, booking_date: e.target.value }))}
                        className="w-full border border-gray-300 px-3 py-2 text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="text-gray-500 text-xs">Time</label>
                      <input
                        type="time"
                        value={editForm.pickup_time}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, pickup_time: e.target.value }))}
                        className="w-full border border-gray-300 px-3 py-2 text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="text-gray-500 text-xs">Vehicle</label>
                      <input
                        type="text"
                        value={editForm.vehicle_type}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, vehicle_type: e.target.value }))}
                        className="w-full border border-gray-300 px-3 py-2 text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="text-gray-500 text-xs">Passengers</label>
                      <input
                        type="number"
                        min={1}
                        value={editForm.passengers}
                        onChange={(e) =>
                          setEditForm((prev) => ({ ...prev, passengers: Number(e.target.value) || 1 }))
                        }
                        className="w-full border border-gray-300 px-3 py-2 text-gray-900"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-start gap-3">
                      <MapPin size={17} className="text-[#B35A38] mt-0.5" />
                      <div>
                        <p className="text-gray-500">Pickup</p>
                        <p className="font-semibold text-gray-900">{booking.pickup_location}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin size={17} className="text-[#B35A38] mt-0.5" />
                      <div>
                        <p className="text-gray-500">Destination</p>
                        <p className="font-semibold text-gray-900">{booking.destination_location}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar size={17} className="text-[#B35A38] mt-0.5" />
                      <div>
                        <p className="text-gray-500">Date</p>
                        <p className="font-semibold text-gray-900">{booking.booking_date}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock size={17} className="text-[#B35A38] mt-0.5" />
                      <div>
                        <p className="text-gray-500">Time</p>
                        <p className="font-semibold text-gray-900">{booking.pickup_time}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Car size={17} className="text-[#B35A38] mt-0.5" />
                      <div>
                        <p className="text-gray-500">Vehicle</p>
                        <p className="font-semibold text-gray-900">{booking.vehicle_type || "Not specified"}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-500">Booking ID</p>
                      <p className="font-semibold text-gray-900 break-all">{booking.id}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Reserved Amount</p>
                      <p className="font-semibold text-gray-900">
                        {booking.price_amount ? formatKesFromCents(booking.price_amount) : "Not paid"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Total Trip Price</p>
                      <p className="font-semibold text-gray-900">
                        {booking.total_price ? formatKesFromCents(Number(booking.total_price)) : "Pending"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Outstanding Balance</p>
                      <p className="font-semibold text-gray-900">
                        {booking.total_price && booking.price_amount
                          ? formatKesFromCents(Math.max(Number(booking.total_price) - Number(booking.price_amount), 0))
                          : "Pending"}
                      </p>
                    </div>
                    {booking.reservation_reference && (
                      <div>
                        <p className="text-gray-500">Payment Reference</p>
                        <p className="font-semibold text-gray-900 break-all">{booking.reservation_reference}</p>
                      </div>
                    )}
                    {booking.status === "cancelled" &&
                      (booking.payment_status === "reservation_paid" || booking.payment_status === "paid") && (
                      <>
                        <div>
                          <p className="text-gray-500">Refund Status</p>
                          <p className="font-semibold text-gray-900 uppercase">
                            {booking.refund_status || "pending"}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Refund Eligible After</p>
                          <p className="font-semibold text-gray-900">
                            {formatDateTime(booking.refund_eligible_at)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Refund Due By (5 business days)</p>
                          <p className="font-semibold text-gray-900">
                            {formatDateTime(booking.refund_due_at)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Refund Processed At</p>
                          <p className="font-semibold text-gray-900">
                            {formatDateTime(booking.refund_processed_at)}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                )}

                <div className="mt-5 flex flex-wrap gap-2">
                  {editingBookingId === booking.id ? (
                    <>
                      <button
                        type="button"
                        disabled={savingBookingId === booking.id}
                        onClick={() => saveBookingUpdate(booking.id)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#B35A38] text-white text-sm font-semibold hover:bg-[#8B4225] disabled:opacity-50"
                      >
                        {savingBookingId === booking.id ? <Loader size={14} className="animate-spin" /> : <Save size={14} />}
                        Save changes
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-sm font-semibold text-gray-900 hover:bg-gray-100"
                      >
                        <X size={14} />
                        Cancel edit
                      </button>
                    </>
                  ) : (
                    <>
                      {booking.status !== "cancelled" && (
                        <button
                          type="button"
                          onClick={() => beginEdit(booking)}
                          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-sm font-semibold text-gray-900 hover:bg-gray-100"
                        >
                          <Pencil size={14} />
                          Revise booking
                        </button>
                      )}
                      {booking.payment_status === "reservation_paid" && booking.status !== "cancelled" && (
                        <button
                          type="button"
                          disabled={processingFinalPaymentBookingId === booking.id}
                          onClick={() => processFinalPayment(booking)}
                          className="inline-flex items-center gap-2 px-4 py-2 border border-green-500 text-sm font-semibold text-green-700 hover:bg-green-50 disabled:opacity-50"
                        >
                          {processingFinalPaymentBookingId === booking.id ? (
                            <Loader size={14} className="animate-spin" />
                          ) : (
                            <Car size={14} />
                          )}
                          Confirm Trip & Pay Balance
                        </button>
                      )}
                      {booking.payment_status === "unpaid" && booking.reservation_reference && booking.status !== "cancelled" && (
                        <button
                          type="button"
                          disabled={retryingVerificationBookingId === booking.id}
                          onClick={() => retryReservationVerification(booking)}
                          className="inline-flex items-center gap-2 px-4 py-2 border border-[#B35A38] text-sm font-semibold text-[#B35A38] hover:bg-[#B35A38]/10 disabled:opacity-50"
                        >
                          {retryingVerificationBookingId === booking.id ? (
                            <Loader size={14} className="animate-spin" />
                          ) : (
                            <RotateCcw size={14} />
                          )}
                          Retry Verification
                        </button>
                      )}
                      {booking.payment_status === "reservation_paid" &&
                        booking.status !== "cancelled" && (
                        <button
                          type="button"
                          disabled={savingBookingId === booking.id}
                          onClick={() => cancelReservation(booking)}
                          className="inline-flex items-center gap-2 px-4 py-2 border border-red-400 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                        >
                          {savingBookingId === booking.id ? (
                            <Loader size={14} className="animate-spin" />
                          ) : (
                            <Ban size={14} />
                          )}
                          Cancel reservation (24h)
                        </button>
                      )}
                      {booking.payment_status === "paid" && booking.status === "cancelled" && (
                        <button
                          type="button"
                          disabled={processingRefundBookingId === booking.id || !canProcessRefund(booking)}
                          onClick={() => processRefund(booking)}
                          className="inline-flex items-center gap-2 px-4 py-2 border border-[#B35A38] text-sm font-semibold text-[#B35A38] hover:bg-[#B35A38]/10 disabled:opacity-50"
                        >
                          {processingRefundBookingId === booking.id ? (
                            <Loader size={14} className="animate-spin" />
                          ) : (
                            <RotateCcw size={14} />
                          )}
                          {canProcessRefund(booking) ? "Process refund" : "Refund available after 24h"}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


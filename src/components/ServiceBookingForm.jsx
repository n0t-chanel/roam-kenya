import React, { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, Users, Phone, ArrowLeft, AlertCircle, CheckCircle, Loader, Plane, Car, Hotel, Heart, Camera, Truck, CreditCard } from "lucide-react";
import { useDatabase } from "../hooks/useDatabase";
import { useAuthContext } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { sendBookingEmail } from "../lib/emailService";
import {
  createPaymentReference,
  formatKesFromCents,
  getReservationAmount,
  startPaystackCheckout
} from "../lib/paystack";

export default function ServiceBookingForm({ serviceType, onBack }) {
  const { user } = useAuthContext();
  const bookingsDb = useDatabase('bookings');
  const [bookingId, setBookingId] = useState(null);
  const [activeBooking, setActiveBooking] = useState(null);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentFeedback, setPaymentFeedback] = useState(null);

  // Service icons mapping
  const serviceIcons = {
    "airport-transfer": Plane,
    "chauffeur-rental": Car,
    "hotel-transfer": Hotel,
    "intercity-ride": MapPin,
    "wedding-travel": Heart,
    "safari-tour": Camera,
    "fleet-management": Truck
  };

  // Vehicle type options for each service
  const vehicleOptions = {
    "airport-transfer": ["Economy Sedan", "Executive Sedan", "SUV (7-seater)", "Luxury Car"],
    "chauffeur-rental": ["Economy Sedan", "Executive Sedan", "SUV (7-seater)", "Luxury Car", "Van (10-seater)"],
    "hotel-transfer": ["Economy Sedan", "Executive Sedan", "SUV (7-seater)"],
    "intercity-ride": ["Economy Sedan", "Executive Sedan", "SUV (7-seater)", "Van (14-seater)"],
    "wedding-travel": ["Executive Sedan", "Luxury Car", "SUV (7-seater)", "Limousine"],
    "safari-tour": ["SUV (7-seater)", "Land Cruiser", "Safari Van (15-seater)"],
    "fleet-management": ["Sedan", "SUV", "Van", "Truck"]
  };

  // Service-specific field configurations
  const serviceFields = {
    "airport-transfer": {
      label: "Airport Transfer",
      fields: [
        { name: "airport", label: "Airport", placeholder: "JKIA or Wilson", required: true },
        { name: "destination", label: "Destination", placeholder: "Your destination", required: true },
        { name: "flightNumber", label: "Flight Number (Optional)", placeholder: "e.g., KQ101", required: false },
        { name: "date", label: "Arrival Date", type: "date", required: true },
        { name: "time", label: "Pickup Time", type: "time", required: true },
        { name: "vehicleType", label: "Vehicle Type", type: "select", options: vehicleOptions["airport-transfer"], required: true },
        { name: "passengers", label: "Passengers", type: "number", min: 1, max: 10, required: true }
      ]
    },
    "chauffeur-rental": {
      label: "Chauffeur Rental",
      fields: [
        { name: "location", label: "Pickup Location", placeholder: "Where should we pick you up?", required: true },
        { name: "startDate", label: "Start Date", type: "date", required: true },
        { name: "startTime", label: "Start Time", type: "time", required: true },
        { name: "endDate", label: "End Date", type: "date", required: true },
        { name: "endTime", label: "End Time", type: "time", required: true },
        { name: "vehicleType", label: "Vehicle Type", type: "select", options: vehicleOptions["chauffeur-rental"], required: true },
        { name: "passengers", label: "Passengers", type: "number", min: 1, max: 6, required: true }
      ]
    },
    "hotel-transfer": {
      label: "Hotel Transfer",
      fields: [
        { name: "hotelName", label: "Hotel Name", placeholder: "Name of your hotel", required: true },
        { name: "destination", label: "Destination", placeholder: "Where are you arriving from?", required: true },
        { name: "checkInDate", label: "Check-in Date", type: "date", required: true },
        { name: "checkInTime", label: "Check-in Time", type: "time", required: true },
        { name: "vehicleType", label: "Vehicle Type", type: "select", options: vehicleOptions["hotel-transfer"], required: true },
        { name: "passengers", label: "Passengers", type: "number", min: 1, max: 6, required: true }
      ]
    },
    "intercity-ride": {
      label: "Intercity Ride",
      fields: [
        { name: "pickup", label: "From", placeholder: "Starting location", required: true },
        { name: "destination", label: "To", placeholder: "Destination city", required: true },
        { name: "date", label: "Travel Date", type: "date", required: true },
        { name: "time", label: "Departure Time", type: "time", required: true },
        { name: "vehicleType", label: "Vehicle Type", type: "select", options: vehicleOptions["intercity-ride"], required: true },
        { name: "passengers", label: "Passengers", type: "number", min: 1, max: 8, required: true }
      ]
    },
    "wedding-travel": {
      label: "Wedding Travel",
      fields: [
        { name: "eventVenue", label: "Venue Name", placeholder: "Wedding venue", required: true },
        { name: "eventDate", label: "Event Date", type: "date", required: true },
        { name: "eventTime", label: "Event Time", type: "time", required: true },
        { name: "vehicleType", label: "Vehicle Type", type: "select", options: vehicleOptions["wedding-travel"], required: true },
        { name: "guestCount", label: "Guest Count", type: "number", min: 1, max: 20, required: true },
        { name: "specialRequests", label: "Special Requests", placeholder: "e.g., flowers, decorations", required: false }
      ]
    },
    "safari-tour": {
      label: "Safari Tour",
      fields: [
        { name: "tourType", label: "Tour Type", placeholder: "e.g., Nairobi National Park, Amboseli", required: true },
        { name: "startDate", label: "Start Date", type: "date", required: true },
        { name: "startTime", label: "Start Time", type: "time", required: true },
        { name: "vehicleType", label: "Vehicle Type", type: "select", options: vehicleOptions["safari-tour"], required: true },
        { name: "duration", label: "Duration (Days)", type: "number", min: 1, max: 7, required: true },
        { name: "guestCount", label: "Guests", type: "number", min: 1, max: 20, required: true }
      ]
    },
    "fleet-management": {
      label: "Fleet Management",
      fields: [
        { name: "vehicleType", label: "Vehicle Type", type: "select", options: vehicleOptions["fleet-management"], required: true },
        { name: "rentalPeriod", label: "Rental Period", placeholder: "e.g., Monthly, Weekly", required: true },
        { name: "purpose", label: "Purpose", placeholder: "e.g., Business, Personal", required: true }
      ]
    }
  };

  const config = serviceFields[serviceType] || serviceFields["airport-transfer"];
  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState("");

  // Initialize form data
  useEffect(() => {
    const initialData = {};
    config.fields.forEach(field => {
      initialData[field.name] = "";
    });
    setFormData(initialData);
  }, [serviceType]);

  const validateForm = () => {
    const errors = {};

    config.fields.forEach(field => {
      if (field.required && !formData[field.name]?.toString().trim()) {
        errors[field.name] = `${field.label} is required`;
      }
    });

    // Validate date fields are not in past
    const dateFields = config.fields.filter(f => f.type === "date");
    dateFields.forEach(field => {
      if (formData[field.name]) {
        const selectedDate = new Date(formData[field.name]);
        const today = new Date();
        const selectedDateOnly = new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate()
        );
        const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        if (selectedDateOnly < todayDateOnly) {
          errors[field.name] = "Please select today or a future date";
        }
      }
    });

    // Validate end date is after start date
    if (formData.endDate && formData.startDate) {
      if (new Date(formData.endDate) <= new Date(formData.startDate)) {
        errors.endDate = "End date must be after start date";
      }
    }

    if (!phoneNumber.trim()) {
      errors.phone = "Phone number is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Auto-set time when flight number is entered (for airport transfers)
    if (serviceType === "airport-transfer" && name === "flightNumber" && value.trim()) {
      const now = new Date();
      const currentTime = now.toLocaleTimeString('en-GB', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false
      });
      
      setFormData(prev => ({ 
        ...prev, 
        [name]: value,
        time: currentTime,
        // Also auto-set today's date for airport pickups
        date: prev.date || new Date().toISOString().split('T')[0]
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (!user) {
      setSubmitStatus({ type: "error", message: "Please login to make a booking" });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Prepare booking payload with minimal required fields
      const bookingPayload = {
        user_id: user.id,
        pickup_location: formData.pickup || formData.airport || formData.location || formData.hotelName || formData.tourType || formData.eventVenue || "",
        destination_location: formData.destination || formData.hotelName || formData.eventVenue || "",
        flight_number: formData.flightNumber || null,
        booking_date: formData.date || formData.startDate || formData.checkInDate || formData.eventDate || new Date().toISOString().split("T")[0],
        pickup_time: formData.time || formData.startTime || formData.checkInTime || formData.eventTime || "09:00", // Use selected time or default
        duration: formData.rentalPeriod || formData.duration || "Full Day",
        passengers: parseInt(formData.passengers || formData.guestCount || "1"),
        vehicle_type: formData.vehicleType || "Standard", // Now from user selection
        service_category: config.label,
        status: "pending",
        notes: `${formData.specialRequests || ""} Phone: ${phoneNumber}`,
        total_price: null,
        created_at: new Date(),
        updated_at: new Date()
      };

      // Save booking to database
      const savedBooking = await bookingsDb.insert([bookingPayload]);

      if (!savedBooking || savedBooking.length === 0) {
        throw new Error("Failed to create booking");
      }

      const bid = savedBooking[0].id;
      setBookingId(bid);

      // If flight number provided (for airport transfers), start tracking
      if (formData.flightNumber?.trim() && serviceType === "airport-transfer") {
        try {
          console.log('✈️ Starting flight tracking with booking ID:', bid);
          
          // Insert flight_bookings record directly
          const { data: flightBookingData, error: flightErr } = await supabase
            .from('flight_bookings')
            .insert({
              booking_id: bid,
              user_id: user.id,
              flight_number: formData.flightNumber.toUpperCase(),
              tracking_status: 'waiting',
              updated_at: new Date()
            })
            .select();
      
          if (flightErr) {
            console.error('Flight booking error:', flightErr);
            throw flightErr;
          }
      
          console.log('✅ Flight tracking started:', flightBookingData);
        } catch (trackErr) {
          console.error('Flight tracking failed:', trackErr);
        }
      }

      // Send WhatsApp confirmation as backup
      try {
        console.log("💬 Sending WhatsApp confirmation...");
        const bookingDetails = `
✅ *${config.label} Confirmed!*
Booking ID: ${bid}
Pickup: ${bookingPayload.pickup_location}
Destination: ${bookingPayload.destination_location}
Date: ${bookingPayload.booking_date}
Time: ${bookingPayload.pickup_time}
Passengers: ${bookingPayload.passengers}
${formData.flightNumber ? `Flight: ${formData.flightNumber}` : ""}

Thank you for booking with us!
        `;
        
        // Send via WhatsApp API (you'll need to configure this)
        // For now, log it
        console.log("WhatsApp message queued:", bookingDetails);
      } catch (whatsappErr) {
        console.error("WhatsApp sending error:", whatsappErr);
      }

      const reservationAmount = getReservationAmount(config.label);
      setSubmitStatus({
        type: "success",
        message: `${config.label} booking confirmed. Proceed to payment to reserve this booking.`
      });
      setActiveBooking({
        id: bid,
        service: config.label,
        pickupLocation: bookingPayload.pickup_location || "Not specified",
        destinationLocation: bookingPayload.destination_location || "Not specified",
        date: bookingPayload.booking_date,
        time: bookingPayload.pickup_time,
        passengers: bookingPayload.passengers,
        vehicleType: bookingPayload.vehicle_type,
        phoneNumber,
        status: "Active",
        flightNumber: bookingPayload.flight_number || null,
        paymentStatus: "unpaid",
        reservationAmount,
        paymentReference: null
      });
    } catch (err) {
      console.error("Booking error:", err);
      setSubmitStatus({
        type: "error",
        message: `Error: ${err.message}`
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBookAnother = () => {
    const initialData = {};
    config.fields.forEach(field => {
      initialData[field.name] = "";
    });
    setFormData(initialData);
    setPhoneNumber("");
    setFormErrors({});
    setSubmitStatus(null);
    setActiveBooking(null);
    setBookingId(null);
    setPaymentFeedback(null);
    setIsPaying(false);
  };

  const verifyPaymentServerSide = async (payload) => {
    const invokeResult = await supabase.functions.invoke("verify-payment", {
      body: payload
    });

    if (!invokeResult.error && invokeResult.data) {
      return invokeResult.data;
    }

    const invokeErrorMessage = invokeResult.error?.message || "";
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        `${invokeErrorMessage} Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY for fallback verification.`
      );
    }

    const {
      data: { session }
    } = await supabase.auth.getSession();

    const response = await fetch(`${supabaseUrl}/functions/v1/verify-payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseAnonKey,
        Authorization: session?.access_token ? `Bearer ${session.access_token}` : ""
      },
      body: JSON.stringify(payload)
    });

    const fallbackData = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(
        fallbackData?.error ||
          fallbackData?.message ||
          `${invokeErrorMessage} Failed to send a request to the Edge Function`
      );
    }

    return fallbackData;
  };

  const handleReserveBookingPayment = async () => {
    if (!activeBooking?.id || !user?.id) {
      setPaymentFeedback({
        type: "error",
        message: "Missing booking session. Please create your booking again."
      });
      return;
    }

    setIsPaying(true);
    setPaymentFeedback(null);

    const reference = createPaymentReference(activeBooking.id);
    const amount = activeBooking.reservationAmount;

    try {
      const { error: insertError } = await supabase
        .from("payments")
        .insert({
          booking_id: activeBooking.id,
          user_id: user.id,
          amount,
          payment_method: "paystack",
          reference,
          status: "pending",
          paystack_response: null
        });

      if (insertError) {
        throw new Error(
          insertError.message.includes("payments")
            ? "Payments table is not ready. Run PAYSTACK_MIGRATIONS.sql in Supabase, then retry."
            : insertError.message
        );
      }

      startPaystackCheckout({
        email: user.email,
        amount,
        reference,
        metadata: {
          bookingId: activeBooking.id,
          userId: user.id,
          service: activeBooking.service
        },
        onSuccess: async (transaction) => {
          try {
            const verifyResult = await verifyPaymentServerSide({
              reference,
              bookingId: activeBooking.id,
              expectedAmount: amount,
              checkoutResponse: transaction
            });

            if (!verifyResult?.success) {
              throw new Error(verifyResult?.error || "Payment verification failed.");
            }

            setActiveBooking((prev) =>
              prev
                ? {
                    ...prev,
                    paymentStatus: "paid",
                    paymentReference: reference
                  }
                : prev
            );
            setPaymentFeedback({
              type: "success",
              message:
                verifyResult?.message ||
                `Payment verified successfully. Reference: ${reference}. You can cancel this reservation within 24 hours.`
            });

            try {
              await sendBookingEmail({
                bookingId: activeBooking.id,
                userEmail: user.email,
                userName: user.user_metadata?.full_name || user.email,
                pickupLocation: activeBooking.pickupLocation,
                destinationLocation: activeBooking.destinationLocation,
                pickupDate: activeBooking.date,
                pickupTime: activeBooking.time,
                passengers: activeBooking.passengers,
                vehicleType: activeBooking.vehicleType,
                flightNumber: activeBooking.flightNumber || undefined,
                serviceType: `${activeBooking.service} (Reserved & Paid)`,
                reservationNotice:
                  "Reservation confirmed. You can cancel your reservation within 24 hours from payment time."
              });
            } catch (emailErr) {
              console.error("Reservation email sending error:", emailErr);
            }
          } catch (verifyErr) {
            await supabase
              .from("payments")
              .update({
                paystack_response: transaction,
                updated_at: new Date().toISOString()
              })
              .eq("reference", reference)
              .eq("user_id", user.id);

            setPaymentFeedback({
              type: "error",
              message: `Payment completed but verification failed: ${verifyErr.message}. Deploy 'verify-payment' function and set PAYSTACK_SECRET_KEY in Supabase secrets, then retry verification.`
            });
          } finally {
            setIsPaying(false);
          }
        },
        onCancel: async () => {
          try {
            await supabase
              .from("payments")
              .update({
                status: "cancelled",
                updated_at: new Date().toISOString()
              })
              .eq("reference", reference)
              .eq("user_id", user.id);
          } finally {
            setPaymentFeedback({
              type: "error",
              message: "Payment was cancelled. Your booking remains unpaid."
            });
            setIsPaying(false);
          }
        }
      });
    } catch (err) {
      setPaymentFeedback({
        type: "error",
        message: err.message
      });
      setIsPaying(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pt-32 pb-20">
      <div className="max-w-2xl mx-auto px-6 md:px-12">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[#B35A38] hover:text-[#8B4225] transition-colors mb-8 font-semibold text-sm"
        >
          <ArrowLeft size={18} />
          Back to Services
        </button>

        {/* Header with Icon */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-[#B35A38] rounded-none flex items-center justify-center">
              {React.createElement(serviceIcons[serviceType] || Plane, { size: 28, color: "white" })}
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">{config.label}</h1>
              <p className="text-gray-600">Complete your booking details</p>
            </div>
          </div>
        </div>

        {/* Form Container */}
        {submitStatus?.type !== "success" ? (
          <form onSubmit={handleSubmit} className="bg-white border border-gray-300 p-8 md:p-10 space-y-6">
            {/* Dynamic Service Fields */}
            <div className="space-y-5">
              {config.fields.map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-semibold text-gray-900 mb-2.5">
                    {field.label}
                    {field.required && <span className="text-red-600 ml-1">*</span>}
                  </label>
                  
                  {/* Select field for vehicle type */}
                  {field.type === "select" ? (
                    <select
                      name={field.name}
                      value={formData[field.name] || ""}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border transition-all duration-300 ${
                        formErrors[field.name]
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300 bg-white hover:border-gray-400"
                      } text-gray-900 focus:outline-none focus:border-[#B35A38] focus:ring-1 focus:ring-[#B35A38] appearance-none cursor-pointer`}
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23B35A38' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 1rem center',
                        paddingRight: '2.5rem'
                      }}
                    >
                      <option value="" disabled>
                        Select {field.label.toLowerCase()}
                      </option>
                      {field.options?.map((option) => (
                        <option key={option} value={option} className="bg-white text-gray-900">
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    // Standard input field
                    <input
                      type={field.type || "text"}
                      name={field.name}
                      value={formData[field.name] || ""}
                      onChange={handleChange}
                      placeholder={field.placeholder}
                      min={field.min}
                      max={field.max}
                      className={`w-full px-4 py-3 border transition-all duration-300 ${
                        formErrors[field.name]
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300 bg-white hover:border-gray-400"
                      } text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#B35A38] focus:ring-1 focus:ring-[#B35A38]`}
                    />
                  )}
                  
                  {formErrors[field.name] && (
                    <p className="text-red-600 text-xs mt-1.5 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {formErrors[field.name]}
                    </p>
                  )}
                </div>
                ))}
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2.5">
                  Phone Number <span className="text-red-600">*</span>
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Your contact number"
                  className={`w-full px-4 py-3 border transition-all duration-300 ${
                    formErrors.phone
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 bg-white hover:border-gray-400"
                  } text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#B35A38] focus:ring-1 focus:ring-[#B35A38]`}
                />
                {formErrors.phone && (
                  <p className="text-red-600 text-xs mt-1.5 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {formErrors.phone}
                  </p>
                )}
              </div>

              {/* Special Requests */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2.5">
                  Special Requests <span className="text-gray-500 font-normal">(Optional)</span>
                </label>
                <textarea
                  value={formData.specialRequests || ""}
                  onChange={(e) =>
                    setFormData(prev => ({ ...prev, specialRequests: e.target.value }))
                  }
                  placeholder="Any special requirements or preferences..."
                  className="w-full px-4 py-3 border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#B35A38] focus:ring-1 focus:ring-[#B35A38] transition-all duration-300 resize-none h-20 hover:border-gray-400"
                />
              </div>

              {/* Status Messages */}
              {submitStatus && (
                <div
                  className={`p-4 flex items-start gap-3 ${
                    submitStatus.type === "error"
                      ? "bg-red-100 border border-red-400 text-red-700"
                      : "bg-green-100 border border-green-400 text-green-700"
                  }`}
                >
                  {submitStatus.type === "error" ? (
                    <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle size={20} className="flex-shrink-0 mt-0.5" />
                  )}
                  <p className="text-sm">
                    {submitStatus.message}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-8 bg-[#B35A38] hover:bg-[#8B4225] text-white font-semibold py-3 px-6 uppercase tracking-wider transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Complete Booking
                  </>
                )}
              </button>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="bg-white border border-green-400 p-8">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-100 border border-green-400">
                  <CheckCircle size={32} className="text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 mb-1">Booking Confirmed</p>
                  <p className="text-green-700">{submitStatus?.message || "Your booking has been confirmed."}</p>
                </div>
              </div>
            </div>

            <section className="bg-white border border-gray-300 p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Active Booking</h2>
                <span className="px-3 py-1 text-sm font-semibold text-green-700 bg-green-100 border border-green-300">
                  {activeBooking?.status || "Active"}
                </span>
              </div>

              <div className="bg-gray-50 border border-gray-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 text-[#B35A38]"><CheckCircle size={18} /></div>
                    <div>
                      <p className="text-gray-500">Booking ID</p>
                      <p className="font-semibold text-gray-900">{activeBooking?.id || bookingId}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 text-[#B35A38]"><Truck size={18} /></div>
                    <div>
                      <p className="text-gray-500">Service</p>
                      <p className="font-semibold text-gray-900">{activeBooking?.service}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 text-[#B35A38]"><MapPin size={18} /></div>
                    <div>
                      <p className="text-gray-500">Pickup</p>
                      <p className="font-semibold text-gray-900">{activeBooking?.pickupLocation}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 text-[#B35A38]"><MapPin size={18} /></div>
                    <div>
                      <p className="text-gray-500">Destination</p>
                      <p className="font-semibold text-gray-900">{activeBooking?.destinationLocation}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 text-[#B35A38]"><Calendar size={18} /></div>
                    <div>
                      <p className="text-gray-500">Date</p>
                      <p className="font-semibold text-gray-900">{activeBooking?.date}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 text-[#B35A38]"><Clock size={18} /></div>
                    <div>
                      <p className="text-gray-500">Time</p>
                      <p className="font-semibold text-gray-900">{activeBooking?.time}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 text-[#B35A38]"><Users size={18} /></div>
                    <div>
                      <p className="text-gray-500">Passengers</p>
                      <p className="font-semibold text-gray-900">{activeBooking?.passengers}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 text-[#B35A38]"><Car size={18} /></div>
                    <div>
                      <p className="text-gray-500">Vehicle</p>
                      <p className="font-semibold text-gray-900">{activeBooking?.vehicleType}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 text-[#B35A38]"><Phone size={18} /></div>
                    <div>
                      <p className="text-gray-500">Contact</p>
                      <p className="font-semibold text-gray-900">{activeBooking?.phoneNumber}</p>
                    </div>
                  </div>
                  {activeBooking?.flightNumber && (
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 text-[#B35A38]"><Plane size={18} /></div>
                      <div>
                        <p className="text-gray-500">Flight Number</p>
                        <p className="font-semibold text-gray-900">{activeBooking.flightNumber}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section className="bg-white border border-gray-300 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Reserve Booking Payment</h2>
              <div className="border border-gray-200 bg-gray-50 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-gray-600">Reservation Fee</p>
                  <p className="text-xl font-bold text-gray-900">{formatKesFromCents(activeBooking?.reservationAmount || 0)}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-gray-600">Payment Status</p>
                  <span
                    className={`px-3 py-1 text-xs font-semibold border uppercase ${
                      activeBooking?.paymentStatus === "paid"
                        ? "bg-green-100 text-green-700 border-green-300"
                        : "bg-yellow-100 text-yellow-700 border-yellow-300"
                    }`}
                  >
                    {activeBooking?.paymentStatus || "unpaid"}
                  </span>
                </div>
                {activeBooking?.paymentReference && (
                  <div>
                    <p className="text-gray-500 text-sm">Reference</p>
                    <p className="font-semibold text-gray-900 break-all">{activeBooking.paymentReference}</p>
                  </div>
                )}
              </div>

              {paymentFeedback && (
                <div
                  className={`p-4 mt-4 border ${
                    paymentFeedback.type === "success"
                      ? "bg-green-50 border-green-400 text-green-700"
                      : "bg-red-50 border-red-400 text-red-700"
                  }`}
                >
                  {paymentFeedback.message}
                </div>
              )}

              <button
                type="button"
                disabled={isPaying || activeBooking?.paymentStatus === "paid"}
                onClick={handleReserveBookingPayment}
                className="mt-5 inline-flex items-center gap-2 px-6 py-3 bg-[#B35A38] hover:bg-[#8B4225] text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isPaying ? <Loader size={18} className="animate-spin" /> : <CreditCard size={18} />}
                {activeBooking?.paymentStatus === "paid" ? "Reservation Paid" : "Pay with Paystack"}
              </button>
            </section>

            <div className="flex flex-col md:flex-row gap-3">
              <button
                type="button"
                onClick={handleBookAnother}
                className="px-6 py-3 bg-[#B35A38] hover:bg-[#8B4225] text-white font-semibold transition-colors"
              >
                Book Another Ride
              </button>
              <button
                type="button"
                onClick={onBack}
                className="px-6 py-3 border border-gray-300 text-gray-900 hover:bg-gray-100 font-semibold transition-colors"
              >
                Back to Services
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

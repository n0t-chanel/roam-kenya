import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json"
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ success: false, error: "Method not allowed" }), {
      status: 405,
      headers: corsHeaders
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey =
      Deno.env.get("SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");

    if (!supabaseUrl || !serviceRoleKey || !paystackSecretKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing SUPABASE_URL, SERVICE_ROLE_KEY/SUPABASE_SERVICE_ROLE_KEY, or PAYSTACK_SECRET_KEY."
        }),
        { status: 500, headers: corsHeaders }
      );
    }

    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "").trim();
    if (!token) {
      return new Response(JSON.stringify({ success: false, error: "Missing auth token." }), {
        status: 401,
        headers: corsHeaders
      });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey);
    const { data: userData, error: userError } = await admin.auth.getUser(token);
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ success: false, error: "Unauthorized request." }), {
        status: 401,
        headers: corsHeaders
      });
    }

    const userId = userData.user.id;
    const { bookingId } = await req.json();

    if (!bookingId) {
      return new Response(JSON.stringify({ success: false, error: "bookingId is required." }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const { data: booking, error: bookingError } = await admin
      .from("bookings")
      .select(
        "id, user_id, status, payment_status, price_amount, refund_status, refund_eligible_at, refund_due_at"
      )
      .eq("id", bookingId)
      .eq("user_id", userId)
      .maybeSingle();

    if (bookingError || !booking) {
      return new Response(JSON.stringify({ success: false, error: "Booking not found." }), {
        status: 404,
        headers: corsHeaders
      });
    }

    if (booking.status !== "cancelled" || booking.payment_status !== "paid") {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Refund is only available for cancelled paid reservations."
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    if (!booking.refund_eligible_at || new Date().getTime() < new Date(booking.refund_eligible_at).getTime()) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Refund is not yet eligible. It can only be processed after 24 hours.",
          refundEligibleAt: booking.refund_eligible_at
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    if (booking.refund_status === "refunded") {
      return new Response(
        JSON.stringify({ success: true, message: "Refund was already processed.", booking }),
        { status: 200, headers: corsHeaders }
      );
    }

    const { data: payment, error: paymentError } = await admin
      .from("payments")
      .select("id, reference, amount, status, paystack_response")
      .eq("booking_id", bookingId)
      .eq("user_id", userId)
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (paymentError || !payment?.reference) {
      return new Response(
        JSON.stringify({ success: false, error: "Completed payment reference not found for this booking." }),
        { status: 404, headers: corsHeaders }
      );
    }

    const refundResponse = await fetch("https://api.paystack.co/refund", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        transaction: payment.reference,
        amount: booking.price_amount || payment.amount
      })
    });

    const refundPayload = await refundResponse.json().catch(() => null);
    if (!refundResponse.ok || !refundPayload?.status) {
      return new Response(
        JSON.stringify({
          success: false,
          error: refundPayload?.message || "Failed to initiate refund with Paystack."
        }),
        { status: 500, headers: corsHeaders }
      );
    }

    const refundData = refundPayload.data || {};
    const normalizedRefundStatus =
      refundData.status === "processed" || refundData.status === "success" ? "refunded" : "processing";
    const refundReference =
      refundData.transaction_reference ||
      refundData.reference ||
      refundData.id?.toString() ||
      payment.reference;

    const { error: paymentUpdateError } = await admin
      .from("payments")
      .update({
        status: normalizedRefundStatus === "refunded" ? "refunded" : "refund_pending",
        paystack_response: {
          ...(payment.paystack_response || {}),
          refund: refundPayload
        },
        updated_at: new Date().toISOString()
      })
      .eq("id", payment.id);

    if (paymentUpdateError) {
      return new Response(
        JSON.stringify({ success: false, error: paymentUpdateError.message }),
        { status: 500, headers: corsHeaders }
      );
    }

    const bookingUpdate = {
      refund_status: normalizedRefundStatus,
      refund_reference: refundReference,
      refund_processed_at: normalizedRefundStatus === "refunded" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString()
    };

    const { data: updatedBooking, error: bookingUpdateError } = await admin
      .from("bookings")
      .update(bookingUpdate)
      .eq("id", bookingId)
      .eq("user_id", userId)
      .select("*")
      .single();

    if (bookingUpdateError) {
      return new Response(
        JSON.stringify({ success: false, error: bookingUpdateError.message }),
        { status: 500, headers: corsHeaders }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message:
          normalizedRefundStatus === "refunded"
            ? "Refund processed successfully."
            : "Refund initiated. Paystack may take up to 5 business days.",
        booking: updatedBooking
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        success: false,
        error: err instanceof Error ? err.message : "Unexpected refund processing error."
      }),
      { status: 500, headers: corsHeaders }
    );
  }
});


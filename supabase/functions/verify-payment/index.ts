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
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");

    if (!supabaseUrl || !supabaseServiceRoleKey || !paystackSecretKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, or PAYSTACK_SECRET_KEY."
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

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ success: false, error: "Unauthorized request." }), {
        status: 401,
        headers: corsHeaders
      });
    }

    const userId = userData.user.id;
    const body = await req.json();
    const reference = String(body?.reference || "").trim();
    const bookingId = String(body?.bookingId || "").trim();
    const expectedAmount = Number(body?.expectedAmount || 0);

    if (!reference || !bookingId) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing reference or bookingId." }),
        { status: 400, headers: corsHeaders }
      );
    }

    const verifyResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        "Content-Type": "application/json"
      }
    });

    const verifyPayload = await verifyResponse.json();
    if (!verifyResponse.ok || !verifyPayload?.status || !verifyPayload?.data) {
      return new Response(
        JSON.stringify({
          success: false,
          error: verifyPayload?.message || "Paystack verification request failed."
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    const transaction = verifyPayload.data;
    if (transaction.status !== "success") {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Payment is not successful. Current status: ${transaction.status}`
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    const metadataBookingId = String(transaction?.metadata?.bookingId || bookingId).trim();
    if (metadataBookingId !== bookingId) {
      return new Response(
        JSON.stringify({ success: false, error: "Booking mismatch in payment metadata." }),
        { status: 400, headers: corsHeaders }
      );
    }

    const paidAmount = Number(transaction.amount || 0);
    if (expectedAmount > 0 && paidAmount !== expectedAmount) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Amount mismatch. Expected ${expectedAmount}, received ${paidAmount}.`
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    const { data: booking, error: bookingFetchError } = await supabaseAdmin
      .from("bookings")
      .select("id, user_id")
      .eq("id", bookingId)
      .eq("user_id", userId)
      .maybeSingle();

    if (bookingFetchError || !booking) {
      return new Response(
        JSON.stringify({ success: false, error: "Booking not found for this user." }),
        { status: 404, headers: corsHeaders }
      );
    }

    const { error: paymentUpsertError } = await supabaseAdmin
      .from("payments")
      .upsert(
        {
          booking_id: bookingId,
          user_id: userId,
          amount: paidAmount,
          payment_method: transaction.channel || "paystack",
          reference,
          status: "completed",
          paystack_response: verifyPayload,
          updated_at: new Date().toISOString()
        },
        { onConflict: "reference" }
      );

    if (paymentUpsertError) {
      return new Response(
        JSON.stringify({ success: false, error: paymentUpsertError.message }),
        { status: 500, headers: corsHeaders }
      );
    }

    const { error: bookingUpdateError } = await supabaseAdmin
      .from("bookings")
      .update({
        payment_status: "paid",
        price_amount: paidAmount,
        status: "confirmed",
        updated_at: new Date().toISOString()
      })
      .eq("id", bookingId)
      .eq("user_id", userId);

    if (bookingUpdateError) {
      return new Response(
        JSON.stringify({ success: false, error: bookingUpdateError.message }),
        { status: 500, headers: corsHeaders }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Payment verified and booking reserved successfully.",
        reference,
        bookingId
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        success: false,
        error: err instanceof Error ? err.message : "Unexpected verification error."
      }),
      { status: 500, headers: corsHeaders }
    );
  }
});


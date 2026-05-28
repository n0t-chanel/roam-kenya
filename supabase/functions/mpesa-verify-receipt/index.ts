import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json"
};

const resolveMpesaBaseUrl = () => {
  const env = (Deno.env.get("MPESA_ENV") || "sandbox").toLowerCase();
  return env === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";
};

const getTimestamp = () => {
  const now = new Date();
  const pad = (value: number) => value.toString().padStart(2, "0");
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(
    now.getMinutes()
  )}${pad(now.getSeconds())}`;
};

const getMpesaAccessToken = async (baseUrl: string, consumerKey: string, consumerSecret: string) => {
  const credentials = btoa(`${consumerKey}:${consumerSecret}`);
  const response = await fetch(`${baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: {
      Authorization: `Basic ${credentials}`
    }
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.access_token) {
    const details = payload?.error_description || payload?.error || payload?.message || "Failed to get M-Pesa access token.";
    throw new Error(`M-Pesa token error (${response.status}): ${details}`);
  }

  return payload.access_token as string;
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
    const consumerKey = Deno.env.get("MPESA_CONSUMER_KEY");
    const consumerSecret = Deno.env.get("MPESA_CONSUMER_SECRET");
    const passkey = Deno.env.get("MPESA_PASSKEY");
    const shortcode = Deno.env.get("MPESA_SHORTCODE");

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ success: false, error: "Missing Supabase credentials." }), {
        status: 500,
        headers: corsHeaders
      });
    }

    if (!consumerKey || !consumerSecret || !passkey || !shortcode) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET, MPESA_PASSKEY, or MPESA_SHORTCODE."
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
    const body = await req.json();
    const bookingId = String(body?.bookingId || "").trim();
    const receipt = String(body?.receipt || "").trim();
    const requestedStage = String(body?.paymentStage || "").trim();

    if (!bookingId || !receipt) {
      return new Response(
        JSON.stringify({ success: false, error: "bookingId and receipt are required." }),
        { status: 400, headers: corsHeaders }
      );
    }

    const { data: booking, error: bookingError } = await admin
      .from("bookings")
      .select("id, user_id")
      .eq("id", bookingId)
      .eq("user_id", userId)
      .maybeSingle();

    if (bookingError || !booking) {
      return new Response(JSON.stringify({ success: false, error: "Booking not found." }), {
        status: 404,
        headers: corsHeaders
      });
    }

    let paymentQuery = admin
      .from("payments")
      .select("id, payment_stage, payment_method, checkout_request_id, status")
      .eq("booking_id", bookingId)
      .eq("payment_method", "mpesa")
      .order("created_at", { ascending: false })
      .limit(1);

    if (requestedStage) {
      paymentQuery = paymentQuery.eq("payment_stage", requestedStage);
    }

    const { data: payment, error: paymentError } = await paymentQuery.maybeSingle();
    if (paymentError || !payment) {
      return new Response(JSON.stringify({ success: false, error: "M-Pesa payment record not found." }), {
        status: 404,
        headers: corsHeaders
      });
    }

    if (!payment.checkout_request_id) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing checkout request id for verification." }),
        { status: 400, headers: corsHeaders }
      );
    }

    const baseUrl = resolveMpesaBaseUrl();
    const accessToken = await getMpesaAccessToken(baseUrl, consumerKey, consumerSecret);
    const timestamp = getTimestamp();
    const password = btoa(`${shortcode}${passkey}${timestamp}`);

    const stkResponse = await fetch(`${baseUrl}/mpesa/stkpushquery/v1/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: payment.checkout_request_id
      })
    });

    const stkPayload = await stkResponse.json().catch(() => null);
    if (!stkResponse.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          error: stkPayload?.errorMessage || stkPayload?.error || "Failed to query M-Pesa status."
        }),
        { status: 500, headers: corsHeaders }
      );
    }

    if (stkPayload?.ResultCode !== "0" && stkPayload?.ResultCode !== 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: stkPayload?.ResultDesc || "M-Pesa payment not confirmed yet.",
          status: stkPayload?.ResultCode
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    const stage = payment.payment_stage || requestedStage || "reservation";
    const { error: paymentUpdateError } = await admin
      .from("payments")
      .update({
        status: "completed",
        provider_reference: receipt,
        paid_at: new Date().toISOString(),
        provider_payload: stkPayload,
        updated_at: new Date().toISOString()
      })
      .eq("id", payment.id);

    if (paymentUpdateError) {
      return new Response(JSON.stringify({ success: false, error: paymentUpdateError.message }), {
        status: 500,
        headers: corsHeaders
      });
    }

    const bookingUpdate = {
      payment_status: stage === "final" ? "paid" : "reservation_paid",
      payment_method: "mpesa",
      payment_stage: stage,
      payment_reference: receipt,
      updated_at: new Date().toISOString()
    };

    const { error: bookingUpdateError } = await admin
      .from("bookings")
      .update(bookingUpdate)
      .eq("id", bookingId)
      .eq("user_id", userId);

    if (bookingUpdateError) {
      return new Response(JSON.stringify({ success: false, error: bookingUpdateError.message }), {
        status: 500,
        headers: corsHeaders
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Payment confirmed.",
        receipt
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        success: false,
        error: err instanceof Error ? err.message : "Unexpected M-Pesa verification error."
      }),
      { status: 500, headers: corsHeaders }
    );
  }
});
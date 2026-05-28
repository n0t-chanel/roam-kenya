import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json"
};

const normalizePhone = (phone: string) => {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("254")) return digits;
  if (digits.startsWith("0")) return `254${digits.slice(1)}`;
  return digits;
};

const resolveMpesaBaseUrl = () => {
  const env = (Deno.env.get("MPESA_ENV") || "sandbox").toLowerCase();
  return env === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";
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

const getTimestamp = () => {
  const now = new Date();
  const pad = (value: number) => value.toString().padStart(2, "0");
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(
    now.getMinutes()
  )}${pad(now.getSeconds())}`;
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
    const callbackUrl = Deno.env.get("MPESA_CALLBACK_URL");

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ success: false, error: "Missing Supabase credentials." }), {
        status: 500,
        headers: corsHeaders
      });
    }

    if (!consumerKey || !consumerSecret || !passkey || !shortcode || !callbackUrl) {
      return new Response(
        JSON.stringify({
          success: false,
          error:
            "Missing MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET, MPESA_PASSKEY, MPESA_SHORTCODE, or MPESA_CALLBACK_URL."
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
    const amount = Number(body?.amount || 0);
    const rawPhone = String(body?.phone || "").trim();
    const paymentStage = String(body?.paymentStage || "reservation").trim();

    if (!bookingId || !rawPhone || !Number.isFinite(amount) || amount <= 0) {
      return new Response(
        JSON.stringify({ success: false, error: "bookingId, phone, and amount are required." }),
        { status: 400, headers: corsHeaders }
      );
    }

    if (!["reservation", "final"].includes(paymentStage)) {
      return new Response(JSON.stringify({ success: false, error: "Invalid payment stage." }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const { data: booking, error: bookingError } = await admin
      .from("bookings")
      .select("id, user_id, price_amount, total_price")
      .eq("id", bookingId)
      .eq("user_id", userId)
      .maybeSingle();

    if (bookingError || !booking) {
      return new Response(JSON.stringify({ success: false, error: "Booking not found." }), {
        status: 404,
        headers: corsHeaders
      });
    }

    const normalizedPhone = normalizePhone(rawPhone);
    const reference = `mpesa_${bookingId.replace(/-/g, "").slice(0, 10)}_${Date.now()}`;

    const { error: insertError } = await admin.from("payments").insert({
      booking_id: bookingId,
      user_id: userId,
      amount,
      payment_method: "mpesa",
      payment_stage: paymentStage,
      reference,
      status: "pending",
      phone: normalizedPhone,
      provider_payload: null
    });

    if (insertError) {
      return new Response(JSON.stringify({ success: false, error: insertError.message }), {
        status: 500,
        headers: corsHeaders
      });
    }

    const baseUrl = resolveMpesaBaseUrl();
    const accessToken = await getMpesaAccessToken(baseUrl, consumerKey, consumerSecret);
    const timestamp = getTimestamp();
    const password = btoa(`${shortcode}${passkey}${timestamp}`);

    const stkResponse = await fetch(`${baseUrl}/mpesa/stkpush/v1/processrequest`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: Math.round(amount / 100),
        PartyA: normalizedPhone,
        PartyB: shortcode,
        PhoneNumber: normalizedPhone,
        CallBackURL: callbackUrl,
        AccountReference: reference,
        TransactionDesc: `Roam Kenya ${paymentStage} payment`
      })
    });

    const stkPayload = await stkResponse.json().catch(() => null);
    if (!stkResponse.ok || !stkPayload?.CheckoutRequestID) {
      console.error("M-Pesa STK error", {
        status: stkResponse.status,
        payload: stkPayload
      });
      await admin
        .from("payments")
        .update({
          status: "failed",
          provider_payload: stkPayload,
          updated_at: new Date().toISOString()
        })
        .eq("reference", reference);

      return new Response(
        JSON.stringify({
          success: false,
          error: stkPayload?.errorMessage || stkPayload?.errorMessage || stkPayload?.error || "M-Pesa request failed."
        }),
        { status: 500, headers: corsHeaders }
      );
    }

    const { CheckoutRequestID, MerchantRequestID } = stkPayload;
    await admin
      .from("payments")
      .update({
        checkout_request_id: CheckoutRequestID,
        merchant_request_id: MerchantRequestID,
        provider_payload: stkPayload,
        updated_at: new Date().toISOString()
      })
      .eq("reference", reference);

    await admin
      .from("bookings")
      .update({
        payment_status: paymentStage === "final" ? "final_pending" : "reservation_pending",
        payment_method: "mpesa",
        payment_stage: paymentStage,
        payment_reference: reference,
        updated_at: new Date().toISOString()
      })
      .eq("id", bookingId)
      .eq("user_id", userId);

    return new Response(
      JSON.stringify({
        success: true,
        message: "M-Pesa STK push initiated. Complete the prompt on your phone.",
        reference,
        checkoutRequestId: CheckoutRequestID,
        merchantRequestId: MerchantRequestID
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        success: false,
        error: err instanceof Error ? err.message : "Unexpected M-Pesa initiation error."
      }),
      { status: 500, headers: corsHeaders }
    );
  }
});

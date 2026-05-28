import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json"
};

const extractCallbackValue = (items: Array<{ Name: string; Value?: string | number }>, name: string) => {
  const match = items?.find((item) => item.Name === name);
  return match?.Value;
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

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ success: false, error: "Missing Supabase credentials." }), {
        status: 500,
        headers: corsHeaders
      });
    }

    const payload = await req.json().catch(() => null);
    const stkCallback = payload?.Body?.stkCallback;
    if (!stkCallback) {
      return new Response(JSON.stringify({ success: false, error: "Invalid callback payload." }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const checkoutRequestId = String(stkCallback.CheckoutRequestID || "").trim();
    const merchantRequestId = String(stkCallback.MerchantRequestID || "").trim();
    const resultCode = Number(stkCallback.ResultCode);
    const resultDesc = String(stkCallback.ResultDesc || "");
    const metadataItems = stkCallback.CallbackMetadata?.Item || [];
    const receiptNumber = extractCallbackValue(metadataItems, "MpesaReceiptNumber");
    const amount = extractCallbackValue(metadataItems, "Amount");
    const phone = extractCallbackValue(metadataItems, "PhoneNumber");
    const transactionDate = extractCallbackValue(metadataItems, "TransactionDate");

    const admin = createClient(supabaseUrl, serviceRoleKey);
    const { data: payment, error: paymentError } = await admin
      .from("payments")
      .select("id, booking_id, payment_stage, payment_method")
      .or(
        `checkout_request_id.eq.${checkoutRequestId},merchant_request_id.eq.${merchantRequestId}`
      )
      .maybeSingle();

    if (paymentError || !payment) {
      return new Response(JSON.stringify({ success: false, error: "Payment record not found." }), {
        status: 404,
        headers: corsHeaders
      });
    }

    const isSuccess = resultCode === 0;
    const status = isSuccess ? "completed" : "failed";

    const { error: paymentUpdateError } = await admin
      .from("payments")
      .update({
        status,
        provider_reference: receiptNumber?.toString() || null,
        phone: phone?.toString() || null,
        amount: amount ? Math.round(Number(amount) * 100) : undefined,
        provider_payload: payload,
        paid_at: isSuccess ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq("id", payment.id);

    if (paymentUpdateError) {
      return new Response(JSON.stringify({ success: false, error: paymentUpdateError.message }), {
        status: 500,
        headers: corsHeaders
      });
    }

    if (isSuccess) {
      const bookingUpdate = {
        payment_status: payment.payment_stage === "final" ? "paid" : "reservation_paid",
        payment_method: payment.payment_method || "mpesa",
        payment_reference: receiptNumber?.toString() || null,
        payment_stage: payment.payment_stage,
        updated_at: new Date().toISOString()
      };

      const { error: bookingUpdateError } = await admin
        .from("bookings")
        .update(bookingUpdate)
        .eq("id", payment.booking_id);

      if (bookingUpdateError) {
        return new Response(JSON.stringify({ success: false, error: bookingUpdateError.message }), {
          status: 500,
          headers: corsHeaders
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: resultDesc || (isSuccess ? "Payment confirmed." : "Payment failed."),
        resultCode
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        success: false,
        error: err instanceof Error ? err.message : "Unexpected callback handling error."
      }),
      { status: 500, headers: corsHeaders }
    );
  }
});

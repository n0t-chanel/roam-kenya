# Email Integration Setup Guide

## Overview
This guide walks you through setting up the Resend email integration for booking confirmations.

## What's Been Done (Client Side)
✅ Created `src/lib/emailService.js` - Email service helper
✅ Updated `BookingForm.jsx` - Now sends emails after bookings are created
✅ Integrated with Supabase edge functions

## What You Need to Do (Create Edge Function)

### Step 1: Create the Edge Function in Supabase Dashboard

1. Go to your Supabase project: https://app.supabase.com
2. Navigate to: **Edge Functions** (left sidebar)
3. Click **+ Create a new function**
4. Name it: `send-booking-email`
5. Choose **TypeScript** template
6. Copy and paste the code below:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

interface BookingEmailRequest {
  bookingId: string;
  userEmail: string;
  userName: string;
  pickupLocation: string;
  destinationLocation: string;
  pickupDate: string;
  pickupTime: string;
  passengers: number;
  vehicleType: string;
  flightNumber?: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload: BookingEmailRequest = await req.json();
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    if (!payload.userEmail) {
      throw new Error("userEmail is required");
    }

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "booking@roamkenya.com",
        to: payload.userEmail,
        subject: `✅ Booking Confirmed - Roam Kenya Transfer #${payload.bookingId.substring(0, 8)}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #1A1A1A 0%, #B35A38 100%); color: white; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
              <h1 style="margin: 0; font-size: 28px;">✅ Booking Confirmed</h1>
              <p style="margin: 5px 0 0 0; opacity: 0.9;">Roam Kenya - Premium Chauffeur Transfer</p>
            </div>

            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #1A1A1A; margin-top: 0;">Your Booking Details</h2>
              <p style="margin: 10px 0; line-height: 1.8;">
                <strong>Booking ID:</strong> ${payload.bookingId.substring(0, 8)}<br>
                <strong>Passenger:</strong> ${payload.userName}<br>
                <strong>Passengers:</strong> ${payload.passengers}<br>
                <strong>Vehicle Class:</strong> ${payload.vehicleType}<br>
                <strong>Date:</strong> ${new Date(payload.pickupDate).toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}<br>
                <strong>Time:</strong> ${payload.pickupTime}<br>
                ${payload.flightNumber ? `<strong>Flight Number:</strong> ${payload.flightNumber}<br>` : ""}
                <strong>Pickup Location:</strong> ${payload.pickupLocation}<br>
                <strong>Destination:</strong> ${payload.destinationLocation}
              </p>
            </div>

            <div style="background: #e8f4f8; padding: 15px; border-left: 4px solid #B35A38; border-radius: 4px; margin-bottom: 20px;">
              <p style="margin: 0; color: #1A1A1A;">
                <strong>ℹ️ What's Next?</strong><br>
                Our driver will contact you shortly. If you provided a flight number, we'll track your arrival in real-time and have your driver ready at the airport.
              </p>
            </div>

            <div style="text-align: center; padding-top: 20px; border-top: 1px solid #ddd;">
              <p style="color: #666; font-size: 12px;">
                Need to modify your booking? <a href="https://roamkenya.com/bookings" style="color: #B35A38; text-decoration: none;">Manage Booking</a><br>
                Contact us: <a href="https://wa.me/254705416781" style="color: #B35A38; text-decoration: none;">WhatsApp Support</a>
              </p>
            </div>
          </div>
        `,
      }),
    });

    const emailData = await emailResponse.json();

    if (!emailResponse.ok) {
      throw new Error(\`Resend API error: \${JSON.stringify(emailData)}\`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Email sent successfully",
        emailId: emailData.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Email sending error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to send email",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
```

### Step 2: Set Up the Secret in Supabase

1. In Supabase dashboard, go to: **Settings** → **Secrets**
2. Add a new secret:
   - Name: `RESEND_API_KEY`
   - Value: Your Resend API key (get from https://resend.com)
3. Click **Add secret**

### Step 3: Deploy the Function

1. Click **Deploy** button in the edge function editor
2. Wait for the deployment to complete (you'll see a green checkmark)

### Step 4: Test the Integration

1. Go to your booking form: http://localhost:5173/booking
2. Fill in the booking form
3. Submit a booking
4. Check your **browser console** (F12) for logs:
   - Should see: `📧 Sending booking confirmation email...`
   - Should see: `✅ Email sent successfully`
5. Check your email inbox for the booking confirmation

## Troubleshooting

### Email not sending?
1. **Check Resend API Key**: Make sure `RESEND_API_KEY` is set correctly in Supabase secrets
2. **Check sender email**: Must be verified in Resend dashboard (https://resend.com)
3. **Check browser console**: Look for error messages

### Error: "RESEND_API_KEY is not configured"
- Go to Supabase Settings → Secrets
- Ensure `RESEND_API_KEY` is added
- Redeploy the edge function after adding the secret

### Error: "The following email address is not verified"
- Go to Resend dashboard
- Verify your sending email address (`booking@roamkenya.com` or your custom domain)

## Email Template Customization

To customize the email template, edit the `html` section in the edge function code:
- Change colors (currently using `#1A1A1A`, `#B35A38`)
- Add your company logo
- Modify message text
- Change support links

## Flow Diagram

```
User books → BookingForm.jsx
     ↓
Booking created in database
     ↓
sendBookingEmail() called
     ↓
Calls Supabase edge function
     ↓
Edge function uses RESEND_API_KEY
     ↓
Resend API sends email to user
     ↓
User receives booking confirmation
```

## Files Modified

- ✅ `src/lib/emailService.js` - Email service helper
- ✅ `src/components/BookingForm.jsx` - Integrated email sending

## Next Steps

After emails are working:
1. Monitor email delivery in Resend dashboard
2. Add more email templates (cancellation, status updates, etc.)
3. Set up automatic email reminders before pickup
4. Integrate Paystack payment notifications


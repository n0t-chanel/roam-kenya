# Fixing Email & Flight Tracking Issues

## Issue 1: Email Not Being Sent

The booking form shows a hardcoded message but doesn't actually send emails. You have 3 options:

### Option A: Use Supabase Email (Simplest)
Supabase has built-in email sending, but it's limited.

### Option B: Use Brevo (Formerly SendinBlue) - FREE
```
- 300 emails/day free
- Good for Kenya
- Easy integration
- No credit card needed
```

### Option C: Use Resend - RECOMMENDED
```
- 100 emails/day free
- Modern API
- React-friendly
- Easy setup
```

---

## 🚀 Quick Fix: Use Supabase Edge Function for Email

This is the easiest option for your current setup.

### Step 1: Create Supabase Email Function

Go to Supabase Dashboard → Functions → Create a new function

**Name:** `send-booking-email`

**Code:**
```typescript
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

Deno.serve(async (req) => {
  try {
    // Parse request body
    const { bookingId, userEmail, bookingDetails } = await req.json()

    // Validate required fields
    if (!bookingId || !userEmail) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Send email
    const result = await resend.emails.send({
      from: 'noreply@roamkenya.com',
      to: userEmail,
      subject: `Booking Confirmation #${bookingId.slice(0, 8).toUpperCase()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Booking Confirmed! ✅</h2>
          <p>Your booking has been successfully created.</p>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Booking Details</h3>
            <p><strong>Booking ID:</strong> ${bookingId}</p>
            <p><strong>From:</strong> ${bookingDetails.pickup_location}</p>
            <p><strong>To:</strong> ${bookingDetails.destination_location}</p>
            <p><strong>Date:</strong> ${bookingDetails.booking_date}</p>
            <p><strong>Time:</strong> ${bookingDetails.pickup_time}</p>
            <p><strong>Vehicle:</strong> ${bookingDetails.vehicle_type}</p>
            <p><strong>Passengers:</strong> ${bookingDetails.passengers}</p>
            ${bookingDetails.flight_number ? `<p><strong>Flight Number:</strong> ${bookingDetails.flight_number}</p>` : ''}
          </div>

          <p>We will send you another confirmation once a driver is assigned.</p>
          <p>Thank you for choosing Roam Kenya!</p>
        </div>
      `
    })

    // Log result
    console.log('Email sent:', result)

    return new Response(
      JSON.stringify({ success: true, result }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Email error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
```

### Step 2: Get Resend API Key

1. Go to https://resend.com
2. Sign up for free account
3. Go to API Keys
4. Copy your API key
5. Add to Supabase function environment variables

### Step 3: Deploy Function

```bash
supabase functions deploy send-booking-email
```

### Step 4: Update BookingForm to Call Email Function

Edit: `src/components/BookingForm.jsx`

Add after line 95 (after saving booking):

```javascript
// Send confirmation email
try {
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-booking-email`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        bookingId: bid,
        userEmail: user.email,
        bookingDetails: bookingPayload
      })
    }
  )
  
  if (!response.ok) {
    console.warn('Email sending failed, but booking was successful')
  }
} catch (emailErr) {
  console.warn('Email error:', emailErr)
  // Don't fail the booking if email fails
}
```

---

## 🛩️ Issue 2: Flight Tracking Showing "Unavailable"

The issue is that **flight tracking is only triggered if a flight number is provided**, and there's a catch block that shows "unavailable".

### Root Cause

Line 105-117 in BookingForm.jsx:
```javascript
if (formData.flightNumber.trim()) {
  try {
    await trackFlight(formData.flightNumber);
    // ... shows "Flight tracking active"
  } catch (trackErr) {
    // Shows "Flight tracking unavailable"
  }
} else {
  // Shows just booking confirmed (no flight tracking)
}
```

### Fix: Check Why trackFlight is Failing

Edit: `src/hooks/useFlightTracking.js`

Add error logging in the `trackFlight` function:

```javascript
const trackFlight = async (flightNum) => {
  try {
    setError(null)
    setLoading(true)

    console.log('Starting flight tracking for:', flightNum) // ADD THIS

    const { data, error: err } = await supabase
      .from('flight_bookings')
      .upsert({
        booking_id: bookingId,
        flight_number: flightNum,
        tracking_status: 'waiting',
        updated_at: new Date()
      }, {
        onConflict: 'booking_id'
      })
      .select()

    if (err) {
      console.error('Flight tracking error:', err) // ADD THIS
      throw err
    }
    
    console.log('Flight tracking started:', data) // ADD THIS
    return data
  } catch (err) {
    const message = err.message || 'Failed to track flight'
    console.error('trackFlight exception:', message) // ADD THIS
    setError(message)
    throw err
  } finally {
    setLoading(false)
  }
}
```

Then:
1. Open browser console (F12)
2. Create a booking with flight number "KQ102"
3. Check console for the logged errors
4. This will tell you exactly why it's failing

---

## 🔧 Most Likely Issues with Flight Tracking

### Issue A: Flight Booking Insert Failing
**Check:** RLS policy for flight_bookings table

```sql
-- Supabase SQL Editor
SELECT * FROM flight_bookings LIMIT 1;

-- If you get "permission denied", the RLS policy is blocking you
-- Fix: Run this
CREATE POLICY "Service role can insert flight bookings"
  ON flight_bookings FOR INSERT
  WITH CHECK (TRUE);
```

### Issue B: Booking ID Not Passed Correctly
The `bookingId` state might be null when `trackFlight` is called.

**Fix:** Pass booking ID to trackFlight:

Edit: `src/components/BookingForm.jsx` line 107:
```javascript
// OLD:
await trackFlight(formData.flightNumber);

// NEW: Pass booking ID explicitly
const { trackFlight: track } = useFlightTracking(null, bid);
await track(formData.flightNumber);
```

Actually, better fix - update the hook call at line 16:

```javascript
// OLD:
const { trackFlight, flightBooking, getFlightStatus, loading: trackingLoading } = useFlightTracking(null, bookingId);

// BETTER: Create new hook instance after getting booking ID
```

### Issue C: Supabase Connection Issues
Check if you're connected to Supabase:

```javascript
// Add this at top of BookingForm.jsx
import { supabase } from '../lib/supabase'

// In handleSubmit, after booking saved:
const test = await supabase.from('flights').select().limit(1)
console.log('Supabase connected:', test)
```

---

## ✅ Complete Fix Steps

### Step 1: Test Flight Tracking First
```javascript
// Browser console (F12):
import { supabase } from './src/lib/supabase'

// Check if can write to flight_bookings
const { data, error } = await supabase
  .from('flight_bookings')
  .insert({
    booking_id: 'eac3a3ff-506c-451a-a281-21edc0e2c8f8', // Your booking ID
    flight_number: 'KQ102',
    tracking_status: 'waiting'
  })

console.log('Result:', { data, error })
```

If you get permission error, you need to fix RLS policies.

### Step 2: Fix RLS Policies
```sql
-- Supabase SQL Editor

-- Allow authenticated users to insert flight_bookings
DROP POLICY IF EXISTS "Users can create flight bookings" ON flight_bookings;
CREATE POLICY "Users can create flight bookings" ON flight_bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Also allow service role (for edge functions)
DROP POLICY IF EXISTS "Service role can insert flight bookings" ON flight_bookings;
CREATE POLICY "Service role can insert flight bookings" ON flight_bookings
  FOR INSERT USING (TRUE);
```

### Step 3: Set Up Email
- Sign up at https://resend.com (free)
- Get API key
- Create Supabase function
- Update BookingForm.jsx

### Step 4: Test Everything
```
1. Create booking WITH flight number
2. Check browser console for errors
3. Check email inbox for confirmation
4. Check Supabase: SELECT * FROM flight_bookings
5. Should see new flight_bookings record
```

---

## 🧪 Quick Test: Manual Flight Tracking

If you want to test without the email setup first:

```sql
-- Supabase SQL Editor
-- Manually create a flight_bookings record

INSERT INTO flight_bookings (
  booking_id, 
  flight_number, 
  user_id, 
  tracking_status
) VALUES (
  'eac3a3ff-506c-451a-a281-21edc0e2c8f8',
  'KQ102',
  'your-user-id-here',
  'waiting'
);

-- Then check:
SELECT * FROM flight_bookings WHERE booking_id = 'eac3a3ff-506c-451a-a281-21edc0e2c8f8';
```

If this works, then flight tracking table is fine. The issue is with your app inserting the data.

---

## 📝 Summary of Changes Needed

| Issue | Solution | Time |
|-------|----------|------|
| Flight tracking unavailable | Add console logging to identify issue | 5 min |
| Flight booking RLS | Update RLS policies | 5 min |
| Email not sending | Set up Resend + Edge Function | 15 min |
| Email integration | Update BookingForm | 10 min |

**Total: ~35 minutes**

---

## 🆘 Debugging Steps

1. **Open browser console (F12)**
2. **Create a booking with flight "KQ102"**
3. **Look for error messages**
4. **Share the error message with me**

The error in the console will tell us exactly what's wrong!

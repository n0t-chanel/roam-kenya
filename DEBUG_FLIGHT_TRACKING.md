# 🧪 IMMEDIATE FIX - Flight Tracking Not Working

## The Problem

Flight tracking fails silently. The issue is likely **RLS policies** blocking the insert to `flight_bookings` table.

---

## ✅ Step 1: Check RLS Policies (5 minutes)

Go to **Supabase Dashboard → SQL Editor** and run:

```sql
-- Check current RLS policies on flight_bookings
SELECT schemaname, tablename, policyname, permissive, roles, qual, with_check
FROM pg_policies
WHERE tablename = 'flight_bookings'
ORDER BY policyname;
```

### What You Should See:
```
4 policies:
1. "Users can view own flight bookings"
2. "Users can create flight bookings"  
3. "Users can update own flight bookings"
4. (maybe) "Service role can insert flight bookings"
```

### If You See Errors or Missing Policies:

Run this fix:

```sql
-- Drop existing policies
DROP POLICY IF EXISTS "Users can create flight bookings" ON flight_bookings;
DROP POLICY IF EXISTS "Users can view own flight bookings" ON flight_bookings;
DROP POLICY IF EXISTS "Users can update own flight bookings" ON flight_bookings;

-- Create correct policies
CREATE POLICY "Users can view own flight bookings" ON flight_bookings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create flight bookings" ON flight_bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own flight bookings" ON flight_bookings
  FOR UPDATE USING (auth.uid() = user_id);

-- Also allow upsert
CREATE POLICY "Users can upsert own flight bookings" ON flight_bookings
  FOR UPDATE USING (auth.uid() = user_id);
```

---

## ✅ Step 2: Test Flight Tracking Insert (2 minutes)

Browser Console Test:

```javascript
// Open browser console (F12 → Console)
// Make sure you're logged in first!

import { supabase } from './src/lib/supabase'

// Get your user ID
const { data: { user } } = await supabase.auth.getSession()
console.log('Your user ID:', user.id)

// Get your booking ID from the success message
// or from this query:
const { data: bookings } = await supabase
  .from('bookings')
  .select('id')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false })
  .limit(1)

const bookingId = bookings[0].id
console.log('Your booking ID:', bookingId)

// Now try to insert a flight_bookings record
const { data, error } = await supabase
  .from('flight_bookings')
  .insert({
    booking_id: bookingId,
    user_id: user.id,
    flight_number: 'KQ102',
    tracking_status: 'waiting'
  })
  .select()

console.log('Flight booking result:', { data, error })

// If you get an error, paste it here so we can fix it!
```

### Expected Output:
```
✅ Success:
{
  data: [{
    id: '...',
    booking_id: '...',
    flight_number: 'KQ102',
    tracking_status: 'waiting',
    ...
  }],
  error: null
}
```

### Common Errors & Fixes:

**Error: "permission denied"**
→ RLS policy is blocking you. Run the fix from Step 1.

**Error: "violates foreign key constraint"**
→ The booking ID doesn't exist. Make sure booking was created first.

**Error: "duplicate key value violates unique constraint"**
→ Flight booking already exists for this booking. Delete it first:
```sql
DELETE FROM flight_bookings WHERE booking_id = 'your-booking-id';
```

---

## ✅ Step 3: Fix BookingForm.jsx (5 minutes)

The error handling is swallowing the real error. Let's add better logging:

Edit: `src/components/BookingForm.jsx`

Find line 105-118:
```javascript
// If flight number provided, start tracking
if (formData.flightNumber.trim()) {
  try {
    await trackFlight(formData.flightNumber);
    setSubmitStatus({
      type: 'success',
      message: `✅ Booking confirmed! Booking ID: ${bid}. Flight tracking active.`
    });
  } catch (trackErr) {
    console.error('Flight tracking failed:', trackErr);
    setSubmitStatus({
      type: 'success',
      message: `✅ Booking confirmed! Booking ID: ${bid}. (Flight tracking unavailable)`
    });
  }
}
```

Replace with:

```javascript
// If flight number provided, start tracking
if (formData.flightNumber.trim()) {
  try {
    console.log('Starting flight tracking for:', formData.flightNumber, 'Booking ID:', bid)
    await trackFlight(formData.flightNumber);
    console.log('✅ Flight tracking successful')
    setSubmitStatus({
      type: 'success',
      message: `✅ Booking confirmed! Booking ID: ${bid}. Flight tracking active.`
    });
  } catch (trackErr) {
    console.error('❌ Flight tracking failed:', trackErr.message);
    console.error('Full error:', trackErr);
    
    // Still show success for booking, but mention tracking failed
    setSubmitStatus({
      type: 'success',
      message: `✅ Booking confirmed! Booking ID: ${bid}.\n⚠️ Flight tracking failed: ${trackErr.message}`
    });
  }
}
```

---

## ✅ Step 4: Add Console Logging to useFlightTracking (5 minutes)

Edit: `src/hooks/useFlightTracking.js`

In the `trackFlight` function (around line 83), replace:

```javascript
const trackFlight = async (flightNum) => {
  try {
    setError(null)
    setLoading(true)

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

    if (err) throw err
    return data
  } catch (err) {
    const message = err.message || 'Failed to track flight'
    setError(message)
    throw err
  } finally {
    setLoading(false)
  }
}
```

With:

```javascript
const trackFlight = async (flightNum) => {
  try {
    setError(null)
    setLoading(true)

    console.log('🛫 trackFlight called with:', { flightNum, bookingId })

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

    console.log('🛫 trackFlight response:', { data, err })

    if (err) {
      console.error('🛫 trackFlight error:', err)
      throw err
    }
    
    console.log('✅ trackFlight success')
    return data
  } catch (err) {
    const message = err.message || 'Failed to track flight'
    console.error('🛫 trackFlight exception:', message)
    setError(message)
    throw err
  } finally {
    setLoading(false)
  }
}
```

---

## ✅ Step 5: Test Again

Now:

1. **Refresh the app**
2. **Create a new booking WITH a flight number (e.g., KQ102)**
3. **Open browser console (F12)**
4. **Look for the 🛫 logs**
5. **Tell me what you see in the console**

---

## 🎯 What Should Happen

### If Flight Tracking Works ✅
```
Console shows:
🛫 trackFlight called with: { flightNum: 'KQ102', bookingId: 'abc...' }
🛫 trackFlight response: { data: [{...}], err: null }
✅ trackFlight success

Message shows:
✅ Booking confirmed! Booking ID: abc...
  Flight tracking active.
```

### If RLS is Blocking ❌
```
Console shows:
🛫 trackFlight called with: { flightNum: 'KQ102', bookingId: 'abc...' }
🛫 trackFlight response: { data: null, err: {code: 'PGRST301', message: 'permission denied'} }
🛫 trackFlight error: permission denied

Message shows:
✅ Booking confirmed! Booking ID: abc...
⚠️ Flight tracking failed: permission denied
```

→ If you see this, run the RLS fix from Step 1.

### If Booking ID is Missing ❌
```
Console shows:
🛫 trackFlight called with: { flightNum: 'KQ102', bookingId: null }

Message shows error
```

→ The booking ID isn't being set. This is a state timing issue.

---

## 🆘 Next Steps Based on Error

### If "permission denied":
1. Run RLS policy fix (Step 1)
2. Try again

### If "bookingId is null":
1. The state update hasn't happened yet
2. Need to refactor useFlightTracking hook usage
3. Let me fix this for you

### If some other error:
1. Share the exact error message
2. We'll diagnose from there

---

## ⏭️ Once Flight Tracking Works

Then we'll set up email sending using Resend (free). See `EMAIL_AND_FLIGHT_TRACKING_FIX.md` for details.

---

**Let's debug! Follow these steps and tell me what the console shows.** 🚀

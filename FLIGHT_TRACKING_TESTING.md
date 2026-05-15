# Flight Tracking Testing Guide

## How to Test Flight Tracking

### Prerequisites
- ✅ Supabase tables created (from `SUPABASE_MIGRATIONS.sql`)
- ✅ `.env.local` configured with Supabase credentials
- ✅ `npm run dev` running on http://localhost:5173
- ✅ AviationStack API key set (either in `.env.local` or Edge Function config)

---

## 🧪 Testing Options

### Option 1: Full Manual Testing (Recommended for First Test)

**Step 1: Sign Up & Create Booking**
```
1. Go to http://localhost:5173/auth
2. Sign up with any email (e.g., test@example.com)
3. Go to http://localhost:5173/booking
4. Fill the form:
   - Pickup location: Nairobi
   - Destination: Jomo Kenyatta International Airport
   - Date: Tomorrow
   - Time: 10:00 AM
   - Vehicle: Economy Car
   - Flight number: KQ102 (real Kenya Airways flight)
5. Submit booking
6. Check browser console (F12 → Console) for errors
```

**Step 2: Verify Booking Created**
```
1. Go to Supabase Dashboard
2. Navigate to: SQL Editor
3. Run this query:
   SELECT * FROM bookings ORDER BY created_at DESC LIMIT 1;
4. You should see your booking record
```

**Step 3: Check Flight Tracking Started**
```
1. Still in Supabase SQL Editor, run:
   SELECT * FROM flight_bookings ORDER BY created_at DESC LIMIT 1;
2. Look for:
   - booking_id: matches your booking
   - flight_number: KQ102
   - tracking_status: 'waiting'
```

**Step 4: Monitor Real-Time Updates**
```
1. Go back to booking form page in browser
2. Open browser console (F12)
3. Look for log messages about flight tracking
4. Keep page open and watch for status updates
```

---

### Option 2: Manual Edge Function Trigger (Faster)

If you don't want to wait 5 minutes for automatic edge function run:

**Step 1: Create a test booking** (follow Option 1, Step 1)

**Step 2: Manually trigger tracking in browser console**
```javascript
// Open browser console (F12 → Console) and paste:

// Get your booking ID from the database first, then:
const bookingId = 'your-booking-id-here'

// Call the tracking endpoint manually:
fetch('https://YOUR_SUPABASE_URL/functions/v1/track-flights', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer YOUR_ANON_KEY`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ bookingId })
})
.then(r => r.json())
.then(data => console.log('Flight tracking triggered:', data))
.catch(err => console.error('Error:', err))
```

Replace:
- `YOUR_SUPABASE_URL` - From `.env.local` VITE_SUPABASE_URL
- `YOUR_ANON_KEY` - From `.env.local` VITE_SUPABASE_ANON_KEY

**Step 3: Check updates in Supabase**
```
SELECT * FROM flight_bookings WHERE booking_id = 'your-booking-id';
```

You should see `tracking_status` changed to 'in-air' or 'landed'

---

### Option 3: Direct Database Testing (Fastest)

Bypass the entire app and test database logic:

**Step 1: Insert test booking manually**
```sql
INSERT INTO bookings (
  id, user_id, pickup_location, destination, 
  travel_date, travel_time, vehicle_type, status
) VALUES (
  gen_random_uuid(), 
  'any-user-id', 
  'Nairobi', 
  'JKIA',
  NOW() + INTERVAL '1 day',
  '10:00',
  'Economy',
  'pending'
) RETURNING id;
```

Copy the returned `id`.

**Step 2: Manually create flight booking record**
```sql
INSERT INTO flight_bookings (
  id, booking_id, flight_number, 
  tracking_status, updated_at
) VALUES (
  gen_random_uuid(),
  'paste-booking-id-here',
  'KQ102',
  'waiting',
  NOW()
);
```

**Step 3: Verify and watch for updates**
```sql
-- Run this repeatedly to see status change
SELECT id, flight_number, tracking_status, updated_at 
FROM flight_bookings 
WHERE flight_number = 'KQ102';
```

---

## 🔍 Expected Flight Tracking Flow

### Real Flight (KQ102 - Kenya Airways)
```
1. Status: 'waiting' (when flight_booking created)
2. After edge function runs (5 min):
   - If flight not yet departed → 'waiting'
   - If flight in air → 'in-air'
   - If flight landed → 'landed' + auto_pickup_triggered = true
3. When landed → front-end gets notification
```

### Test Flight (Non-existent flight like "TEST101")
```
1. Flight won't be found in AviationStack API
2. tracking_status stays 'waiting'
3. No error - just no data (expected behavior)
```

---

## 🐛 Debugging Flight Tracking Issues

### Check 1: Is Edge Function Deployed?
```
Go to Supabase Dashboard → Functions → track-flights
Should show: "Deployed" status
```

### Check 2: Is Edge Function Running?
```
1. Go to: Functions → track-flights → Logs
2. Look for recent execution logs
3. Should see entries every 5 minutes
4. Check for errors in the logs
```

### Check 3: Is Realtime Enabled?
```
1. Go to: Supabase Dashboard → Realtime
2. Check if "flight_bookings" table is enabled
3. Status should show "Active"
```

### Check 4: Are Subscriptions Working?
```
Open browser console and check:
1. Any connection errors?
2. Subscription status in console logs?
3. Does useFlightTracking hook initialize?
```

### Check 5: Database Queries Working?
```
Test in Supabase SQL Editor:
SELECT * FROM bookings LIMIT 1;
SELECT * FROM flight_bookings LIMIT 1;
SELECT * FROM flights LIMIT 1;

All should return data without errors
```

### Check 6: API Key Valid?
```
Test AviationStack API in browser console:
fetch('https://api.aviationstack.com/v1/flights?access_key=06b2241c3d4ba5be64e16cb4ff8307ee&flight_iata=KQ102')
  .then(r => r.json())
  .then(d => console.log(d))
```

Should return flight data, not error.

---

## ✅ Success Indicators

When flight tracking is working correctly:

1. ✅ Booking created successfully in database
2. ✅ Flight booking record created with 'waiting' status
3. ✅ After edge function runs, status changes to 'in-air' or 'landed'
4. ✅ Frontend shows real-time status updates without page refresh
5. ✅ When flight lands, auto_pickup_triggered flag is set to true
6. ✅ No errors in browser console
7. ✅ No errors in Supabase edge function logs

---

## 🛩️ Real Kenya Airways Flights to Test

These flights are frequently active (check before testing):

| Flight | From | To | Airline |
|--------|------|-----|---------|
| KQ102 | Nairobi (NBO) | London (LHR) | Kenya Airways |
| KQ101 | London (LHR) | Nairobi (NBO) | Kenya Airways |
| KQ202 | Nairobi (NBO) | Amsterdam (AMS) | Kenya Airways |
| Q4 | Nairobi (NBO) | Brussels (BRU) | Qatar Airways |

**Note:** For live testing, use real flight numbers that are actively flying. Check flight tracker websites for current flights.

---

## 📊 Common Test Scenarios

### Scenario 1: User Booking with Immediate Flight Status Check
```
1. Create booking with flight KQ102
2. Immediately go to Supabase → flight_bookings
3. Status should be 'waiting'
4. Wait 1 minute, then refresh
5. Status might change if flight data is available
```

### Scenario 2: User Gets Real-Time Notification
```
1. Create booking on one browser tab
2. Open another tab to Supabase
3. Watch real-time updates in Supabase
4. See if frontend notifies user of status change
```

### Scenario 3: Auto-Pickup Trigger
```
1. Simulate landed flight by updating manually:
   UPDATE flight_bookings 
   SET tracking_status = 'landed' 
   WHERE flight_number = 'KQ102';
2. Check if auto_pickup_triggered is set to true
3. Check frontend shows pickup notification
```

---

## 📝 Test Checklist

- [ ] Signed up with test email
- [ ] Created test booking with real flight number
- [ ] Booking appears in `bookings` table
- [ ] Flight booking record created in `flight_bookings` table
- [ ] Initial status is 'waiting'
- [ ] Edge function has run at least once
- [ ] Flight status changed after edge function
- [ ] Real-time subscription received update
- [ ] Frontend shows flight status without page refresh
- [ ] Browser console has no errors
- [ ] Supabase logs show successful function execution

---

## 🆘 Still Having Issues?

1. Check FLIGHT_TRACKING_SETUP.md for full setup instructions
2. Verify all .env.local variables are set correctly
3. Check Supabase Dashboard for any RLS policy errors
4. Look at browser Network tab to see failed requests
5. Check browser console for JavaScript errors
6. Review Supabase edge function logs for server errors

**Need more help?** Check the QUICK_REFERENCE.md and ARCHITECTURE.md files for more context.

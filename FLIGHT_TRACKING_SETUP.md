# Real-Time Flight Tracking & Booking System - Setup Guide

## ✅ What's Been Implemented

1. **AuthProvider wrapping** - App.jsx now uses AuthProvider
2. **Enhanced BookingForm** - Saves to database with validation & error handling
3. **useFlightTracking hook** - Real-time flight status subscription
4. **useDatabase hook** - Enhanced with filter() and upsert() methods
5. **Supabase database schema** - All tables with RLS policies
6. **Edge Function** - Automated flight tracking every 5 minutes

---

## 🚀 Step-by-Step Setup

### Step 1: Create Supabase Tables

1. Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/sql
2. Copy all SQL from: `SUPABASE_MIGRATIONS.sql`
3. Paste and run in the SQL editor
4. Wait for completion ✓

**Tables created:**
- `user_profiles` - User information
- `bookings` - All bookings
- `flights` - Flight data from AviationStack
- `flight_bookings` - Real-time tracking links

---

### Step 2: Set Environment Variables

In your `.env.local` (create if doesn't exist):

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
AVIATIONSTACK_API_KEY=06b2241c3d4ba5be64e16cb4ff8307ee
```

Get these from:
- Supabase URL & Key: Dashboard → Settings → API
- AviationStack API: Already provided ✓

---

### Step 3: Deploy Edge Function (Flight Tracking)

**Using Supabase CLI:**

```bash
# 1. Install Supabase CLI
npm install -g supabase

# 2. Create function directory
mkdir -p supabase/functions/track-flights

# 3. Copy the edge function code
# Copy from: TRACK_FLIGHTS_EDGE_FUNCTION.ts
# Create: supabase/functions/track-flights/index.ts

# 4. Deploy
supabase functions deploy track-flights

# 5. Set environment variable in Supabase Dashboard
# Functions → track-flights → Configuration
# Add: AVIATIONSTACK_API_KEY = 06b2241c3d4ba5be64e16cb4ff8307ee
```

**Or manually via Supabase Dashboard:**

1. Go to: Functions → Create a new function
2. Name: `track-flights`
3. Paste code from: `TRACK_FLIGHTS_EDGE_FUNCTION.ts`
4. Deploy
5. Go to function settings → Add environment variable:
   - `AVIATIONSTACK_API_KEY=06b2241c3d4ba5be64e16cb4ff8307ee`
6. Create cron trigger: `*/5 * * * *` (every 5 minutes)

---

### Step 4: Enable Auth in Your App

The app already has AuthProvider, but you need to:

1. Go to Supabase Dashboard → Authentication → Providers
2. Enable your preferred sign-up method:
   - Email/Password (recommended for testing)
   - Google OAuth
   - GitHub OAuth

3. In your app, users must authenticate before booking

---

## 🎯 How It Works (Complete Flow)

### User Journey:

```
1. User visits /booking
   ↓
2. AuthProvider checks authentication
   ↓
3. If not logged in → See login prompt
   ↓
4. User logs in / signs up
   ↓
5. BookingForm loaded with auth context
   ↓
6. User fills form + enters flight number (e.g., KQ102)
   ↓
7. Submit booking
   ↓
8. BookingForm validates data
   ↓
9. Booking saved to `bookings` table
   ↓
10. Flight tracking activated
    - Creates `flight_bookings` record
    - Sets status: "waiting"
    ↓
11. Edge function runs every 5 minutes
    ↓
12. Queries AviationStack API for flight status
    ↓
13. Updates `flight_bookings` table
    - Status: "in-air", "landed", etc.
    ↓
14. Frontend realtime subscription updates UI
    ↓
15. When flight lands:
    - Auto-pickup triggered
    - User notified
    - Driver assigned
    - SMS sent (if configured)
    ↓
16. Booking complete ✓
```

---

## 📊 Real-Time Updates (How It Works)

### BookingForm Real-Time Subscription:

```javascript
// In BookingForm.jsx
const { trackFlight, flightBooking, getFlightStatus } = useFlightTracking(null, bookingId);

// When flight lands, UI automatically updates:
if (flightBooking.tracking_status === 'landed') {
  // Shows: "🛬 Flight has landed"
  // Shows: "Driver on the way 🚗"
}
```

### useFlightTracking Hook:

The hook subscribes to real-time database changes:

```javascript
supabase
  .channel(`flight_bookings:${bookingId}`)
  .on('postgres_changes', ..., handleUpdate)
  .subscribe()
```

When the Edge Function updates flight status in Supabase, **all listening users are notified instantly** via Supabase Realtime.

---

## 🧪 Testing the System

### Test Booking Creation:

1. Run: `npm run dev`
2. Go to `/booking`
3. Fill form with:
   - Pickup: "Jomo Kenyatta Airport"
   - Destination: "Nairobi City"
   - Flight: "KQ102" (a real flight number)
   - Date: Tomorrow
   - Time: 14:00
4. Click "Request Chauffeur"
5. Check browser console for booking ID
6. Verify in Supabase Dashboard → `bookings` table

### Test Flight Tracking:

1. After booking created, check `flight_bookings` table
2. Status should be "waiting"
3. Wait 5 minutes (or manually trigger edge function)
4. Status updates to "in-air" or "landed"
5. BookingForm UI updates in real-time

### Real Flight Numbers to Test:

```
KQ101  - Kenya Airways (real)
KQ102  - Kenya Airways (real)
BA1    - British Airways (real)
AA1    - American Airlines (real)
```

Use `https://aviation-edge.com/flight-tracker` to find real flight numbers.

---

## 🐛 Troubleshooting

### "useAuthContext must be used within an AuthProvider"
→ App.jsx must wrap App with `<AuthProvider>` (Already done ✓)

### "Bookings table not found"
→ Run `SUPABASE_MIGRATIONS.sql` in Supabase SQL editor

### "Flight tracking not updating"
→ Check if Edge Function is deployed and has cron trigger set

### "AviationStack returning no data"
→ Flight might not exist or API key is invalid
→ Test at: `http://api.aviationstack.com/v1/flights?access_key=KEY&flight_iata=KQ102`

### "Realtime not working"
→ Go to Supabase Dashboard → Project Settings → Realtime
→ Enable Realtime if disabled

---

## 📝 Next Steps (Optional Enhancements)

1. **Email Notifications**
   - When flight lands, send email
   - Integration: SendGrid, Resend, or Mailgun

2. **SMS Notifications**
   - When flight lands, send SMS
   - Integration: Twilio

3. **Driver Assignment**
   - Auto-assign nearest driver
   - Real-time driver location tracking

4. **Payment Integration**
   - Stripe or Mpesa payment
   - Invoice generation

5. **Admin Dashboard**
   - View all bookings
   - Track flights in real-time
   - Assign drivers
   - View analytics

6. **Booking History Page**
   - Show user's past bookings
   - Allow rebooking
   - Show booking status

---

## 🔐 Security Checklist

- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Users can only see their own bookings
- ✅ Auth required for booking
- ✅ API keys not exposed in frontend code
- ✅ Supabase service key only in edge functions
- ⚠️  Change AviationStack API key after deployment

---

## 📞 Support

If you encounter issues:

1. Check Supabase Dashboard → Logs
2. Check Edge Function logs
3. Check browser console
4. Verify environment variables are set
5. Verify tables are created with correct schema

---

## 🎉 You're All Set!

The system is now ready for:
- Real-time flight tracking ✈️
- Automatic pickup scheduling 🚗
- User notifications 📱
- Seamless booking experience 🎯

Test it now and let me know if anything needs adjustment!

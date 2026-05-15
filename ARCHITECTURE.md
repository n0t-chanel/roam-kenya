# System Architecture Diagram

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         ROAM KENYA APP                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  FRONTEND (React + Supabase JS SDK)                                     │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │                                                                 │    │
│  │  App.jsx                                                        │    │
│  │    ↓                                                            │    │
│  │  AuthProvider (wraps entire app)                               │    │
│  │    ↓                                                            │    │
│  │  Routes                                                         │    │
│  │  ├─ /auth          → AuthPage (login/signup)                   │    │
│  │  ├─ /booking       → BookingForm                               │    │
│  │  │                   ├─ useAuth() - Check authentication        │    │
│  │  │                   ├─ useDatabase() - Save booking            │    │
│  │  │                   ├─ useFlightTracking() - Track flight      │    │
│  │  │                   └─ Real-time subscription listener         │    │
│  │  ├─ /              → Home                                       │    │
│  │  └─ ...other routes                                            │    │
│  │                                                                 │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓↕
┌─────────────────────────────────────────────────────────────────────────┐
│                      SUPABASE (Backend as a Service)                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  AUTHENTICATION (Supabase Auth)                                         │
│  ├─ Email/Password signup & login                                       │
│  ├─ Session management                                                  │
│  └─ JWT tokens                                                          │
│                                                                           │
│  DATABASE (PostgreSQL)                                                  │
│  ├─ user_profiles table                                                 │
│  │   └─ Stores user account info                                        │
│  │                                                                       │
│  ├─ bookings table                                                      │
│  │   ├─ Stores all customer bookings                                    │
│  │   ├─ Links to user_id via FK                                        │
│  │   └─ Contains: pickup, destination, date, time, vehicle type        │
│  │                                                                       │
│  ├─ flights table                                                       │
│  │   ├─ Stores flight data (populated by Edge Function)                │
│  │   └─ Contains: flight_number, status, arrival times                 │
│  │                                                                       │
│  └─ flight_bookings table (Real-time tracking)                         │
│      ├─ Links bookings to flights                                       │
│      ├─ Stores tracking_status (waiting, in-air, landed, picked_up)    │
│      ├─ auto_pickup_triggered flag                                     │
│      └─ Updated every 5 minutes by Edge Function                       │
│                                                                           │
│  REALTIME (WebSocket subscriptions)                                     │
│  ├─ BookingForm listens to flight_bookings changes                     │
│  ├─ When status updates → UI updates in real-time                      │
│  └─ No page refresh needed                                             │
│                                                                           │
│  ROW LEVEL SECURITY (RLS)                                              │
│  ├─ Users can only see their own bookings                              │
│  ├─ Enforced at database level                                         │
│  └─ Service role bypasses RLS (for Edge Functions)                     │
│                                                                           │
│  EDGE FUNCTIONS (Serverless)                                           │
│  └─ track-flights function                                             │
│     ├─ Triggers: Every 5 minutes (cron: */5 * * * *)                   │
│     ├─ Fetches all active flight bookings                              │
│     ├─ Queries each flight from AviationStack API                      │
│     ├─ Updates flight_bookings table with new status                   │
│     ├─ If landed: Sets auto_pickup_triggered = true                    │
│     └─ Realtime notifies frontend                                      │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓↕
┌─────────────────────────────────────────────────────────────────────────┐
│                   EXTERNAL APIs                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  AVIATIONSTACK API                                                      │
│  ├─ Real-time flight status                                            │
│  ├─ Arrival times (scheduled, estimated, actual)                       │
│  ├─ Airport info                                                        │
│  ├─ Aircraft details                                                    │
│  └─ API Key: 06b2241c3d4ba5be64e16cb4ff8307ee                           │
│                                                                           │
│  (Future) EMAIL SERVICE (SendGrid/Mailgun)                             │
│  └─ Send booking confirmation                                          │
│                                                                           │
│  (Future) SMS SERVICE (Twilio)                                         │
│  └─ Send flight landing notification                                   │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

```
┌─────────────┐
│   User      │
│   Visits    │
│   /auth     │
└──────┬──────┘
       │
       ↓
┌──────────────────────┐
│ AuthPage             │
│ Sign up / Sign in    │
└──────┬───────────────┘
       │
       ↓
┌────────────────────────────────┐
│ Supabase Auth                  │
│ Create user + session          │
└──────┬─────────────────────────┘
       │
       ↓
┌──────────────────────────────────┐
│ User navigates to /booking       │
│ AuthProvider checks auth         │
└──────┬───────────────────────────┘
       │
       ↓
┌────────────────────────────────┐
│ BookingForm                    │
│ User fills form                │
│ + enters flight (optional)     │
└──────┬─────────────────────────┘
       │
       ↓ (Submit)
┌─────────────────────────────────┐
│ Validate form                   │
│ Check dates, times, etc.        │
└──────┬──────────────────────────┘
       │
       ↓ (Valid)
┌──────────────────────────────────┐
│ useDatabase.insert()             │
│ Save booking to DB               │
└──────┬───────────────────────────┘
       │
       ↓ (Booking created)
┌──────────────────────────────────┐
│ If flight number provided:       │
│ useFlightTracking.trackFlight()  │
└──────┬───────────────────────────┘
       │
       ↓ (Track flight)
┌──────────────────────────────────────┐
│ Create flight_bookings record        │
│ Set tracking_status = "waiting"      │
│ Subscribe to real-time updates       │
└──────┬───────────────────────────────┘
       │
       ↓
┌────────────────────────────────────────┐
│ SUCCESS: Show booking confirmation     │
│ Display booking ID                     │
│ Display flight tracking status         │
└────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════

                    BACKGROUND PROCESS
                    (Edge Function)

┌────────────────────────────────────────┐
│ Every 5 minutes:                       │
│ Edge Function triggered (cron)         │
└──────┬─────────────────────────────────┘
       │
       ↓
┌────────────────────────────────────────┐
│ Query all flight_bookings               │
│ WHERE tracking_status != 'landed'       │
└──────┬─────────────────────────────────┘
       │
       ↓ (For each booking)
┌───────────────────────────────────────────┐
│ Call AviationStack API                    │
│ GET /flights?flight_iata=KQ102            │
└──────┬────────────────────────────────────┘
       │
       ↓ (Get flight status)
┌───────────────────────────────┐
│ Parse response:               │
│ flight_status: "landed"       │
│ actual_arrival: "2026-05-06"  │
└──────┬────────────────────────┘
       │
       ↓ (Status changed?)
┌─────────────────────────────────┐
│ Update flight_bookings table    │
│ SET tracking_status = "landed"  │
│ SET updated_at = NOW()          │
└──────┬──────────────────────────┘
       │
       ↓ (Realtime triggers)
┌────────────────────────────────┐
│ All subscribed browsers         │
│ notified via WebSocket          │
└──────┬─────────────────────────┘
       │
       ↓ (Frontend hook updates)
┌────────────────────────────────┐
│ useFlightTracking hook detects │
│ status change                  │
└──────┬─────────────────────────┘
       │
       ↓ (If status = "landed")
┌──────────────────────────┐
│ Trigger auto-pickup      │
│ Update tracking_status   │
│ = "picked_up"            │
│ SET auto_pickup_triggered│
└──────┬───────────────────┘
       │
       ↓
┌──────────────────────────────────┐
│ UI updates in real-time:         │
│ "🛬 Flight has landed"           │
│ "Driver on the way 🚗"           │
│ (NO PAGE REFRESH!)               │
└──────────────────────────────────┘
```

---

## Component Dependency Tree

```
App.jsx
├─ AuthProvider
│  └─ useAuth()
│     ├─ supabaseAuth.getSession()
│     ├─ supabaseAuth.onAuthStateChange()
│     └─ Provides: user, loading, error, signUp, signIn, signOut
│
├─ Router
│  ├─ AuthPage
│  │  └─ useAuth() → Form submission
│  │
│  ├─ BookingForm
│  │  ├─ useAuthContext() → Check if logged in
│  │  ├─ useDatabase('bookings') → Save booking
│  │  ├─ useFlightTracking() → Track flight
│  │  │  └─ supabase.channel() → Real-time subscription
│  │  └─ Form validation
│  │
│  ├─ Home, About, Services, etc.
│  └─ ...
│
└─ Footer
```

---

## Database Relationships

```
auth.users (Supabase Auth)
    │
    ├─── user_profiles (one-to-one)
    │    └─ Stores user details
    │
    ├─── bookings (one-to-many)
    │    ├─ User can have many bookings
    │    └─ Each booking has one user
    │        │
    │        └─── flight_bookings (one-to-one)
    │             ├─ Booking can have one flight booking
    │             └─ Links booking to real-time tracking
    │                  │
    │                  └─── flights (many-to-one)
    │                       ├─ Many flight_bookings can track same flight
    │                       └─ Stores flight status data
```

---

## Real-Time Architecture

```
Frontend                        Supabase (Backend)
─────────                       ──────────────────

User does something              │
        │                        │
        ├─ Opens booking form    │
        │                        │
        ├─ Enters flight number  │
        │                        │
        └─ Submits booking       │
                                 │
                                 ↓
                         Database Update
                         (Insert into
                          flight_bookings)
                                 │
                                 ↓
                         Realtime triggers
                         ┌─────────────────┐
                         │ Subscribers     │
                         │ listening on:   │
                         │ flight_bookings │
                         │ channel         │
                         └─────────────────┘
                                 │
                   ┌─────────────┼─────────────┐
                   │             │             │
           (browser 1)     (browser 2)    (backend)
                   │             │             │
                   ↓             ↓             ↓
           UI updates     UI updates    Edge function
           in real-time   in real-time  processes
                                        (if needed)
```

---

## Deployment Architecture

```
GitHub Repository (roam-kenya)
        │
        ├─ Source Code
        │  ├─ src/
        │  ├─ supabase/functions/
        │  └─ public/
        │
        └─ CI/CD (GitHub Actions, if setup)
           │
           ├─ Lint Check
           ├─ Build Check
           └─ Deploy
              │
              ├─ Deploy Frontend → Vercel/Netlify
              └─ Deploy Edge Functions → Supabase

Supabase Project
├─ Database (PostgreSQL)
├─ Authentication (Supabase Auth)
├─ Real-time (WebSocket)
├─ Edge Functions (Serverless)
└─ Storage (if needed)

External Services
├─ AviationStack (Flight data)
├─ (Future) SendGrid (Email)
└─ (Future) Twilio (SMS)
```

This architecture is:
- **Scalable** - Serverless functions auto-scale
- **Real-time** - WebSocket updates to all clients
- **Secure** - RLS policies enforce user isolation
- **Efficient** - Edge functions reduce load
- **Cost-effective** - Pay only for what you use

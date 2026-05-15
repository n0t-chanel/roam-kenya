# Quick Start Guide - Flight Tracking & Paystack Integration

## 📍 You Are Here

You have:
- ✅ Flight tracking set up (Edge Function running every 5 minutes)
- ✅ Booking system with database
- ✅ Real-time Supabase integration

Next: Test flight tracking & add Paystack payments

---

## 🛫 Testing Flight Tracking (Start Here)

### Quick Test (5 minutes)

```bash
# 1. Start dev server
npm run dev

# 2. Go to http://localhost:5173/auth
# 3. Sign up with test email
# 4. Go to http://localhost:5173/booking
# 5. Fill form with:
#    - Flight: KQ102 (real Kenya Airways flight)
#    - Pickup: Nairobi
#    - Destination: Jomo Kenyatta Airport
# 6. Submit
```

### Check if it Worked

```
✅ Open browser console (F12)
✅ Go to Supabase Dashboard → SQL Editor
✅ Run: SELECT * FROM flight_bookings ORDER BY created_at DESC LIMIT 1;
✅ Should see your booking with status 'waiting'
```

### Full Testing Guide

See: **`FLIGHT_TRACKING_TESTING.md`** for:
- Manual testing steps
- Database verification
- Real-time monitoring
- Debugging tips
- Expected flight statuses

---

## 💳 Adding Paystack Payment (Start After Flight Tracking Works)

### What You'll Build

```
User creates booking
    ↓
Sees payment page (price calculated automatically)
    ↓
Chooses payment method:
  - M-Pesa (mobile money)
  - Visa/Mastercard
  - Airtel Money
  - Bank transfer
    ↓
Completes payment
    ↓
Booking confirmed + Flight tracking starts
```

### 5-Minute Setup

```bash
# 1. Get Paystack keys
Go to https://paystack.com → Sign up → Settings → API Keys

# 2. Add to .env.local
VITE_PAYSTACK_PUBLIC_KEY=pk_live_xxxxx
VITE_PAYSTACK_SECRET_KEY=sk_live_xxxxx

# 3. Install Paystack SDK
npm install @paystack/inline-js

# 4. Run database migration
Go to Supabase Dashboard → SQL Editor
Run all SQL from: PAYSTACK_MIGRATIONS.sql
```

### Implementation Steps

**Phase 1: Setup (30 min)** → `PAYSTACK_IMPLEMENTATION_CHECKLIST.md` phases 1-2
**Phase 2: Frontend (2-3 hours)** → Create payment components
**Phase 3: Backend (1-2 hours)** → Create webhook handler
**Phase 4: Testing (1-2 hours)** → Test all payment methods

Full detailed guide: **`PAYSTACK_INTEGRATION_PLAN.md`**

---

## 📂 New Files Created

| File | Purpose |
|------|---------|
| `FLIGHT_TRACKING_TESTING.md` | How to test flight tracking |
| `PAYSTACK_INTEGRATION_PLAN.md` | Complete payment integration guide |
| `PAYSTACK_MIGRATIONS.sql` | Database schema for payments |
| `PAYSTACK_IMPLEMENTATION_CHECKLIST.md` | Step-by-step checklist |

---

## 🔍 Current Architecture

```
Frontend (React)
├── BookingForm creates booking
├── Flight tracking subscribes to Supabase
└── Shows real-time status updates

Supabase Backend
├── PostgreSQL database
├── Real-time subscriptions
├── Edge Function (runs every 5 min)
│   └── Fetches flight data from AviationStack API
└── Webhook handler (for payments)

External APIs
├── AviationStack (flight tracking)
└── Paystack (payments)
```

---

## 🧪 Test Your Setup

### Test 1: Is Supabase Connected?
```javascript
// Browser console (F12)
import { supabase } from './src/lib/supabase'
const { data } = await supabase.from('bookings').select().limit(1)
console.log(data)
```

### Test 2: Is Flight Tracking Running?
```sql
-- Supabase SQL Editor
SELECT * FROM flight_bookings 
WHERE created_at > NOW() - INTERVAL '10 minutes'
ORDER BY created_at DESC;
```

### Test 3: Is Edge Function Deployed?
```
Supabase Dashboard → Functions → track-flights
Should show "Deployed" status
```

---

## 🚨 Common Issues

### Flight Tracking Not Working
→ See `FLIGHT_TRACKING_TESTING.md` → Debugging section

### Can't Connect to Supabase
→ Check `.env.local` has correct credentials
→ Run: `echo $VITE_SUPABASE_URL` (should print URL)

### Paystack Payment Fails
→ Verify API key starts with `pk_`
→ Check Paystack Dashboard for sandbox mode
→ Use test card: `4084084084084081`

---

## 📋 Next Actions

### Immediate (Today)
- [ ] Test flight tracking with the guide
- [ ] Verify bookings appear in Supabase
- [ ] Check Edge Function logs

### Soon (Next Few Days)
- [ ] Get Paystack account
- [ ] Get API keys
- [ ] Follow `PAYSTACK_IMPLEMENTATION_CHECKLIST.md`
- [ ] Implement phases 1-2

### Later (Full Implementation)
- [ ] Complete Paystack phases 3-4
- [ ] Test with real payment methods
- [ ] Deploy to production

---

## 📞 Resources

### Flight Tracking
- Supabase Realtime: https://supabase.com/docs/guides/realtime
- AviationStack API: https://aviationstack.com/documentation

### Payment Integration
- Paystack Docs: https://paystack.com/docs
- Paystack JavaScript SDK: https://paystack.com/docs/libraries-and-plugins/libraries/javascript
- Test Cards: https://paystack.com/docs/payments/test-authentication

### Your Project Docs
- Main architecture: `ARCHITECTURE.md`
- Supabase setup: `SUPABASE_SETUP.md`
- Quick reference: `QUICK_REFERENCE.md`

---

## ✅ Success Criteria

### Flight Tracking Works When:
- ✅ Booking created in database
- ✅ Flight booking record shows 'waiting' status
- ✅ Status changes to 'in-air' or 'landed' after Edge Function runs
- ✅ Real-time updates show in UI without page refresh
- ✅ No errors in browser console

### Payment Integration Works When:
- ✅ Paystack checkout opens
- ✅ Can select payment method
- ✅ Payment completes successfully
- ✅ Booking status updates to "confirmed"
- ✅ Flight tracking starts automatically
- ✅ Payment recorded in database

---

**Start with flight tracking testing!** 🚀 See `FLIGHT_TRACKING_TESTING.md` for step-by-step instructions.

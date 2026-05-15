# 🚀 Quick Reference - Flight Tracking & Payment Testing

## 🛫 FLIGHT TRACKING TESTING (5 minutes)

### Step 1: Create Test Booking
```bash
npm run dev
# Go to http://localhost:5173/auth
# Sign up → Go to /booking
# Fill form with flight: KQ102
```

### Step 2: Check Database
```sql
-- Supabase SQL Editor
SELECT * FROM flight_bookings ORDER BY created_at DESC LIMIT 1;

-- Look for:
-- ✅ booking_id (matches your booking)
-- ✅ flight_number: 'KQ102'
-- ✅ tracking_status: 'waiting'
```

### Step 3: Wait for Update
```
After 5 minutes, tracking_status should change to:
- 'in-air' if flight is flying
- 'landed' if flight has landed
- 'waiting' if not yet departed
```

### Step 4: Verify Real-Time Updates
- Open browser console (F12)
- Watch for subscription messages
- Check for status changes without page refresh

✅ **Flight Tracking Works!** → Move to Paystack

---

## 💳 PAYSTACK PAYMENT SETUP (15 minutes)

### Step 1: Get API Keys
```
1. Go to https://paystack.com
2. Sign up → Verify email
3. Settings → API Keys & Webhooks
4. Copy Public Key (starts with pk_)
5. Copy Secret Key (starts with sk_)
```

### Step 2: Update .env.local
```env
VITE_PAYSTACK_PUBLIC_KEY=pk_live_xxxxx
VITE_PAYSTACK_SECRET_KEY=sk_live_xxxxx
```

### Step 3: Install Dependencies
```bash
npm install @paystack/inline-js
# Add to index.html before </body>:
# <script src="https://js.paystack.co/v1/inline.js"></script>
```

### Step 4: Run Database Migration
```sql
-- Supabase SQL Editor
-- Copy all SQL from PAYSTACK_MIGRATIONS.sql
-- Run it to create:
-- ✅ payments table
-- ✅ Update bookings table
-- ✅ Add RLS policies
```

✅ **Setup Complete!** → Start Frontend Implementation

---

## 🛠️ FRONTEND COMPONENTS TO BUILD

### Component 1: `src/components/PaymentModal.jsx`
```
Shows:
- Booking details
- Calculated price
- Payment method options
- "Proceed to Payment" button
```

### Component 2: `src/lib/priceCalculator.js`
```javascript
// Implement:
- calculateDistance() - Haversine formula
- calculatePrice() - Base + per-km pricing
- formatPrice() - KES formatting
```

### Component 3: `src/hooks/usePayment.js`
```javascript
// Implement:
- initiatePayment() - Open Paystack checkout
- verifyPayment() - Check payment status
- updateBookingPaymentStatus() - Set to "confirmed"
- recordPayment() - Save to payments table
```

### Component 4: Update `src/components/BookingForm.jsx`
```javascript
// Modify flow:
1. Submit booking (create with status: "unpaid")
2. Calculate price
3. Show PaymentModal
4. On payment success → Update booking to "confirmed"
5. Start flight tracking
```

---

## 🧪 TEST PAYMENT FLOW

### Test Card 1: Successful Payment ✅
```
Card: 4084084084084081
CVV: 408
Expiry: 12/25
```

### Test Card 2: Declined Payment ❌
```
Card: 4000000000000002
CVV: 408
Expiry: 12/25
```

### Test Payment Methods
- M-Pesa (test credentials in Paystack sandbox)
- Bank Transfer (test bank in sandbox)
- Airtel Money (test credentials)

---

## 🎯 EXPECTED FLOW

### Successful Test:
```
1. User at /booking
2. Fills form (pickup, destination, date, etc.)
3. Clicks "Proceed to Payment"
4. PaymentModal shows:
   - Price: KES 1,500
   - Methods: M-Pesa, Visa, etc.
5. Clicks "Pay with Card"
6. Paystack checkout opens
7. Enters test card 4084084084084081
8. Completes payment
9. Redirected to success page
10. Booking status updates to "confirmed"
11. Flight tracking begins
12. Sees flight status updates in real-time
```

### Database Updates:
```
✅ New record in payments table
   - amount: 150000 (in cents)
   - status: 'completed'
   - reference: paystack_ref_xxxxx
   
✅ Booking updated:
   - payment_status: 'paid'
   - price_amount: 150000
```

---

## ⚡ PRICING FORMULA

```
Base Fare: KES 500
Per KM Rate: KES 50

Example: Nairobi → JKIA (20km)
Price = 500 + (20 × 50) = KES 1,500

Example: Nairobi → Westlands (15km)
Price = 500 + (15 × 50) = KES 1,250
```

---

## 🔒 SECURITY REMINDERS

```
✅ Never commit .env.local to git
✅ Keep secret keys server-side only
✅ Verify webhook signatures
✅ Validate amounts match booking prices
✅ Check user owns booking before payment
✅ Use HTTPS for webhook endpoint
```

---

## 📋 CHECKLIST - DO THIS NOW

### Today
- [ ] Test flight tracking (5 min)
- [ ] Verify booking appears in database
- [ ] Check flight_bookings table updates

### Tomorrow
- [ ] Get Paystack account
- [ ] Get API keys
- [ ] Update .env.local
- [ ] Install dependencies
- [ ] Run database migration

### This Week
- [ ] Build PaymentModal component
- [ ] Create usePayment hook
- [ ] Implement price calculator
- [ ] Update BookingForm flow
- [ ] Test with test cards

### Next Week
- [ ] Create webhook Edge Function
- [ ] Deploy verify-payment function
- [ ] Add webhook URL to Paystack
- [ ] Test end-to-end flow
- [ ] Monitor Paystack transactions

---

## 🚨 QUICK TROUBLESHOOTING

### Flight Tracking Not Updating?
```
Check:
1. Is edge function deployed? (Supabase → Functions)
2. Are there errors in function logs?
3. Is RLS policy correct?
4. Is Realtime enabled?
```

### Payment Not Working?
```
Check:
1. Is Paystack SDK loaded? (F12 → Console)
2. Are API keys correct?
3. Is database migration run?
4. Is test card valid?
```

### Booking Not Updated?
```
Check:
1. Did webhook execute? (Supabase → Edge Function → Logs)
2. Is webhook URL correct in Paystack?
3. Is signature verification passing?
4. Are RLS policies allowing updates?
```

---

## 📚 FULL GUIDES

| File | Topic | Read When |
|------|-------|-----------|
| `FLIGHT_TRACKING_TESTING.md` | Flight testing | Testing flight tracking |
| `PAYSTACK_INTEGRATION_PLAN.md` | Payment architecture | Planning implementation |
| `PAYSTACK_IMPLEMENTATION_CHECKLIST.md` | Step-by-step | Building components |
| `QUICK_START_GUIDE.md` | Overview | General reference |
| `IMPLEMENTATION_OVERVIEW.md` | Timeline & flow | Project planning |

---

## 📱 TEST FLIGHT NUMBERS

Recommended real Kenya Airways flights:
```
KQ102 - Nairobi → London (frequent)
KQ101 - London → Nairobi (frequent)
KQ202 - Nairobi → Amsterdam
Q4    - Nairobi → Brussels (Qatar)
```

**Tip:** Check flight tracker websites for active flights before testing.

---

## ✅ COMPLETION CRITERIA

### Flight Tracking ✅
- [x] Booking created
- [x] Flight booking record created
- [x] Status updates after edge function
- [x] Real-time UI updates
- [x] No console errors

### Payment Integration ✅
- [x] Paystack checkout opens
- [x] All payment methods work
- [x] Payment recorded in database
- [x] Booking status updates
- [x] Flight tracking begins after payment
- [x] Webhook verified

---

**You're ready! Start with flight tracking testing.** 🚀

Need help? Check the full guide files or email support@paystack.com for payment issues.

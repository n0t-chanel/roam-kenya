# Paystack Payment Integration - Implementation Checklist

## Overview
This checklist guides you through implementing Paystack payment integration step-by-step. Follow each phase in order.

---

## ✅ Phase 1: Setup & Configuration (30 minutes)

### 1.1 Paystack Account
- [ ] Sign up at https://paystack.com
- [ ] Complete email verification
- [ ] Log in to Paystack Dashboard
- [ ] Verify email address

### 1.2 Get API Keys
- [ ] Go to Settings → API Keys & Webhooks
- [ ] Copy **Public Key** → Add to `.env.local` as `VITE_PAYSTACK_PUBLIC_KEY`
- [ ] Copy **Secret Key** → Add to `.env.local` as `VITE_PAYSTACK_SECRET_KEY`

### 1.3 Environment Setup
- [ ] Update `.env.local`:
  ```env
  VITE_PAYSTACK_PUBLIC_KEY=pk_live_xxxxx
  VITE_PAYSTACK_SECRET_KEY=sk_live_xxxxx
  ```
- [ ] Verify keys are NOT committed to git
- [ ] Restart dev server: `npm run dev`

### 1.4 Database Migration
- [ ] Go to Supabase Dashboard → SQL Editor
- [ ] Copy all SQL from `PAYSTACK_MIGRATIONS.sql`
- [ ] Paste into SQL Editor and run
- [ ] Verify `payments` table created
- [ ] Verify `bookings` table has new columns: `payment_status`, `price_amount`

---

## ✅ Phase 2: Frontend Dependencies (15 minutes)

### 2.1 Install Paystack SDK
- [ ] Run: `npm install @paystack/inline-js`
- [ ] Run: `npm install uuid` (if not already installed)
- [ ] Verify installation: `npm list @paystack/inline-js`

### 2.2 Add Paystack Script to index.html
- [ ] Open `index.html`
- [ ] Add before `</body>`:
  ```html
  <script src="https://js.paystack.co/v1/inline.js"></script>
  ```
- [ ] Save file

---

## ✅ Phase 3: Create Core Components (2-3 hours)

### 3.1 Create Paystack Configuration File
- [ ] Create: `src/lib/paystack.js`
- [ ] Copy code from section below
- [ ] Verify imports work

### 3.2 Create usePayment Hook
- [ ] Create: `src/hooks/usePayment.js`
- [ ] Implement functions:
  - [ ] `initiatePayment()` - Start Paystack checkout
  - [ ] `verifyPayment()` - Verify payment reference
  - [ ] `updateBookingPaymentStatus()` - Update booking in database
  - [ ] `recordPayment()` - Log payment in payments table

### 3.3 Create PaymentModal Component
- [ ] Create: `src/components/PaymentModal.jsx`
- [ ] Display booking details and calculated price
- [ ] Show payment method options:
  - [ ] M-Pesa
  - [ ] Visa/Mastercard
  - [ ] Airtel Money
  - [ ] Bank Transfer
- [ ] Handle payment flow
- [ ] Show success/error states

### 3.4 Create PriceCalculator Utility
- [ ] Create: `src/lib/priceCalculator.js`
- [ ] Implement:
  - [ ] `calculateDistance()` - Haversine formula
  - [ ] `calculatePrice()` - Distance-based pricing
  - [ ] `formatPrice()` - Format price display

### 3.5 Update BookingForm Component
- [ ] Modify: `src/components/BookingForm.jsx`
- [ ] Add price calculation on form submission
- [ ] Change form flow:
  - [ ] Submit form → Save booking as "unpaid"
  - [ ] Show PaymentModal
  - [ ] On payment success → Update booking to "confirmed"
- [ ] Add error handling for payment failures
- [ ] Show payment status to user

---

## ✅ Phase 4: Backend Integration (1-2 hours)

### 4.1 Create Webhook Handler (Edge Function)
- [ ] Create directory: `supabase/functions/verify-payment/`
- [ ] Create: `supabase/functions/verify-payment/index.ts`
- [ ] Implement:
  - [ ] Webhook signature verification
  - [ ] Payment status check
  - [ ] Database updates
  - [ ] Error handling

### 4.2 Deploy Edge Function
- [ ] Login to Supabase CLI: `supabase login`
- [ ] Deploy function: `supabase functions deploy verify-payment`
- [ ] Get function URL from deployment output
- [ ] Test function is accessible: `curl https://your-function-url`

### 4.3 Add Webhook URL to Paystack
- [ ] Go to Paystack Dashboard → Settings → Webhooks
- [ ] Add webhook URL:
  ```
  https://your-project.supabase.co/functions/v1/verify-payment
  ```
- [ ] Verify webhook is active

### 4.4 Test Webhook Locally (Optional)
- [ ] Install ngrok: `npm install -g ngrok`
- [ ] Run: `ngrok http 3000` (or your dev port)
- [ ] Use ngrok URL as temporary webhook for testing
- [ ] Test payment → check Paystack logs

---

## ✅ Phase 5: Price Calculation Testing (30 minutes)

### 5.1 Test Price Calculation
- [ ] Test distance calculation with known coordinates
- [ ] Verify Haversine formula
- [ ] Test edge cases:
  - [ ] Same location (0 km)
  - [ ] Very long distance
  - [ ] Negative coordinates

### 5.2 Test Pricing Formula
- [ ] Base fare: KES 500
- [ ] Per km: KES 50
- [ ] Test example:
  - [ ] Nairobi → JKIA (20 km) = KES 1,500
  - [ ] Nairobi → Westlands (15 km) = KES 1,250

---

## ✅ Phase 6: Testing (1-2 hours)

### 6.1 Manual Testing - Happy Path
- [ ] Start dev server: `npm run dev`
- [ ] Go to `/booking`
- [ ] Fill booking form completely
- [ ] Click "Proceed to Payment"
- [ ] PaymentModal appears with correct price
- [ ] Select payment method
- [ ] Paystack checkout opens
- [ ] Use test card: `4084084084084081`
- [ ] Complete payment
- [ ] Redirected to success page
- [ ] Booking status updated to "confirmed" in database
- [ ] Flight tracking starts automatically

### 6.2 Manual Testing - Error Scenarios
- [ ] Test with invalid card: `4000000000000002`
- [ ] Test with expired card: `4000000000000069`
- [ ] Test cancelling payment
- [ ] Verify booking stays as "unpaid"
- [ ] Test retrying payment

### 6.3 Manual Testing - Payment Methods
- [ ] Test M-Pesa (if available in sandbox)
- [ ] Test Bank Transfer option
- [ ] Test Airtel Money option
- [ ] Verify each shows correct payment flow

### 6.4 Database Verification
- [ ] Payment record created in `payments` table
- [ ] Booking `payment_status` is "paid"
- [ ] `price_amount` is stored correctly
- [ ] No sensitive data in database

### 6.5 Browser Console Testing
- [ ] No JavaScript errors
- [ ] No console warnings
- [ ] Async functions completing
- [ ] Paystack SDK loaded correctly

---

## ✅ Phase 7: Security & Compliance (1 hour)

### 7.1 Security Checks
- [ ] Secret key NOT in frontend code
- [ ] Secret key NOT committed to git
- [ ] Webhook signature verified
- [ ] Amount validation implemented
- [ ] User ID validation implemented
- [ ] HTTPS enforced (production)

### 7.2 Data Validation
- [ ] Validate booking exists before payment
- [ ] Validate user owns booking
- [ ] Validate amount matches booking price
- [ ] Validate payment reference is unique
- [ ] Validate payment method supported

### 7.3 Error Handling
- [ ] Network errors handled gracefully
- [ ] Invalid payment reference handled
- [ ] Duplicate webhook calls handled (idempotency)
- [ ] Database errors caught and logged
- [ ] User-friendly error messages shown

---

## ✅ Phase 8: Monitoring & Logging (30 minutes)

### 8.1 Add Payment Logging
- [ ] Log payment initiated
- [ ] Log payment successful
- [ ] Log payment failed
- [ ] Log webhook received
- [ ] Log webhook verified
- [ ] Log booking updated

### 8.2 Monitor Paystack Dashboard
- [ ] Check transaction logs
- [ ] Verify payment success rate
- [ ] Check for failed transactions
- [ ] Monitor webhook deliveries
- [ ] Check for errors

### 8.3 Add Payment Status Page (Optional)
- [ ] Create page to view payment history
- [ ] Show past payments
- [ ] Show payment status
- [ ] Allow downloading receipts

---

## 📋 Code Templates

### Template 1: `src/lib/paystack.js`
```javascript
export const PAYSTACK_CONFIG = {
  PUBLIC_KEY: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
  API_BASE: 'https://api.paystack.co'
}

export const PAYMENT_METHODS = {
  MPESA: 'mpesa',
  VISA: 'visa',
  AIRTEL: 'airtel',
  BANK: 'bank'
}

export const initializePaystackCheckout = (options) => {
  if (!window.PaystackPop) {
    throw new Error('Paystack SDK not loaded. Check that script tag is in index.html')
  }

  return new window.PaystackPop().checkout({
    key: PAYSTACK_CONFIG.PUBLIC_KEY,
    ...options
  })
}
```

### Template 2: `src/lib/priceCalculator.js`
```javascript
const BASE_FARE = 500 // KES
const PER_KM_RATE = 50 // KES per km

export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371 // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export function calculatePrice(pickupLat, pickupLng, destLat, destLng) {
  const distance = calculateDistance(pickupLat, pickupLng, destLat, destLng)
  const price = BASE_FARE + distance * PER_KM_RATE
  return Math.ceil(price / 100) * 100
}

export function formatPrice(priceKes) {
  return `KES ${(priceKes / 100).toLocaleString()}`
}

export function formatPriceCents(priceCents) {
  return `KES ${(priceCents / 100).toLocaleString()}`
}
```

---

## 🧪 Test Card Numbers

### Successful Payment
```
Card: 4084084084084081
CVV: 408
Expiry: 12/25
```

### Declined Payment
```
Card: 4000000000000002
CVV: 408
Expiry: 12/25
```

### Expired Card
```
Card: 4000000000000069
CVV: 408
Expiry: 12/15
```

---

## 🆘 Troubleshooting

### Issue: "Paystack SDK not loaded"
- [ ] Verify script tag in `index.html`
- [ ] Check browser console for script load errors
- [ ] Check VITE_PAYSTACK_PUBLIC_KEY is set
- [ ] Try hard refresh: `Ctrl+Shift+R`

### Issue: "Invalid public key"
- [ ] Verify VITE_PAYSTACK_PUBLIC_KEY starts with `pk_`
- [ ] Check there are no extra spaces
- [ ] Check key is correct from Paystack Dashboard
- [ ] Restart dev server

### Issue: "Payment not recorded in database"
- [ ] Verify webhook URL is correct
- [ ] Check webhook delivery logs in Paystack
- [ ] Verify webhook signature verification passes
- [ ] Check Supabase function logs

### Issue: "Booking not updated to confirmed"
- [ ] Check Edge Function logs
- [ ] Verify booking ID is correct
- [ ] Check RLS policies allow update
- [ ] Verify payment reference exists

### Issue: "CORS errors"
- [ ] Add webhook URL to Supabase CORS settings
- [ ] Use HTTPS for webhook URL
- [ ] Check browser console for specific errors

---

## 📞 Support Resources

- **Paystack Docs:** https://paystack.com/docs
- **Paystack API:** https://paystack.com/docs/api/
- **Test Credentials:** https://paystack.com/docs/payments/test-authentication
- **Webhooks Guide:** https://paystack.com/docs/webhooks/
- **JavaScript SDK:** https://paystack.com/docs/libraries-and-plugins/libraries/javascript

---

## ✨ Completion Checklist

- [ ] All phases completed
- [ ] Payment tested successfully
- [ ] Booking status updated correctly
- [ ] Webhook verified and working
- [ ] Security checks passed
- [ ] Error handling working
- [ ] No sensitive data exposed
- [ ] Ready for production deployment

---

**Next Step:** Start with Phase 1. Good luck! 🚀

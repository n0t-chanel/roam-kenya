# Paystack Payment Integration Plan

## Overview

This document outlines the integration of **Paystack** payment gateway into Roam Kenya. The implementation will:
- Allow users to pay for bookings after filling the booking form
- Support M-Pesa, Visa, Airtel Money, and Bank Transfers
- Dynamically calculate prices based on distance/destination
- Update booking status to "confirmed" after successful payment
- Provide real-time payment status updates

---

## 📋 System Architecture

### Payment Flow
```
1. User creates booking (Status: "pending")
   ↓
2. System shows payment page with calculated price
   ↓
3. User selects payment method (M-Pesa, Visa, Airtel, Bank)
   ↓
4. Redirected to Paystack payment page
   ↓
5. User completes payment
   ↓
6. Paystack webhooks updates booking status to "confirmed"
   ↓
7. User sees confirmation + flight tracking begins
```

### Database Changes
New table: `payments`
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  amount INTEGER NOT NULL, -- in cents
  payment_method VARCHAR(50), -- 'mpesa', 'visa', 'airtel', 'bank'
  reference VARCHAR(100) UNIQUE, -- Paystack reference
  status VARCHAR(20), -- 'pending', 'completed', 'failed', 'cancelled'
  paystack_response JSONB, -- Full Paystack response
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Update bookings table (if not already present):
ALTER TABLE bookings ADD COLUMN payment_status VARCHAR(20) DEFAULT 'unpaid';
ALTER TABLE bookings ADD COLUMN price_amount INTEGER; -- in KES cents
```

### Booking Status Values
```
"pending"    → Booking created, awaiting payment
"confirmed"  → Payment successful
"in_progress" → Driver assigned, trip in progress
"completed"  → Trip completed
"cancelled"  → Booking cancelled
```

---

## 🛠️ Implementation Steps

### Step 1: Install Paystack SDK

```bash
npm install @paystack/inline-js
```

### Step 2: Create Paystack Configuration

**File: `src/lib/paystack.js`**
```javascript
export const PAYSTACK_CONFIG = {
  PUBLIC_KEY: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
  API_BASE: 'https://api.paystack.co'
}

// Helper to initialize Paystack
export const initializePaystackCheckout = (options) => {
  return new window.PaystackPop().checkout({
    key: PAYSTACK_CONFIG.PUBLIC_KEY,
    ...options
  })
}
```

### Step 3: Create Payment Hook

**File: `src/hooks/usePayment.js`**
```javascript
export function usePayment() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // 1. Initiate payment
  const initiatePayment = async (bookingId, amount, email) => {
    // Creates Paystack transaction
  }

  // 2. Verify payment
  const verifyPayment = async (reference) => {
    // Calls backend to verify with Paystack
  }

  // 3. Update booking status
  const updateBookingPaymentStatus = async (bookingId, status) => {
    // Updates booking payment_status to "confirmed"
  }

  return { initiatePayment, verifyPayment, updateBookingPaymentStatus, loading, error }
}
```

### Step 4: Create Payment Component

**File: `src/components/PaymentModal.jsx`**
- Shows price calculation breakdown
- Displays payment method options
- Integrates Paystack checkout
- Shows payment status

### Step 5: Update BookingForm Component

- Add "Proceed to Payment" button after form submission
- Calculate price dynamically based on distance
- Store booking first, then redirect to payment
- Show payment status

### Step 6: Create Backend Webhook Handler

**Endpoint: `/api/webhooks/paystack`**
```
POST /api/webhooks/paystack
- Receives payment notification from Paystack
- Verifies payment signature
- Updates booking status in database
- Sends confirmation email
```

### Step 7: Update Database Schema

Run this SQL in Supabase:
```sql
-- Create payments table
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  payment_method VARCHAR(50),
  reference VARCHAR(100) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  paystack_response JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add payment status to bookings
ALTER TABLE public.bookings ADD COLUMN payment_status VARCHAR(20) DEFAULT 'unpaid';
ALTER TABLE public.bookings ADD COLUMN price_amount INTEGER;

-- Create indexes
CREATE INDEX idx_payments_booking_id ON public.payments(booking_id);
CREATE INDEX idx_payments_user_id ON public.payments(user_id);
CREATE INDEX idx_payments_reference ON public.payments(reference);
CREATE INDEX idx_bookings_payment_status ON public.bookings(payment_status);

-- Add RLS policies for payments table
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payments"
  ON public.payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

---

## 🔧 Configuration

### Environment Variables

Add to `.env.local`:
```env
# Paystack
VITE_PAYSTACK_PUBLIC_KEY=pk_live_your_public_key_here
VITE_PAYSTACK_SECRET_KEY=sk_live_your_secret_key_here

# Backend (if using Edge Functions)
PAYSTACK_API_KEY=sk_live_your_secret_key_here
```

### Get Paystack Keys

1. Create account at https://paystack.com
2. Go to Settings → API Keys & Webhooks
3. Copy Public Key → `VITE_PAYSTACK_PUBLIC_KEY`
4. Copy Secret Key → `VITE_PAYSTACK_SECRET_KEY`

---

## 💰 Price Calculation Logic

### Distance-Based Pricing Formula

```javascript
function calculatePrice(pickupLat, pickupLng, destLat, destLng) {
  // Calculate distance (Haversine formula)
  const distance = calculateDistance(
    pickupLat, pickupLng,
    destLat, destLng
  )

  // Pricing: Base fare + per km
  const BASE_FARE = 500 // KES
  const PER_KM_RATE = 50 // KES per km
  
  const price = BASE_FARE + (distance * PER_KM_RATE)
  
  // Round up to nearest 100
  return Math.ceil(price / 100) * 100
}

// Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371 // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}
```

### Example Prices
```
Nairobi → Jomo Kenyatta (20 km):
- Base: KES 500
- Distance: 20 × 50 = KES 1,000
- Total: KES 1,500

Nairobi → Westlands (15 km):
- Base: KES 500
- Distance: 15 × 50 = KES 750
- Total: KES 1,250
```

---

## 📱 Payment Methods Supported

### M-Pesa (Mobile Money)
- Works for all Kenya mobile numbers
- Popular for local transactions
- Instant payment notification

### Visa/Mastercard
- International credit/debit cards
- Global coverage
- Processing fee ~1.5% + KES 100

### Airtel Money
- Airtel telecom users
- Available in Kenya
- Instant notification

### Bank Transfer
- Direct bank account debit
- USSD and mobile banking
- Processing may take minutes

---

## 🔌 Webhook Integration

### Paystack Webhook Flow

```
Paystack Payment Completed
        ↓
Sends POST to: https://your-domain.com/api/webhooks/paystack
        ↓
Backend verifies signature
        ↓
Backend queries Paystack API to confirm
        ↓
Updates booking.payment_status = 'confirmed'
        ↓
Triggers flight tracking
        ↓
User notification sent
```

### Webhook Handler (Edge Function)

**File: `supabase/functions/verify-payment/index.ts`**
```typescript
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

export default async function handler(req: Request) {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  try {
    // 1. Verify webhook signature
    const body = await req.text()
    const hash = crypto
      .createHmac('sha512', Deno.env.get('PAYSTACK_SECRET_KEY'))
      .update(body)
      .digest('hex')

    const signature = req.headers.get('x-paystack-signature')
    if (hash !== signature) {
      return new Response('Invalid signature', { status: 401 })
    }

    // 2. Parse event
    const event = JSON.parse(body)
    if (event.event !== 'charge.success') {
      return new Response('OK', { status: 200 })
    }

    // 3. Update database
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL'),
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    )

    const { bookingId } = event.data.metadata
    await supabase
      .from('bookings')
      .update({ payment_status: 'confirmed' })
      .eq('id', bookingId)

    await supabase
      .from('payments')
      .update({ status: 'completed' })
      .eq('reference', event.data.reference)

    return new Response('OK', { status: 200 })
  } catch (error) {
    console.error(error)
    return new Response('Error', { status: 500 })
  }
}
```

---

## 🔐 Security Considerations

1. **Never expose Secret Key** - Keep VITE_PAYSTACK_SECRET_KEY server-side only
2. **Verify signatures** - Always verify webhook signatures
3. **Validate amounts** - Verify amount matches booking price
4. **Use HTTPS** - Webhook endpoint must be HTTPS
5. **Rate limiting** - Implement webhook rate limiting
6. **Idempotency** - Handle duplicate webhook calls

---

## 🧪 Testing Payment Integration

### Test Cards (Paystack Sandbox)

```
Card: 4084084084084081
CVV: 408
Expiry: 12/25

Amount: Any amount in KES
```

### Test M-Pesa
- Paystack provides test M-Pesa credentials
- Check Paystack Sandbox documentation

### Test Webhook Locally
```bash
# Use ngrok to expose localhost
ngrok http 3000

# Add webhook URL to Paystack Dashboard:
# https://your-ngrok-url.ngrok.io/api/webhooks/paystack
```

---

## 📊 Implementation Roadmap

### Phase 1: Foundation (1-2 days)
- [ ] Install Paystack SDK
- [ ] Create payment hook
- [ ] Add database tables
- [ ] Set environment variables

### Phase 2: UI Components (1-2 days)
- [ ] Create PaymentModal component
- [ ] Add price calculation logic
- [ ] Update BookingForm flow
- [ ] Add payment status display

### Phase 3: Backend Integration (1-2 days)
- [ ] Create webhook handler
- [ ] Add payment verification
- [ ] Implement booking status updates
- [ ] Add transaction logging

### Phase 4: Testing & Deployment (1 day)
- [ ] Test all payment methods
- [ ] Test webhook handling
- [ ] Test error scenarios
- [ ] Deploy to production

---

## 📞 Paystack Resources

- **Documentation:** https://paystack.com/docs
- **SDK Reference:** https://paystack.com/docs/libraries-and-plugins/libraries/javascript
- **Testing Guide:** https://paystack.com/docs/payments/test-authentication
- **Webhooks:** https://paystack.com/docs/webhooks/
- **API Reference:** https://paystack.com/docs/api/

---

## 💡 Next Steps

1. **Get Paystack Account** - Sign up at https://paystack.com
2. **Retrieve API Keys** - From Settings → API Keys & Webhooks
3. **Update .env.local** - Add Paystack public key (and private for backend)
4. **Run Database Migration** - Execute SQL to create payments table
5. **Follow Phase 1-4 Implementation** - Implement step by step
6. **Test with Test Cards** - Use Paystack sandbox for testing
7. **Deploy Webhook Handler** - Deploy Edge Function for verification
8. **Monitor Transactions** - Use Paystack Dashboard to monitor payments

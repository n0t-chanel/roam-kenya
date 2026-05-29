# Payment Security & Double-Payment Prevention

## Overview
This document outlines all security measures implemented to prevent double bookings, duplicate payments, and payment fraud in the Roam Kenya booking system.

---

## 1. Client-Side Payment Safeguards

### 1.1 Concurrent Payment Lock (`paymentProcessingRef`)
- **Location**: `ServiceBookingForm.jsx`
- **Purpose**: Prevents multiple payment attempts for the same booking + stage combination
- **Implementation**:
  ```javascript
  const paymentProcessingRef = useRef({}); // Track ongoing payments per booking+stage
  const paymentKey = `${activeBooking.id}_${paymentStage}`;
  
  // Check if payment is already processing
  if (paymentProcessingRef.current[paymentKey]) {
    setPaymentFeedback({ type: "error", message: "Payment is already being processed..." });
    return;
  }
  ```
- **Effect**: If user clicks the payment button twice rapidly, the second click is rejected immediately

### 1.2 Button Disabling Logic
- **Reservation Button**: Disabled when:
  - `isPaying === true`
  - Payment status is `reservation_paid`, `paid`, or `reservation_pending`
- **Final Payment Button**: Disabled when:
  - `isPaying === true`
  - Payment status is `paid`
  - Not in `reservation_paid` or `final_pending` state

### 1.3 Existing Payment Detection
- **Query existing payments** before initiating new payment:
  ```javascript
  const { data: existingPayments } = await supabase
    .from("payments")
    .select("id, status, payment_stage")
    .eq("booking_id", activeBooking.id)
    .eq("payment_stage", paymentStage)
    .in("status", ["pending", "completed", "reservation_paid", "paid"]);
  ```
- **Prevents**: Initiating payment if one already exists for this booking+stage
- **Response**: User gets clear error message with existing payment status

---

## 2. Database-Level Constraints

### 2.1 Payment Reference Uniqueness
- **Column**: `reference` (VARCHAR 100)
- **Constraint**: `UNIQUE NOT NULL`
- **Effect**: Prevents duplicate payment records with the same reference ID
- **Generation**: `reference = createPaymentReference(booking_id) + timestamp`

### 2.2 Unique Payment Stage Constraint
- **SQL**:
  ```sql
  CREATE UNIQUE INDEX idx_payments_booking_stage_unique 
    ON public.payments(booking_id, payment_stage) 
    WHERE status IN ('pending', 'completed');
  ```
- **Purpose**: Ensures only ONE payment per booking per stage can be in pending/completed state
- **Effect**: Database rejects insertion of duplicate payment for same booking+stage

### 2.3 Payment Stage Validation
- **Column**: `payment_stage`
- **Values**: `'reservation'` or `'final'`
- **Constraint**: `CHECK (payment_stage IN ('reservation', 'final'))`
- **Effect**: Prevents invalid payment stage values

### 2.4 Foreign Key Constraints
- **Booking**: `booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE`
- **User**: `user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`
- **Effect**: Orphaned payments cannot exist; cascading deletes prevent inconsistent states

---

## 3. Payment Processing Safety

### 3.1 M-Pesa Payment Flow
1. User selects M-Pesa method and enters phone number
2. `handleBookingPayment("reservation")` called
3. Lock is set: `paymentProcessingRef.current[paymentKey] = true`
4. `initiateMpesaStkPush()` called (creates single STK prompt on phone)
5. System polls for payment status every 5 seconds for 90 seconds
6. Upon completion, payment record is verified and updated
7. Lock is removed: `delete paymentProcessingRef.current[paymentKey]`

**Double-payment prevention**:
- Only ONE STK prompt is sent (checked by `paymentProcessingRef`)
- Polling confirms exact payment status from database
- If user somehow triggers payment again, existing payment is detected
- Database constraint prevents duplicate records

### 3.2 Paystack Payment Flow
1. User selects Paystack and proceeds
2. Lock is set: `paymentProcessingRef.current[paymentKey] = true`
3. Payment record inserted with unique `reference`
4. Paystack checkout modal opened
5. User completes payment in modal
6. `onSuccess` callback verifies payment server-side
7. Payment status updated in database
8. Lock is removed: `delete paymentProcessingRef.current[paymentKey]`

**Double-payment prevention**:
- `reference` is unique, preventing duplicate payment records
- `onSuccess` is called only once by Paystack SDK
- If user somehow retries, existing pending/completed payment is detected
- Paystack's built-in idempotency handling prevents duplicate charges

### 3.3 Cash Payment Flow
1. User selects Cash (Pay Later)
2. Lock is set: `paymentProcessingRef.current[paymentKey] = true`
3. Payment record inserted with status `pending`
4. Admin reviews pending cash payment
5. Lock is removed: `delete paymentProcessingRef.current[paymentKey]`

**Double-payment prevention**:
- Existing payment check prevents duplicate cash payment records
- Admin must manually confirm payment in admin panel
- System shows clear status of cash payments

---

## 4. Error Handling & User Feedback

### 4.1 Clear Error Messages
- **"Payment is already being processed"** - User clicked button multiple times
- **"Payment already completed for reservation stage"** - Payment exists with status `completed`
- **"A payment is already pending for reservation stage"** - Payment exists with status `pending`
- **"Payment amount is missing"** - Booking pricing not calculated
- **"Add a valid phone number"** - M-Pesa selected but phone empty

### 4.2 Recovery Mechanisms
- **M-Pesa Retry**: If payment fails/times out, user can retry from same booking
- **Paystack Retry**: If payment modal is cancelled, user can retry
- **Cash Payment**: Admin manually confirms or denies pending payment

---

## 5. Booking Creation Safety

### 5.1 Booking Uniqueness
- Each booking gets unique UUID from Supabase
- User cannot create multiple bookings for same trip (different booking records)
- Reservation must be paid before final payment can be initiated

### 5.2 Booking Status Validation
- `payment_status` must be one of: `unpaid`, `reservation_pending`, `reservation_paid`, `final_pending`, `paid`
- `payment_stage` must be one of: `reservation`, `final`
- Invalid status combinations are rejected

---

## 6. Payment Verification (Server-Side)

### 6.1 Paystack Verification
- **Function**: `verifyPaymentServerSide()` in `lib/paymentVerification.js`
- **Checks**:
  - Amount matches expected amount
  - Reference matches payment record
  - Paystack API confirms payment status
  - Payment hasn't been verified before
- **Effect**: Only legitimate payments are marked as completed

### 6.2 M-Pesa Verification
- **Function**: `verifyMpesaReceipt()` in `lib/mpesa.js`
- **Checks**:
  - Receipt code format is valid
  - Receipt matches a pending M-Pesa payment
  - Payment status is updated in database
- **Effect**: Only legitimate M-Pesa receipts mark payment as completed

---

## 7. Testing Recommendations

### 7.1 Double-Click Test
1. Create booking with Paystack
2. Rapidly click "Pay 30% Reservation" twice
3. **Expected**: Second click shows "Payment is already being processed" error
4. **Database**: Only ONE payment record should exist

### 7.2 Network Lag Test
1. Create booking with M-Pesa
2. Complete STK prompt on phone
3. Immediately click payment button again
4. **Expected**: Error "Payment already pending" with existing status
5. **Database**: Only ONE payment record should exist

### 7.3 Duplicate Reference Test
1. Create two bookings
2. Manually attempt to create payment record with same reference
3. **Expected**: Database UNIQUE constraint violation
4. **Result**: Payment insertion fails

### 7.4 Invalid Payment Stage Test
1. Attempt to create payment with invalid `payment_stage` value
2. **Expected**: Database CHECK constraint violation
3. **Result**: Payment insertion fails

---

## 8. Admin Responsibilities

### 8.1 Monitoring
- Review pending payments daily
- Check for any duplicate payment attempts in logs
- Monitor refund requests

### 8.2 Manual Confirmation
- For cash payments, admin confirms receipt and marks as completed
- For failed/disputed payments, admin investigates and takes action

### 8.3 Dispute Resolution
- If customer claims double charge, check:
  - Payment records (query by booking_id)
  - Paystack dashboard for actual charges
  - M-Pesa transaction history
  - Email records

---

## 9. Audit Trail

All payments are logged with:
- `created_at`: When payment record was created
- `updated_at`: When payment status last changed
- `status`: Current status (pending, completed, failed, cancelled)
- `payment_method`: How payment was made
- `payment_stage`: Which stage (reservation, final)
- `paystack_response` / M-Pesa logs: Full API response for debugging

---

## 10. Deployment Checklist

- [ ] Run `PAYSTACK_MIGRATIONS.sql` to create payments table with constraints
- [ ] Verify `payment_stage` column exists in payments table
- [ ] Verify unique constraint on `(booking_id, payment_stage)` exists
- [ ] Test double-click scenario in staging environment
- [ ] Test M-Pesa payment flow end-to-end
- [ ] Test Paystack payment flow end-to-end
- [ ] Monitor first day of production for payment errors
- [ ] Set up alerts for duplicate payment attempts

---

## 11. Future Enhancements

- [ ] Implement webhook signatures verification for Paystack
- [ ] Add rate limiting on payment endpoints (1 payment per booking per 5 seconds)
- [ ] Implement idempotency keys for API requests
- [ ] Add payment timing analysis (detect rapid payments to same user)
- [ ] Implement fraud detection rules
- [ ] Add 2FA for payments above threshold

-- Paystack Payment Integration - Database Schema
-- Run this SQL in Supabase SQL Editor

-- ============================================
-- 0. CLEAN UP EXISTING DUPLICATES
-- ============================================

-- Find duplicate payments (multiple payments for same booking+stage)
-- Run this query to see what duplicates exist:
-- SELECT booking_id, payment_stage, COUNT(*) as count FROM payments 
-- GROUP BY booking_id, payment_stage HAVING COUNT(*) > 1;

-- DELETE duplicate payments, keeping only the MOST RECENT one per booking+stage
DELETE FROM public.payments
WHERE id NOT IN (
  SELECT DISTINCT ON (booking_id, payment_stage) id
  FROM public.payments
  ORDER BY booking_id, payment_stage, created_at DESC
);

-- ============================================
-- 1. CREATE PAYMENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  payment_method VARCHAR(50),
  payment_stage VARCHAR(20) DEFAULT 'reservation',
  reference VARCHAR(100) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  paystack_response JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON public.payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_reference ON public.payments(reference);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_payment_stage ON public.payments(payment_stage);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON public.payments(created_at);

-- Add unique constraint to prevent duplicate payments for same booking+stage
CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_booking_stage_unique 
  ON public.payments(booking_id, payment_stage) 
  WHERE status IN ('pending', 'completed');

-- Add check constraint to ensure payment_stage is valid
ALTER TABLE public.payments ADD CONSTRAINT check_payment_stage 
  CHECK (payment_stage IN ('reservation', 'final')) 
  NOT VALID;

-- ============================================
-- 2. UPDATE BOOKINGS TABLE
-- ============================================

-- Add payment tracking columns to bookings table
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'unpaid';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS price_amount INTEGER;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS cancellation_requested_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS refund_status VARCHAR(20) DEFAULT 'none';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS refund_eligible_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS refund_due_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS refund_processed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS refund_reference VARCHAR(100);

-- Create index for payment status
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON public.bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_refund_status ON public.bookings(refund_status);

-- ============================================
-- 3. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on payments table
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view only their own payments
DROP POLICY IF EXISTS "Users can view their own payments" ON public.payments;
CREATE POLICY "Users can view their own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own payments
DROP POLICY IF EXISTS "Users can insert their own payments" ON public.payments;
CREATE POLICY "Users can insert their own payments"
  ON public.payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Service role (Edge Functions) can update payments
DROP POLICY IF EXISTS "Service role can update payments" ON public.payments;
CREATE POLICY "Service role can update payments"
  ON public.payments FOR UPDATE
  USING (TRUE);

-- Update bookings RLS for payment_status
-- The following update will be done by Edge Functions using service role
-- Make sure current bookings policies allow SELECT with payment_status visible

-- ============================================
-- 4. VERIFICATION
-- ============================================

-- Run these queries to verify everything is set up correctly:
SELECT * FROM information_schema.tables WHERE table_name = 'payments';
SELECT * FROM information_schema.columns WHERE table_name = 'payments';
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'payments';

-- ============================================
-- 5. TEST DATA (Optional - for development)
-- ============================================

-- Create a test payment record (OPTIONAL - remove in production)
-- INSERT INTO public.payments (
--   booking_id,
--   user_id,
--   amount,
--   payment_method,
--   reference,
--   status,
--   paystack_response
-- ) VALUES (
--   'booking-uuid-here',
--   'user-uuid-here',
--   150000,
--   'visa',
--   'test_ref_' || gen_random_uuid()::text,
--   'completed',
--   '{"status": "success", "amount": 150000}'
-- );

-- ============================================
-- 6. SAMPLE QUERIES
-- ============================================

-- Get all payments for a user
-- SELECT * FROM payments WHERE user_id = 'user-uuid' ORDER BY created_at DESC;

-- Get payment for a booking
-- SELECT * FROM payments WHERE booking_id = 'booking-uuid';

-- Get completed payments from last 7 days
-- SELECT * FROM payments WHERE status = 'completed' AND created_at > NOW() - INTERVAL '7 days';

-- Get payment statistics
-- SELECT 
--   payment_method,
--   COUNT(*) as transaction_count,
--   SUM(amount) as total_amount_cents,
--   SUM(amount) / 100.0 as total_amount_kes
-- FROM payments 
-- WHERE status = 'completed'
-- GROUP BY payment_method;

-- ============================================
-- END OF MIGRATION
-- ============================================

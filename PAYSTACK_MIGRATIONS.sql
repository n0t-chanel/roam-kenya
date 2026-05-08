-- Paystack Payment Integration - Database Schema
-- Run this SQL in Supabase SQL Editor

-- ============================================
-- 1. CREATE PAYMENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL COMMENT 'Amount in KES cents (e.g., 150000 = KES 1,500)',
  payment_method VARCHAR(50),
  reference VARCHAR(100) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' COMMENT 'pending, completed, failed, cancelled',
  paystack_response JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON public.payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_reference ON public.payments(reference);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON public.payments(created_at);

-- ============================================
-- 2. UPDATE BOOKINGS TABLE
-- ============================================

-- Add payment tracking columns to bookings table
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'unpaid' COMMENT 'unpaid, paid';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS price_amount INTEGER COMMENT 'Price in KES cents (e.g., 150000 = KES 1,500)';

-- Create index for payment status
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON public.bookings(payment_status);

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
DESC public.payments;

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

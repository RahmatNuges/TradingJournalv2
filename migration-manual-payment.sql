-- =====================================================
-- Manual Payment System Migration
-- =====================================================
-- Run this in Supabase SQL Editor

-- =====================================================
-- 1. MODIFY ORDERS TABLE
-- =====================================================

-- Add manual payment columns
ALTER TABLE orders ADD COLUMN IF NOT EXISTS bank_name VARCHAR(50) DEFAULT 'BCA';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS bank_account_name VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_proof_url TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS admin_viewed BOOLEAN DEFAULT false;

-- Update status constraint to include REJECTED
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check 
    CHECK (status IN ('PENDING', 'PAID', 'EXPIRED', 'FAILED', 'REJECTED'));

-- Remove Xendit columns (optional - uncomment if you want to remove)
-- ALTER TABLE orders DROP COLUMN IF EXISTS xendit_invoice_id;
-- ALTER TABLE orders DROP COLUMN IF EXISTS xendit_invoice_url;

-- =====================================================
-- 2. CREATE STORAGE BUCKET
-- =====================================================

-- Create payment-proofs bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 3. RLS POLICIES FOR ORDERS
-- =====================================================

-- Allow authenticated users to create their own orders
DROP POLICY IF EXISTS "Users can create own orders" ON orders;
CREATE POLICY "Users can create own orders" 
ON orders FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Allow admins to view all orders
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
CREATE POLICY "Admins can view all orders" 
ON orders FOR SELECT 
TO authenticated 
USING (is_admin(auth.uid()));

-- Allow admins to update orders (approve/reject)
DROP POLICY IF EXISTS "Admins can update orders" ON orders;
CREATE POLICY "Admins can update orders" 
ON orders FOR UPDATE 
TO authenticated 
USING (is_admin(auth.uid()));

-- =====================================================
-- 4. RLS POLICIES FOR SUBSCRIPTIONS
-- =====================================================

-- Allow admins to create subscriptions
DROP POLICY IF EXISTS "Admins can create subscriptions" ON subscriptions;
CREATE POLICY "Admins can create subscriptions" 
ON subscriptions FOR INSERT 
TO authenticated 
WITH CHECK (is_admin(auth.uid()));

-- Allow admins to view all subscriptions
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON subscriptions;
CREATE POLICY "Admins can view all subscriptions" 
ON subscriptions FOR SELECT 
TO authenticated 
USING (is_admin(auth.uid()));

-- =====================================================
-- 5. STORAGE POLICIES
-- =====================================================

-- Allow authenticated users to upload payment proofs
DROP POLICY IF EXISTS "Users can upload payment proofs" ON storage.objects;
CREATE POLICY "Users can upload payment proofs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'payment-proofs');

-- Allow public read access for payment proofs (so admin can see)
DROP POLICY IF EXISTS "Public can view payment proofs" ON storage.objects;
CREATE POLICY "Public can view payment proofs"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'payment-proofs');

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check orders table structure
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'orders' ORDER BY ordinal_position;

-- Check storage buckets
-- SELECT * FROM storage.buckets;

-- Check RLS policies
-- SELECT schemaname, tablename, policyname FROM pg_policies 
-- WHERE tablename IN ('orders', 'subscriptions') ORDER BY tablename;

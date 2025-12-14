-- =====================================================
-- Admin RLS Policies and CRUD Permissions
-- Run this SQL in Supabase SQL Editor AFTER running supabase-payment-schema.sql
-- =====================================================

-- First, create a function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = auth.uid()
        AND raw_user_meta_data->>'is_admin' = 'true'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- UPDATE RLS POLICIES: Allow Admin Access
-- =====================================================

-- PRODUCTS: Admin can do everything
DROP POLICY IF EXISTS "Anyone can view products" ON products;
DROP POLICY IF EXISTS "Admin can manage products" ON products;

CREATE POLICY "Anyone can view products" ON products 
    FOR SELECT USING (true);

CREATE POLICY "Admin can insert products" ON products 
    FOR INSERT WITH CHECK (public.is_current_user_admin());

CREATE POLICY "Admin can update products" ON products 
    FOR UPDATE USING (public.is_current_user_admin());

CREATE POLICY "Admin can delete products" ON products 
    FOR DELETE USING (public.is_current_user_admin());

-- =====================================================
-- COUPONS: Admin can CRUD
-- =====================================================
DROP POLICY IF EXISTS "Admin can view coupons" ON coupons;

CREATE POLICY "Admin can view coupons" ON coupons 
    FOR SELECT USING (public.is_current_user_admin());

CREATE POLICY "Admin can insert coupons" ON coupons 
    FOR INSERT WITH CHECK (public.is_current_user_admin());

CREATE POLICY "Admin can update coupons" ON coupons 
    FOR UPDATE USING (public.is_current_user_admin());

CREATE POLICY "Admin can delete coupons" ON coupons 
    FOR DELETE USING (public.is_current_user_admin());

-- =====================================================
-- ORDERS: Users view own, Admin can view all
-- =====================================================
DROP POLICY IF EXISTS "Users can view own orders" ON orders;

CREATE POLICY "Users can view own orders" ON orders 
    FOR SELECT USING (
        auth.uid() = user_id 
        OR public.is_current_user_admin()
    );

CREATE POLICY "Admin can update orders" ON orders 
    FOR UPDATE USING (public.is_current_user_admin());

-- =====================================================
-- SUBSCRIPTIONS: Users view own, Admin can view all
-- =====================================================
DROP POLICY IF EXISTS "Users can view own subscription" ON subscriptions;

CREATE POLICY "Users can view own subscription" ON subscriptions 
    FOR SELECT USING (
        auth.uid() = user_id 
        OR public.is_current_user_admin()
    );

CREATE POLICY "Admin can manage subscriptions" ON subscriptions 
    FOR ALL USING (public.is_current_user_admin());

-- =====================================================
-- GRANT PUBLIC ACCESS TO THE FUNCTION
-- =====================================================
GRANT EXECUTE ON FUNCTION public.is_current_user_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_current_user_admin() TO anon;

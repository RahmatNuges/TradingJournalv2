-- =====================================================
-- Trading Journal V2 - Payment & Admin Schema
-- =====================================================
-- Run this SQL in Supabase SQL Editor

-- =====================================================
-- TABLE: products (Subscription Plans)
-- =====================================================
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price_idr DECIMAL(12, 0) NOT NULL,
    duration_days INTEGER NOT NULL DEFAULT 30,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default plans
INSERT INTO products (name, description, price_idr, duration_days, sort_order) VALUES
    ('Mingguan', 'Akses penuh selama 7 hari', 4999, 7, 1),
    ('Bulanan', 'Akses penuh selama 30 hari', 14999, 30, 2),
    ('Tahunan', 'Akses penuh selama 365 hari - HEMAT!', 139999, 365, 3);

-- =====================================================
-- TABLE: coupons
-- =====================================================
CREATE TABLE IF NOT EXISTS coupons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_percent INTEGER CHECK (discount_percent BETWEEN 1 AND 100),
    discount_amount DECIMAL(12, 0),
    max_uses INTEGER,
    used_count INTEGER DEFAULT 0,
    valid_until TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLE: orders
-- =====================================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_email VARCHAR(255),
    product_id UUID REFERENCES products(id),
    coupon_id UUID REFERENCES coupons(id),
    external_id VARCHAR(100) UNIQUE NOT NULL,
    xendit_invoice_id VARCHAR(100),
    xendit_invoice_url TEXT,
    amount_original DECIMAL(12, 0) NOT NULL,
    discount_amount DECIMAL(12, 0) DEFAULT 0,
    amount_final DECIMAL(12, 0) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID', 'EXPIRED', 'FAILED')),
    paid_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_external_id ON orders(external_id);

-- =====================================================
-- TABLE: subscriptions
-- =====================================================
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    order_id UUID REFERENCES orders(id),
    plan_name VARCHAR(100),
    starts_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_expires_at ON subscriptions(expires_at);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

-- Products: Anyone can read, only service role can modify
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view products" ON products FOR SELECT USING (true);

-- Coupons: Only service role can access (verified server-side)
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Orders: Users can view own orders, service role can modify all
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);

-- Subscriptions: Users can view own subscription
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own subscription" ON subscriptions FOR SELECT USING (auth.uid() = user_id);

-- =====================================================
-- ADMIN CHECK FUNCTION
-- =====================================================
-- Check if user is admin via user_metadata
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = user_id
        AND raw_user_meta_data->>'is_admin' = 'true'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to increment coupon usage
CREATE OR REPLACE FUNCTION increment_coupon_usage(p_coupon_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE coupons
    SET used_count = used_count + 1
    WHERE id = p_coupon_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

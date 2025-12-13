-- =====================================================
-- DISABLE RLS FOR PERSONAL USE
-- =====================================================
-- Run this in Supabase SQL Editor to allow writes without authentication
-- This is safe for personal/single-user applications

-- Disable RLS on all tables
ALTER TABLE spot_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE futures_trades DISABLE ROW LEVEL SECURITY;
ALTER TABLE balance_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings DISABLE ROW LEVEL SECURITY;

-- Drop the user_id requirement by making it nullable
-- (Only run if you get NOT NULL constraint errors)
-- ALTER TABLE spot_transactions ALTER COLUMN user_id DROP NOT NULL;
-- ALTER TABLE futures_trades ALTER COLUMN user_id DROP NOT NULL;
-- ALTER TABLE balance_history ALTER COLUMN user_id DROP NOT NULL;
-- ALTER TABLE user_settings ALTER COLUMN user_id DROP NOT NULL;

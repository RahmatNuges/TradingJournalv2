-- =====================================================
-- Trading Journal V2 - Supabase Database Schema
-- =====================================================
-- Jalankan SQL ini di Supabase SQL Editor

-- =====================================================
-- TABLE: spot_transactions (DCA Support)
-- =====================================================
CREATE TABLE IF NOT EXISTS spot_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol VARCHAR(20) NOT NULL,
  name VARCHAR(100),
  quantity DECIMAL(20, 8) NOT NULL,
  price_usd DECIMAL(20, 8) NOT NULL,
  type VARCHAR(10) NOT NULL CHECK (type IN ('BUY', 'SELL')),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index untuk query per user
CREATE INDEX IF NOT EXISTS idx_spot_transactions_user_id ON spot_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_spot_transactions_symbol ON spot_transactions(symbol);

-- =====================================================
-- TABLE: futures_trades
-- =====================================================
CREATE TABLE IF NOT EXISTS futures_trades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  pair VARCHAR(20) NOT NULL,
  direction VARCHAR(10) NOT NULL CHECK (direction IN ('LONG', 'SHORT')),
  leverage INTEGER NOT NULL DEFAULT 1,
  entry_price DECIMAL(20, 8) NOT NULL,
  exit_price DECIMAL(20, 8) NOT NULL,
  position_size DECIMAL(20, 2) NOT NULL,
  fee_percent DECIMAL(10, 4) DEFAULT 0.05,
  fee_amount DECIMAL(20, 2) DEFAULT 0,
  pnl DECIMAL(20, 2) NOT NULL,
  net_pnl DECIMAL(20, 2) NOT NULL,
  pnl_percent DECIMAL(10, 2) NOT NULL,
  rrr DECIMAL(10, 2),
  result VARCHAR(10) NOT NULL CHECK (result IN ('WIN', 'LOSS', 'BE')),
  stop_loss DECIMAL(20, 8),
  take_profit DECIMAL(20, 8),
  strategy VARCHAR(100),
  notes TEXT,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index untuk query
CREATE INDEX IF NOT EXISTS idx_futures_trades_user_id ON futures_trades(user_id);
CREATE INDEX IF NOT EXISTS idx_futures_trades_date ON futures_trades(date);

-- =====================================================
-- TABLE: balance_history
-- =====================================================
CREATE TABLE IF NOT EXISTS balance_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('INITIAL', 'DEPOSIT', 'WITHDRAW', 'TRADE')),
  amount DECIMAL(20, 2) NOT NULL,
  balance_after DECIMAL(20, 2) NOT NULL,
  note VARCHAR(255),
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_balance_history_user_id ON balance_history(user_id);
CREATE INDEX IF NOT EXISTS idx_balance_history_date ON balance_history(date);

-- =====================================================
-- TABLE: user_settings
-- =====================================================
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  default_fee_percent DECIMAL(10, 4) DEFAULT 0.05,
  default_leverage INTEGER DEFAULT 10,
  theme VARCHAR(10) DEFAULT 'dark',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================
-- Enable RLS on all tables
ALTER TABLE spot_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE futures_trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE balance_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only see/edit their own data
CREATE POLICY "Users can view own spot_transactions"
  ON spot_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own spot_transactions"
  ON spot_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own spot_transactions"
  ON spot_transactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own spot_transactions"
  ON spot_transactions FOR DELETE
  USING (auth.uid() = user_id);

-- Repeat for futures_trades
CREATE POLICY "Users can view own futures_trades"
  ON futures_trades FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own futures_trades"
  ON futures_trades FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own futures_trades"
  ON futures_trades FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own futures_trades"
  ON futures_trades FOR DELETE
  USING (auth.uid() = user_id);

-- Repeat for balance_history
CREATE POLICY "Users can view own balance_history"
  ON balance_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own balance_history"
  ON balance_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own balance_history"
  ON balance_history FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own balance_history"
  ON balance_history FOR DELETE
  USING (auth.uid() = user_id);

-- Repeat for user_settings
CREATE POLICY "Users can view own user_settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own user_settings"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own user_settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own user_settings"
  ON user_settings FOR DELETE
  USING (auth.uid() = user_id);

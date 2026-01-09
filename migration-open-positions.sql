-- Migration: Add Open Positions Dashboard Support
-- Run this in Supabase SQL Editor

-- Add status column for tracking open/closed positions
ALTER TABLE futures_trades 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'CLOSED';

-- Add technical notes column
ALTER TABLE futures_trades 
ADD COLUMN IF NOT EXISTS technical_notes TEXT;

-- Add psychology notes column  
ALTER TABLE futures_trades 
ADD COLUMN IF NOT EXISTS psychology_notes TEXT;

-- Add planned R:R (user's intended risk-reward before trade)
ALTER TABLE futures_trades 
ADD COLUMN IF NOT EXISTS planned_rr DECIMAL(10,2);

-- Add psychology mood/state (for quick tagging)
ALTER TABLE futures_trades 
ADD COLUMN IF NOT EXISTS psychology_state VARCHAR(50);

-- Update existing trades to have CLOSED status (backward compatible)
UPDATE futures_trades SET status = 'CLOSED' WHERE status IS NULL;

-- Create index for faster queries on open positions
CREATE INDEX IF NOT EXISTS idx_futures_trades_status ON futures_trades(status);

-- Verify changes
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'futures_trades' 
AND column_name IN ('status', 'technical_notes', 'psychology_notes', 'planned_rr', 'psychology_state');

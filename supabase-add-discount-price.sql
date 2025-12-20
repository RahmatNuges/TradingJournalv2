-- Add discount_price_idr column to products table
-- Run this migration in your Supabase SQL Editor

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS discount_price_idr BIGINT DEFAULT NULL;

-- Optional: Add comment for clarity
COMMENT ON COLUMN products.discount_price_idr IS 'Optional discounted price in IDR. When set, original price will be shown with strikethrough.';

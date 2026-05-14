-- ============================================================
-- BestChappals — Orders Table Schema (v2)
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Orders Table ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             TEXT,                          -- Clerk user ID (nullable for guest)
  products            JSONB NOT NULL,                -- Array of OrderProduct objects
  amount              NUMERIC(10, 2) NOT NULL,       -- Total in INR
  amount_paise        INTEGER NOT NULL,              -- Total in paise
  payment_id          TEXT,                          -- Razorpay payment ID (after success)
  razorpay_order_id   TEXT UNIQUE,                   -- Razorpay order ID
  payment_status      TEXT NOT NULL DEFAULT 'pending'
                        CHECK (payment_status IN ('pending','paid','failed','refunded')),
  order_status        TEXT NOT NULL DEFAULT 'pending'
                        CHECK (order_status IN ('pending','processing','shipped','delivered','cancelled')),
  shipping_address    JSONB NOT NULL,                -- ShippingAddress object
  payment_details     JSONB,                         -- Full Razorpay payment details
  coupon_code         TEXT,
  discount            NUMERIC(10, 2) DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Auto-update updated_at ───────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- ─── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id ON orders(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- ─── Row Level Security (RLS) ─────────────────────────────────────────────────
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Service role can manage all orders" ON orders;

-- Service role bypasses RLS (used by server API routes with service key)
-- This allows our Next.js API routes to read/write all orders
CREATE POLICY "Service role bypass"
  ON orders FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Anon / authenticated users can only see their own orders
-- Note: We use service_role in API routes so this policy mainly applies to
-- direct Supabase client calls from the browser (if any)
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (user_id = (auth.jwt() ->> 'sub'));

-- ─── Webhook logs table ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS webhook_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type  TEXT NOT NULL,
  payload     JSONB NOT NULL,
  processed   BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE orders IS 'BestChappals order records with Razorpay payment tracking';
COMMENT ON COLUMN orders.payment_details IS 'Full Razorpay payment object (amount, method, bank, vpa, etc.)';
COMMENT ON COLUMN orders.user_id IS 'Clerk user ID — null for guest checkouts';

-- ─── IMPORTANT: Add service role key to .env.local ───────────────────────────
-- Go to: supabase.com → your project → Settings → API
-- Copy "service_role secret" and add to .env.local:
-- SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

-- ============================================================
-- BestChappals Admin Dashboard — Complete Schema
-- Run this in your Supabase SQL Editor (Settings → SQL Editor)
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── CATEGORIES TABLE ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL UNIQUE,
  slug        TEXT NOT NULL UNIQUE,
  image       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed default categories
INSERT INTO categories (name, slug, image) VALUES
  ('Sneakers',          'sneakers', '/products/first_prefer_sneakers/img-1.jpg'),
  ('Women',             'women',    '/products/first_prefer_Ladies/img-24.jpg'),
  ('Slides & Flips',    'slides',   '/products/first_prefer_slides/img-4.jpg'),
  ('Crocs',             'crocs',    '/products/first_prefer_crocks/img-5.jpg'),
  ('Formals & Loafers', 'formals',  '/products/first_prefer_formals/img-1.jpg'),
  ('Men''s Footwear',   'men',      '/products/first_prefer_Mens&Boys/img-14.jpg')
ON CONFLICT (slug) DO NOTHING;

-- ─── PRODUCTS TABLE ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  description   TEXT DEFAULT '',
  category      TEXT NOT NULL,
  subcategory   TEXT DEFAULT '',
  brand         TEXT DEFAULT 'BestChappals',
  price         NUMERIC(10, 2) NOT NULL,
  offer_price   NUMERIC(10, 2),
  images        TEXT[] NOT NULL DEFAULT '{}',
  sizes         JSONB NOT NULL DEFAULT '[]',
  -- sizes format: [{"size": "7", "stock": 10}, {"size": "8", "stock": 5}]
  stock         INTEGER NOT NULL DEFAULT 0,
  trending      BOOLEAN NOT NULL DEFAULT false,
  featured      BOOLEAN NOT NULL DEFAULT false,
  is_new        BOOLEAN NOT NULL DEFAULT false,
  out_of_stock  BOOLEAN NOT NULL DEFAULT false,
  tags          TEXT[] DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── USERS TABLE (synced from Clerk via webhooks) ─────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id              TEXT PRIMARY KEY,               -- Clerk user ID
  email           TEXT,
  first_name      TEXT,
  last_name       TEXT,
  phone           TEXT,
  image_url       TEXT,
  is_blocked      BOOLEAN NOT NULL DEFAULT false,
  total_orders    INTEGER NOT NULL DEFAULT 0,
  total_spent     NUMERIC(10, 2) NOT NULL DEFAULT 0,
  last_order_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── ORDERS TABLE ─────────────────────────────────────────────────────────────
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

-- ─── WEBHOOK LOGS TABLE ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS webhook_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type  TEXT NOT NULL,
  payload     JSONB NOT NULL,
  processed   BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── ADMINS TABLE ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admins (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id    TEXT NOT NULL UNIQUE,               -- Clerk user ID
  email       TEXT NOT NULL,
  name        TEXT,
  role        TEXT NOT NULL DEFAULT 'admin'
                CHECK (role IN ('admin', 'super_admin')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── COUPONS TABLE ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coupons (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code            TEXT NOT NULL UNIQUE,
  description     TEXT DEFAULT '',
  discount_type   TEXT NOT NULL DEFAULT 'percentage'
                    CHECK (discount_type IN ('percentage', 'flat')),
  discount_value  NUMERIC(10, 2) NOT NULL,
  min_order       NUMERIC(10, 2) DEFAULT 0,
  max_discount    NUMERIC(10, 2),
  usage_limit     INTEGER,
  used_count      INTEGER NOT NULL DEFAULT 0,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  expires_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── PAYMENTS TABLE ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id            UUID REFERENCES orders(id) ON DELETE SET NULL,
  user_id             TEXT,
  amount              NUMERIC(10, 2) NOT NULL,
  currency            TEXT DEFAULT 'INR',
  razorpay_payment_id TEXT,
  razorpay_order_id   TEXT,
  razorpay_signature  TEXT,
  method              TEXT,                        -- card, upi, netbanking, wallet
  status              TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'captured', 'failed', 'refunded')),
  payment_details     JSONB,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── ORDER ITEMS TABLE (normalized from orders.products JSONB) ────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id  UUID REFERENCES products(id) ON DELETE SET NULL,
  name        TEXT NOT NULL,
  category    TEXT,
  image       TEXT,
  price       NUMERIC(10, 2) NOT NULL,
  size        TEXT,
  quantity    INTEGER NOT NULL DEFAULT 1,
  subtotal    NUMERIC(10, 2) NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── AUTO-UPDATE updated_at TRIGGERS ──────────────────────────────────────────
-- Reuse the function from supabase-schema.sql if it exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_coupons_updated_at
  BEFORE UPDATE ON coupons
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ─── INDEXES ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_trending ON products(trending) WHERE trending = true;
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_products_out_of_stock ON products(out_of_stock);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_name_search ON products USING gin(to_tsvector('english', name));

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_admins_clerk_id ON admins(clerk_id);

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────────────────────

-- Products: public read, admin write
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read products"
  ON products FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Service role manages products"
  ON products FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Categories: public read, admin write
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read categories"
  ON categories FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Service role manages categories"
  ON categories FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Users: service role only
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages users"
  ON users FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Admins: service role only
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages admins"
  ON admins FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Coupons: public read active, admin write
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active coupons"
  ON coupons FOR SELECT TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Service role manages coupons"
  ON coupons FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Payments: service role only
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages payments"
  ON payments FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Order items: service role only
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages order_items"
  ON order_items FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Orders: service role only
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages orders"
  ON orders FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT TO authenticated
  USING (user_id = (auth.jwt() ->> 'sub'));

-- ─── ENABLE REALTIME ──────────────────────────────────────────────────────────
-- Products, orders, categories get realtime so user site updates instantly
ALTER PUBLICATION supabase_realtime ADD TABLE products;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE categories;

-- ─── SUPABASE STORAGE BUCKET FOR PRODUCT IMAGES ──────────────────────────────
-- Run this separately or via Supabase Dashboard → Storage → Create Bucket
-- Bucket name: product-images (public)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

-- ─── HELPFUL VIEWS ────────────────────────────────────────────────────────────

-- Monthly revenue view
CREATE OR REPLACE VIEW monthly_revenue AS
SELECT
  date_trunc('month', created_at) AS month,
  COUNT(*) AS order_count,
  SUM(amount) AS revenue
FROM orders
WHERE payment_status = 'paid'
GROUP BY date_trunc('month', created_at)
ORDER BY month DESC;

-- Daily revenue view (last 30 days)
CREATE OR REPLACE VIEW daily_revenue AS
SELECT
  date_trunc('day', created_at)::date AS day,
  COUNT(*) AS order_count,
  SUM(amount) AS revenue
FROM orders
WHERE payment_status = 'paid'
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY date_trunc('day', created_at)::date
ORDER BY day DESC;

-- Top selling products view
CREATE OR REPLACE VIEW top_selling_products AS
SELECT
  p.elem->>'name' AS product_name,
  p.elem->>'productId' AS product_id,
  p.elem->>'category' AS category,
  SUM((p.elem->>'quantity')::int) AS total_sold,
  SUM((p.elem->>'subtotal')::numeric) AS total_revenue
FROM orders o,
  jsonb_array_elements(o.products) AS p(elem)
WHERE o.payment_status = 'paid'
GROUP BY p.elem->>'name', p.elem->>'productId', p.elem->>'category'
ORDER BY total_sold DESC
LIMIT 20;

COMMENT ON TABLE products IS 'Product catalog managed by admin dashboard';
COMMENT ON TABLE categories IS 'Product categories managed by admin';
COMMENT ON TABLE users IS 'User records synced from Clerk via webhooks';
COMMENT ON TABLE admins IS 'Admin user registry';
COMMENT ON TABLE coupons IS 'Discount coupons managed by admin';
COMMENT ON TABLE payments IS 'Payment records linked to orders';
COMMENT ON TABLE order_items IS 'Normalized order line items';

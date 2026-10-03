-- =====================================================
-- Olive Orders - Full Supabase Schema and Queries
-- Schema: oliveorders
-- =====================================================

CREATE SCHEMA IF NOT EXISTS oliveorders;

-- =====================================================
-- 1) user_profiles
-- =====================================================
CREATE TABLE IF NOT EXISTS oliveorders.user_profiles (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id VARCHAR(100) NOT NULL UNIQUE,
  full_name VARCHAR(150),
  phone VARCHAR(30),
  password TEXT NOT NULL,
  role VARCHAR(30) NOT NULL DEFAULT 'shop_manager'
    CHECK (role IN ('super_admin', 'kitchen_admin', 'shop_manager')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- 2) shops
-- owner_name and owner_passcode are optional
-- =====================================================
CREATE TABLE IF NOT EXISTS oliveorders.shops (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- 3) user_shop_access
-- =====================================================
CREATE TABLE IF NOT EXISTS oliveorders.user_shop_access (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES oliveorders.user_profiles(id) ON DELETE CASCADE,
  shop_id INTEGER NOT NULL REFERENCES oliveorders.shops(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, shop_id)
);

-- =====================================================
-- 4) flavors
-- =====================================================
CREATE TABLE IF NOT EXISTS oliveorders.flavors (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  price_medium NUMERIC(10,2) DEFAULT 0,
  price_large NUMERIC(10,2) DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- 5) orders
-- =====================================================
CREATE TABLE IF NOT EXISTS oliveorders.orders (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_type VARCHAR(50) NOT NULL DEFAULT 'Regular',
  date_time TIMESTAMPTZ,
  customer_name VARCHAR(150),
  contact_no VARCHAR(30),
  flavor_id VARCHAR(100) REFERENCES oliveorders.flavors(id),
  quantity VARCHAR(50),
  custom_qty_details TEXT,
  wishes TEXT,
  design_details TEXT,
  advance_amount NUMERIC(10,2) DEFAULT 0,
  total_amount NUMERIC(10,2) DEFAULT 0,
  balance_amount NUMERIC(10,2) DEFAULT 0,
  reference_image TEXT,
  created_by INTEGER REFERENCES oliveorders.user_profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- 6) shop_inventory
-- =====================================================
CREATE TABLE IF NOT EXISTS oliveorders.shop_inventory (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  shop_id INTEGER NOT NULL REFERENCES oliveorders.shops(id) ON DELETE CASCADE,
  flavor_id VARCHAR(100) NOT NULL REFERENCES oliveorders.flavors(id),
  quantity VARCHAR(50) NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  sold INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(30) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'verified', 'sold_out')),
  received_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (shop_id, flavor_id, quantity)
);

-- =====================================================
-- 7) shop_sales
-- =====================================================
CREATE TABLE IF NOT EXISTS oliveorders.shop_sales (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  shop_id INTEGER NOT NULL REFERENCES oliveorders.shops(id) ON DELETE CASCADE,
  flavor_id VARCHAR(100) NOT NULL REFERENCES oliveorders.flavors(id),
  sale_type VARCHAR(50) NOT NULL
    CHECK (sale_type IN ('direct', 'swiggy', 'zomato')),
  quantity VARCHAR(50),
  units INTEGER NOT NULL DEFAULT 0,
  amount NUMERIC(10,2) DEFAULT 0,
  sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_by INTEGER REFERENCES oliveorders.user_profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- 8) kitchen_sessions
-- =====================================================
CREATE TABLE IF NOT EXISTS oliveorders.kitchen_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL,
  session_date DATE NOT NULL,
  created_by INTEGER REFERENCES oliveorders.user_profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- 9) kitchen_session_items
-- =====================================================
CREATE TABLE IF NOT EXISTS oliveorders.kitchen_session_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES oliveorders.kitchen_sessions(id) ON DELETE CASCADE,
  flavor_id VARCHAR(100) NOT NULL REFERENCES oliveorders.flavors(id),
  quantity VARCHAR(50) NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  approved BOOLEAN NOT NULL DEFAULT false,
  approved_by INTEGER REFERENCES oliveorders.user_profiles(id),
  approved_at TIMESTAMPTZ,
  shop_id INTEGER REFERENCES oliveorders.shops(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- RLS ENABLED
-- =====================================================
ALTER TABLE oliveorders.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE oliveorders.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE oliveorders.user_shop_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE oliveorders.flavors ENABLE ROW LEVEL SECURITY;
ALTER TABLE oliveorders.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE oliveorders.shop_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE oliveorders.shop_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE oliveorders.kitchen_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE oliveorders.kitchen_session_items ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES (simple open access for custom db auth)
-- =====================================================
DROP POLICY IF EXISTS "user_profiles_all_access" ON oliveorders.user_profiles;
DROP POLICY IF EXISTS "shops_all_access" ON oliveorders.shops;
DROP POLICY IF EXISTS "user_shop_access_all_access" ON oliveorders.user_shop_access;
DROP POLICY IF EXISTS "flavors_all_access" ON oliveorders.flavors;
DROP POLICY IF EXISTS "orders_all_access" ON oliveorders.orders;
DROP POLICY IF EXISTS "shop_inventory_all_access" ON oliveorders.shop_inventory;
DROP POLICY IF EXISTS "shop_sales_all_access" ON oliveorders.shop_sales;
DROP POLICY IF EXISTS "kitchen_sessions_all_access" ON oliveorders.kitchen_sessions;
DROP POLICY IF EXISTS "kitchen_session_items_all_access" ON oliveorders.kitchen_session_items;

CREATE POLICY "user_profiles_all_access"
ON oliveorders.user_profiles
FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "shops_all_access"
ON oliveorders.shops
FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "user_shop_access_all_access"
ON oliveorders.user_shop_access
FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "flavors_all_access"
ON oliveorders.flavors
FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "orders_all_access"
ON oliveorders.orders
FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "shop_inventory_all_access"
ON oliveorders.shop_inventory
FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "shop_sales_all_access"
ON oliveorders.shop_sales
FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "kitchen_sessions_all_access"
ON oliveorders.kitchen_sessions
FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "kitchen_session_items_all_access"
ON oliveorders.kitchen_session_items
FOR ALL
USING (true)
WITH CHECK (true);

-- =====================================================
-- Seed data
-- =====================================================
INSERT INTO oliveorders.user_profiles (user_id, full_name, phone, password, role, is_active)
VALUES
  ('superadmin', 'Super Admin', '9999999999', 'Olive@2026', 'super_admin', true),
  ('shop_mgr_1', 'Shop Manager One', '9876543210', 'Shop@123', 'shop_manager', true),
  ('kitchen_admin', 'Kitchen Admin', '8888888888', 'Kitchen@123', 'kitchen_admin', true)
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO oliveorders.shops (name)
VALUES
  ('Main Branch'),
  ('City Branch')
ON CONFLICT DO NOTHING;

INSERT INTO oliveorders.user_shop_access (user_id, shop_id)
SELECT up.id, s.id
FROM oliveorders.user_profiles up
JOIN oliveorders.shops s ON s.name = 'Main Branch'
WHERE up.user_id = 'shop_mgr_1'
ON CONFLICT DO NOTHING;

INSERT INTO oliveorders.flavors (name, price_medium, price_large)
VALUES
  ('Chocolate', 650, 950),
  ('Vanilla', 600, 900),
  ('Strawberry', 700, 1000),
  ('Red Velvet', 750, 1100)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- CRUD / app queries
-- =====================================================
-- 1. Login by User ID
SELECT *
FROM oliveorders.user_profiles
WHERE user_id = 'shop_mgr_1'
LIMIT 1;

-- 2. Create user
INSERT INTO oliveorders.user_profiles (user_id, full_name, phone, password, role, is_active)
VALUES ('shop_mgr_2', 'Shop Manager Two', '9123456789', 'Shop@123', 'shop_manager', true);

-- 3. Create shop
INSERT INTO oliveorders.shops (name)
VALUES ('New Branch');

-- 4. Create shop and assign manager in one action
WITH inserted_shop AS (
  INSERT INTO oliveorders.shops (name)
  VALUES ('Main Branch 2')
  RETURNING id
)
INSERT INTO oliveorders.user_shop_access (user_id, shop_id)
SELECT
  up.id,
  ins.id
FROM inserted_shop ins
CROSS JOIN oliveorders.user_profiles up
WHERE up.user_id = 'shop_mgr_1';

-- 5. Assign existing manager to existing shop
INSERT INTO oliveorders.user_shop_access (user_id, shop_id)
VALUES (
  (SELECT id FROM oliveorders.user_profiles WHERE user_id = 'shop_mgr_1'),
  (SELECT id FROM oliveorders.shops WHERE name = 'Main Branch')
);

-- 6. Get shops for a manager
SELECT s.*
FROM oliveorders.user_shop_access usa
JOIN oliveorders.shops s ON s.id = usa.shop_id
WHERE usa.user_id = (
  SELECT id FROM oliveorders.user_profiles WHERE user_id = 'shop_mgr_1'
);

-- 7. Get manager profile + assigned shops
SELECT up.*, s.*
FROM oliveorders.user_profiles up
LEFT JOIN oliveorders.user_shop_access usa ON usa.user_id = up.id
LEFT JOIN oliveorders.shops s ON s.id = usa.shop_id
WHERE up.user_id = 'shop_mgr_1';

-- 8. Add flavor
INSERT INTO oliveorders.flavors (name, price_medium, price_large)
VALUES ('Butterscotch', 700, 1050);

-- 9. Orders list
SELECT *
FROM oliveorders.orders
ORDER BY created_at DESC;

-- 10. Add order
INSERT INTO oliveorders.orders (
  order_type,
  date_time,
  customer_name,
  contact_no,
  flavor_id,
  quantity,
  custom_qty_details,
  wishes,
  design_details,
  advance_amount,
  total_amount,
  balance_amount,
  reference_image,
  created_by
)
VALUES (
  'Regular',
  now(),
  'Customer Name',
  '9876543210',
  (SELECT id FROM oliveorders.flavors WHERE name = 'Chocolate'),
  'medium',
  NULL,
  'Happy Birthday',
  NULL,
  500,
  1200,
  700,
  NULL,
  (SELECT id FROM oliveorders.user_profiles WHERE user_id = 'shop_mgr_1')
);

-- 11. Add inventory for shop
INSERT INTO oliveorders.shop_inventory (shop_id, flavor_id, quantity, count, sold, status, received_at)
VALUES (
  (SELECT id FROM oliveorders.shops WHERE name = 'Main Branch'),
  (SELECT id FROM oliveorders.flavors WHERE name = 'Chocolate'),
  'medium',
  20,
  0,
  'verified',
  now()
)
ON CONFLICT (shop_id, flavor_id, quantity)
DO UPDATE SET
  count = oliveorders.shop_inventory.count + EXCLUDED.count,
  status = 'verified';

-- 12. Mark sale
INSERT INTO oliveorders.shop_sales (shop_id, flavor_id, sale_type, quantity, units, amount, sale_date, created_by)
VALUES (
  (SELECT id FROM oliveorders.shops WHERE name = 'Main Branch'),
  (SELECT id FROM oliveorders.flavors WHERE name = 'Chocolate'),
  'direct',
  'medium',
  2,
  1400,
  CURRENT_DATE,
  (SELECT id FROM oliveorders.user_profiles WHERE user_id = 'shop_mgr_1')
);

-- 13. Report by shop day/week/month
SELECT *
FROM oliveorders.shop_sales
WHERE shop_id = 1
  AND sale_date = CURRENT_DATE;

SELECT *
FROM oliveorders.shop_sales
WHERE shop_id = 1
  AND sale_date BETWEEN CURRENT_DATE - INTERVAL '6 days' AND CURRENT_DATE;

SELECT *
FROM oliveorders.shop_sales
WHERE shop_id = 1
  AND sale_date >= date_trunc('month', CURRENT_DATE);

-- 14. Inventory overview
SELECT s.name AS shop_name,
       f.name AS flavor_name,
       si.quantity,
       si.count,
       si.sold,
       si.status
FROM oliveorders.shop_inventory si
JOIN oliveorders.shops s ON s.id = si.shop_id
JOIN oliveorders.flavors f ON f.id = si.flavor_id
ORDER BY s.name, f.name;

-- =====================================================
-- DROP ALL POLICIES (if needed)
-- =====================================================
-- DROP POLICY IF EXISTS "user_profiles_all_access" ON oliveorders.user_profiles;
-- DROP POLICY IF EXISTS "shops_all_access" ON oliveorders.shops;
-- DROP POLICY IF EXISTS "user_shop_access_all_access" ON oliveorders.user_shop_access;
-- DROP POLICY IF EXISTS "flavors_all_access" ON oliveorders.flavors;
-- DROP POLICY IF EXISTS "orders_all_access" ON oliveorders.orders;
-- DROP POLICY IF EXISTS "shop_inventory_all_access" ON oliveorders.shop_inventory;
-- DROP POLICY IF EXISTS "shop_sales_all_access" ON oliveorders.shop_sales;

-- =====================================================
-- NOTE
-- =====================================================
-- This design is for custom User ID + password authentication.
-- The app should query user_profiles directly and compare the entered
-- password against the stored password field, without using Supabase Auth.

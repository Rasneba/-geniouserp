-- Migration v12: Membership module tables (gym, parking, club, etc.)

CREATE TABLE IF NOT EXISTS membership_plans (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'general' CHECK (type IN ('gym','parking','club','general')),
  description TEXT,
  duration_days INTEGER NOT NULL DEFAULT 30,
  price DECIMAL(12,2) NOT NULL DEFAULT 0,
  currency VARCHAR(10) DEFAULT 'ETB',
  max_members INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS membership_members (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  plan_id INTEGER NOT NULL REFERENCES membership_plans(id) ON DELETE RESTRICT,
  full_name VARCHAR(200) NOT NULL,
  phone VARCHAR(30),
  email VARCHAR(200),
  id_number VARCHAR(100),
  address TEXT,
  photo_url TEXT,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active','expired','suspended','cancelled')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS membership_payments (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  member_id INTEGER NOT NULL REFERENCES membership_members(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'ETB',
  payment_method VARCHAR(50) DEFAULT 'cash',
  reference VARCHAR(200),
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed default gym/parking/club plans for default company
INSERT INTO membership_plans (company_id, name, type, description, duration_days, price, max_members)
SELECT c.id, 'Basic Gym', 'gym', 'Standard gym access', 30, 500, 100 FROM companies c WHERE c.tin = 'TIN-000001'
  AND NOT EXISTS (SELECT 1 FROM membership_plans WHERE name = 'Basic Gym' AND company_id = c.id);

INSERT INTO membership_plans (company_id, name, type, description, duration_days, price, max_members)
SELECT c.id, 'Premium Gym', 'gym', 'Full gym + sauna + trainer', 30, 1500, 50 FROM companies c WHERE c.tin = 'TIN-000001'
  AND NOT EXISTS (SELECT 1 FROM membership_plans WHERE name = 'Premium Gym' AND company_id = c.id);

INSERT INTO membership_plans (company_id, name, type, description, duration_days, price, max_members)
SELECT c.id, 'Parking Pass', 'parking', 'Monthly parking slot', 30, 800, 200 FROM companies c WHERE c.tin = 'TIN-000001'
  AND NOT EXISTS (SELECT 1 FROM membership_plans WHERE name = 'Parking Pass' AND company_id = c.id);

INSERT INTO membership_plans (company_id, name, type, description, duration_days, price)
SELECT c.id, 'Club Membership', 'club', 'Social club access', 30, 2000 FROM companies c WHERE c.tin = 'TIN-000001'
  AND NOT EXISTS (SELECT 1 FROM membership_plans WHERE name = 'Club Membership' AND company_id = c.id);

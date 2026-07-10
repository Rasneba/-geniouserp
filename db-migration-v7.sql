-- Genius HRMS v7 - Company Registration & Module Licensing

-- Companies (registered/prospective clients)
CREATE TABLE IF NOT EXISTS companies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  code VARCHAR(50) UNIQUE,
  address TEXT,
  phone VARCHAR(30),
  email VARCHAR(100),
  website VARCHAR(200),
  contact_person VARCHAR(100),
  contact_phone VARCHAR(30),
  contact_email VARCHAR(100),
  tin VARCHAR(50),
  license_type VARCHAR(20) DEFAULT 'demo' CHECK (license_type IN ('demo','trial','full','enterprise')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','inactive','suspended')),
  registration_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fixed modules that can be licensed
CREATE TABLE IF NOT EXISTS modules (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0
);

INSERT INTO modules (code, name, description, icon, sort_order) VALUES
  ('hrms', 'HRMS', 'Employee management, payroll, attendance', 'bi-people', 1),
  ('sales', 'Sales', 'Orders, invoices, customers, POS', 'bi-cart3', 2),
  ('stock', 'Stock', 'Inventory, warehouses, stock control', 'bi-box-seam', 3),
  ('finance', 'Finance', 'Ledgers, payments, accounts, budget', 'bi-cash-stack', 4),
  ('production', 'Production', 'Manufacturing, BOM, work orders', 'bi-gear', 5),
  ('procurement', 'Procurement', 'Purchase orders, suppliers, RFQ', 'bi-truck', 6),
  ('ecommerce', 'E-Commerce', 'Online store, products, orders', 'bi-shop', 7),
  ('audit', 'Audit', 'Audit trails, activity logs', 'bi-journal-text', 8),
  ('reports', 'Reports', 'Analytics, charts, exports', 'bi-bar-chart', 9)
ON CONFLICT DO NOTHING;

-- Which modules a company is licensed to use
CREATE TABLE IF NOT EXISTS company_modules (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  module_id INTEGER NOT NULL REFERENCES modules(id),
  is_enabled BOOLEAN DEFAULT true,
  UNIQUE(company_id, module_id)
);

-- Enhanced demo_licenses with company_id reference
CREATE TABLE IF NOT EXISTS demo_licenses (
  id SERIAL PRIMARY KEY,
  license_key VARCHAR(100) UNIQUE NOT NULL,
  company_id INTEGER REFERENCES companies(id) ON DELETE SET NULL,
  company_name VARCHAR(200) NOT NULL,
  contact_name VARCHAR(100),
  contact_email VARCHAR(100),
  contact_phone VARCHAR(30),
  issued_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expiry_date DATE NOT NULL,
  duration_days INTEGER DEFAULT 15,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','expired','revoked','suspended')),
  notes TEXT,
  issued_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

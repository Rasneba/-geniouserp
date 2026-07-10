-- Genius HRMS v3 - Users, Roles, Permissions, Branches, Documents

-- 1. Roles
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO roles (name, description) VALUES
  ('admin', 'Full system access'),
  ('hr_manager', 'HR department manager'),
  ('hr_clerk', 'HR staff'),
  ('finance', 'Finance department'),
  ('employee', 'Self-service access only')
ON CONFLICT (name) DO NOTHING;

-- 2. Permissions
CREATE TABLE IF NOT EXISTS permissions (
  id SERIAL PRIMARY KEY,
  role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  resource VARCHAR(50) NOT NULL,
  can_view BOOLEAN DEFAULT false,
  can_create BOOLEAN DEFAULT false,
  can_edit BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  can_approve BOOLEAN DEFAULT false,
  UNIQUE(role_id, resource)
);

-- 3. Add role_id to users
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='role_id') THEN
    ALTER TABLE users ADD COLUMN role_id INTEGER REFERENCES roles(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='is_active') THEN
    ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT true;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='phone') THEN
    ALTER TABLE users ADD COLUMN phone VARCHAR(20);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='branch_id') THEN
    ALTER TABLE users ADD COLUMN branch_id INTEGER;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='updated_at') THEN
    ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
  END IF;
END $$;

-- 4. Branches
CREATE TABLE IF NOT EXISTS branches (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) UNIQUE,
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(100),
  is_head_office BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add branch_id to employees
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='branch_id') THEN
    ALTER TABLE employees ADD COLUMN branch_id INTEGER REFERENCES branches(id);
  END IF;
END $$;

-- Insert default branches
INSERT INTO branches (name, code, address, is_head_office) VALUES
  ('Head Office', 'HO', 'Main Headquarters', true),
  ('Branch 1', 'BR1', 'First Branch Office', false)
ON CONFLICT (code) DO NOTHING;

-- 5. Document Templates
CREATE TABLE IF NOT EXISTS document_templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) UNIQUE,
  type VARCHAR(30) NOT NULL CHECK (type IN ('letter','certificate','voucher','report','contract')),
  content TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO document_templates (name, code, type) VALUES
  ('Employment Letter', 'EMP_LTR', 'letter'),
  ('Termination Letter', 'TERM_LTR', 'letter'),
  ('Work Experience Certificate', 'WORK_CERT', 'certificate'),
  ('Clearance Letter', 'CLR_LTR', 'letter'),
  ('Promotion Letter', 'PROM_LTR', 'letter'),
  ('Bank Transfer Letter', 'BANK_LTR', 'letter'),
  ('Suspension Letter', 'SUS_LTR', 'letter')
ON CONFLICT (code) DO NOTHING;

-- 6. Generated Documents
CREATE TABLE IF NOT EXISTS generated_documents (
  id SERIAL PRIMARY KEY,
  template_id INTEGER REFERENCES document_templates(id),
  employee_id INTEGER REFERENCES employees(id),
  voucher_id INTEGER REFERENCES vouchers(id),
  document_type VARCHAR(30) NOT NULL,
  reference_number VARCHAR(50) UNIQUE,
  title VARCHAR(200),
  content TEXT,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft','final','issued')),
  issued_by INTEGER REFERENCES users(id),
  issued_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Audit Log
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action VARCHAR(50) NOT NULL,
  resource VARCHAR(50),
  resource_id INTEGER,
  details TEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Update admin user to have role_id = 1
UPDATE users SET role_id = 1 WHERE email = 'admin@gmail.com';

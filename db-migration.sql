-- Genius HRMS - Full ERP HR Database Schema Migration
-- Adds all tables needed for a complete HR system

-- 1. Departments
CREATE TABLE IF NOT EXISTS departments (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) UNIQUE,
  description TEXT,
  manager_id INTEGER REFERENCES employees(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Positions (Job Titles)
CREATE TABLE IF NOT EXISTS positions (
  id SERIAL PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
  description TEXT,
  min_salary NUMERIC(12,2),
  max_salary NUMERIC(12,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add department_id and position_id to employees
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='department_id') THEN
    ALTER TABLE employees ADD COLUMN department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='position_id') THEN
    ALTER TABLE employees ADD COLUMN position_id INTEGER REFERENCES positions(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='phone') THEN
    ALTER TABLE employees ADD COLUMN phone VARCHAR(20);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='email') THEN
    ALTER TABLE employees ADD COLUMN email VARCHAR(100);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='address') THEN
    ALTER TABLE employees ADD COLUMN address TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='emergency_contact') THEN
    ALTER TABLE employees ADD COLUMN emergency_contact VARCHAR(100);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='emergency_phone') THEN
    ALTER TABLE employees ADD COLUMN emergency_phone VARCHAR(20);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='hire_date') THEN
    ALTER TABLE employees ADD COLUMN hire_date DATE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='salary') THEN
    ALTER TABLE employees ADD COLUMN salary NUMERIC(12,2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='updated_at') THEN
    ALTER TABLE employees ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
  END IF;
END $$;

-- 3. Attendance
CREATE TABLE IF NOT EXISTS attendance (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time_in TIME,
  time_out TIME,
  status VARCHAR(20) DEFAULT 'present' CHECK (status IN ('present','absent','late','half-day','leave')),
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(employee_id, date)
);

-- 4. Leave Types
CREATE TABLE IF NOT EXISTS leave_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) UNIQUE,
  days_per_year INTEGER NOT NULL DEFAULT 0,
  is_paid BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Leave Requests
CREATE TABLE IF NOT EXISTS leave_requests (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  leave_type_id INTEGER NOT NULL REFERENCES leave_types(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days INTEGER NOT NULL,
  reason TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','cancelled')),
  approved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Payroll
CREATE TABLE IF NOT EXISTS payroll (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  pay_period_start DATE NOT NULL,
  pay_period_end DATE NOT NULL,
  basic_salary NUMERIC(12,2) NOT NULL DEFAULT 0,
  allowances NUMERIC(12,2) DEFAULT 0,
  deductions NUMERIC(12,2) DEFAULT 0,
  net_pay NUMERIC(12,2) NOT NULL DEFAULT 0,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft','processed','paid','cancelled')),
  processed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Settings
CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default settings
INSERT INTO settings (key, value, description) VALUES
  ('company_name', 'Genius HRMS', 'Company name'),
  ('company_address', '123 Business Street', 'Company address'),
  ('company_phone', '+1-555-1234', 'Company phone'),
  ('company_email', 'info@geniushrms.com', 'Company email'),
  ('tax_rate', '15', 'Default tax rate percentage'),
  ('currency', 'USD', 'Currency symbol'),
  ('payroll_frequency', 'monthly', 'Payroll frequency'),
  ('working_days_per_month', '22', 'Standard working days per month')
ON CONFLICT (key) DO NOTHING;

-- Insert default leave types
INSERT INTO leave_types (name, code, days_per_year, is_paid) VALUES
  ('Annual Leave', 'ANNUAL', 20, true),
  ('Sick Leave', 'SICK', 15, true),
  ('Personal Leave', 'PERSONAL', 5, false),
  ('Maternity Leave', 'MATERNITY', 90, true),
  ('Paternity Leave', 'PATERNITY', 14, true)
ON CONFLICT (code) DO NOTHING;

-- Insert default departments
INSERT INTO departments (name, code, description) VALUES
  ('Human Resources', 'HR', 'Human Resources Department'),
  ('Information Technology', 'IT', 'Information Technology Department'),
  ('Finance', 'FIN', 'Finance and Accounting'),
  ('Operations', 'OPS', 'Operations Department'),
  ('Sales', 'SAL', 'Sales and Marketing')
ON CONFLICT (code) DO NOTHING;

-- Insert default positions
INSERT INTO positions (title, description) VALUES
  ('Software Engineer', 'Software development and engineering'),
  ('HR Manager', 'Human resources management'),
  ('Accountant', 'Accounting and finance'),
  ('Sales Representative', 'Sales and client relations'),
  ('System Administrator', 'IT systems administration')
ON CONFLICT (title) DO NOTHING;

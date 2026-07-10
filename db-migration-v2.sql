-- Genius HRMS v2 - Grand Horizon Hotel & Spa SRS Implementation
-- Phase 1: All new tables for enhanced ERP HR

-- 1. Employee Bank Information
CREATE TABLE IF NOT EXISTS employee_banks (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  bank_name VARCHAR(100) NOT NULL,
  account_number VARCHAR(50) NOT NULL,
  account_holder VARCHAR(150),
  branch VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Employee Dependents
CREATE TABLE IF NOT EXISTS employee_dependents (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  full_name VARCHAR(150) NOT NULL,
  relationship VARCHAR(50) NOT NULL,
  date_of_birth DATE,
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Employee Education
CREATE TABLE IF NOT EXISTS employee_education (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  institution VARCHAR(200) NOT NULL,
  degree VARCHAR(100),
  field_of_study VARCHAR(100),
  start_date DATE,
  end_date DATE,
  grade VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Employee Work Experience
CREATE TABLE IF NOT EXISTS employee_work_experience (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  company VARCHAR(200) NOT NULL,
  position VARCHAR(100),
  start_date DATE,
  end_date DATE,
  reason_leaving TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Employee Documents
CREATE TABLE IF NOT EXISTS employee_documents (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  document_type VARCHAR(100) NOT NULL,
  document_name VARCHAR(200),
  file_path TEXT,
  expiry_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Employment Stages / Statuses
CREATE TABLE IF NOT EXISTS employment_stages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  code VARCHAR(20) NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true
);

INSERT INTO employment_stages (name, code, description) VALUES
  ('Probation', 'PROB', 'Probation period (max 45 days per Proclamation 1156/2019)'),
  ('Contract', 'CTR', 'Fixed-term contract'),
  ('Permanent', 'PERM', 'Permanent/indefinite employment'),
  ('Suspended', 'SUS', 'Temporary suspension'),
  ('Terminated', 'TERM', 'Employment terminated')
ON CONFLICT (code) DO NOTHING;

-- 7. Placement & Benefit Records
CREATE TABLE IF NOT EXISTS placements (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  placement_type VARCHAR(30) NOT NULL CHECK (placement_type IN ('initial','promotion','demotion','transfer','suspension','termination','probation','permanent')),
  employment_stage_id INTEGER REFERENCES employment_stages(id),
  department_id INTEGER REFERENCES departments(id),
  position_id INTEGER REFERENCES positions(id),
  branch VARCHAR(100),
  salary NUMERIC(12,2),
  start_date DATE NOT NULL,
  end_date DATE,
  reason TEXT,
  previous_placement_id INTEGER REFERENCES placements(id),
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Payroll Items (Allowances/Deductions master)
CREATE TABLE IF NOT EXISTS payroll_items (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) UNIQUE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('allowance','deduction')),
  is_taxable BOOLEAN DEFAULT true,
  is_pensionable BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO payroll_items (name, code, type, is_taxable, is_pensionable) VALUES
  ('Basic Salary', 'BASIC', 'allowance', true, true),
  ('Transport Allowance', 'TRANSPORT', 'allowance', false, false),
  ('Housing Allowance', 'HOUSING', 'allowance', true, true),
  ('Position Allowance', 'POSITION', 'allowance', true, true),
  ('Overtime', 'OVERTIME', 'allowance', true, false),
  ('Income Tax', 'TAX', 'deduction', false, false),
  ('Employee Pension', 'EMP_PENSION', 'deduction', false, false),
  ('Employer Pension', 'ER_PENSION', 'deduction', false, false)
ON CONFLICT (code) DO NOTHING;

-- 9. Placement Benefits (linking placements to payroll items)
CREATE TABLE IF NOT EXISTS placement_benefits (
  id SERIAL PRIMARY KEY,
  placement_id INTEGER NOT NULL REFERENCES placements(id) ON DELETE CASCADE,
  payroll_item_id INTEGER NOT NULL REFERENCES payroll_items(id),
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  is_percentage BOOLEAN DEFAULT false,
  percentage_value NUMERIC(5,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Overtime Records
CREATE TABLE IF NOT EXISTS overtime_records (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  total_hours NUMERIC(5,2) NOT NULL,
  rate_multiplier NUMERIC(3,2) NOT NULL DEFAULT 1.5,
  rate_type VARCHAR(30) NOT NULL CHECK (rate_type IN ('day','night','weekly_rest','public_holiday')),
  amount NUMERIC(12,2),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','paid')),
  approved_by INTEGER REFERENCES users(id),
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. Shifts
CREATE TABLE IF NOT EXISTS shifts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. Employee Shift Assignments
CREATE TABLE IF NOT EXISTS employee_shifts (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  shift_id INTEGER NOT NULL REFERENCES shifts(id),
  start_date DATE NOT NULL,
  end_date DATE,
  is_recurring BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 13. Leave Definitions (annual allocation per employee)
CREATE TABLE IF NOT EXISTS leave_definitions (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  leave_type_id INTEGER NOT NULL REFERENCES leave_types(id),
  year INTEGER NOT NULL,
  total_days INTEGER NOT NULL DEFAULT 0,
  used_days INTEGER NOT NULL DEFAULT 0,
  remaining_days INTEGER GENERATED ALWAYS AS (total_days - used_days) STORED,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(employee_id, leave_type_id, year)
);

-- 14. Voucher System (generic)
CREATE TABLE IF NOT EXISTS vouchers (
  id SERIAL PRIMARY KEY,
  voucher_type VARCHAR(20) NOT NULL CHECK (voucher_type IN (
    'LV','OTV','FIV','PBV','PAV','LDV','PTV','TERV','SUS','WOR','CL','SHIFT'
  )),
  code VARCHAR(50) NOT NULL UNIQUE,
  employee_id INTEGER REFERENCES employees(id),
  status VARCHAR(20) DEFAULT 'prepared' CHECK (status IN ('prepared','approved','void','completed')),
  total_amount NUMERIC(12,2) DEFAULT 0,
  notes TEXT,
  prepared_by INTEGER REFERENCES users(id),
  approved_by INTEGER REFERENCES users(id),
  prepared_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 15. Voucher Items (line items for each voucher)
CREATE TABLE IF NOT EXISTS voucher_items (
  id SERIAL PRIMARY KEY,
  voucher_id INTEGER NOT NULL REFERENCES vouchers(id) ON DELETE CASCADE,
  payroll_item_id INTEGER REFERENCES payroll_items(id),
  description TEXT,
  quantity NUMERIC(10,2) DEFAULT 1,
  unit_price NUMERIC(12,2) DEFAULT 0,
  total_price NUMERIC(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 16. Performance Evaluations
CREATE TABLE IF NOT EXISTS performance_evaluations (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  reviewer_id INTEGER REFERENCES users(id),
  evaluation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comments TEXT,
  strengths TEXT,
  improvements TEXT,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft','submitted','acknowledged')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 17. Employee Hobbies
CREATE TABLE IF NOT EXISTS employee_hobbies (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  hobby VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 18. Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER REFERENCES employees(id),
  title VARCHAR(200) NOT NULL,
  message TEXT,
  type VARCHAR(30) DEFAULT 'info' CHECK (type IN ('info','warning','alert','success')),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add new columns to employees table
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='employment_stage_id') THEN
    ALTER TABLE employees ADD COLUMN employment_stage_id INTEGER REFERENCES employment_stages(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='branch') THEN
    ALTER TABLE employees ADD COLUMN branch VARCHAR(100);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='probation_start_date') THEN
    ALTER TABLE employees ADD COLUMN probation_start_date DATE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='probation_end_date') THEN
    ALTER TABLE employees ADD COLUMN probation_end_date DATE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='contract_end_date') THEN
    ALTER TABLE employees ADD COLUMN contract_end_date DATE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='termination_date') THEN
    ALTER TABLE employees ADD COLUMN termination_date DATE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='termination_reason') THEN
    ALTER TABLE employees ADD COLUMN termination_reason TEXT;
  END IF;
END $$;

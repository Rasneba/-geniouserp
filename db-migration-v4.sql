-- Genius HRMS v4 - Payroll & Pension Management

-- Ethiopian PAYE Tax Brackets (monthly)
CREATE TABLE IF NOT EXISTS paye_brackets (
  id SERIAL PRIMARY KEY,
  min_income NUMERIC(12,2) NOT NULL,
  max_income NUMERIC(12,2),
  rate NUMERIC(5,4) NOT NULL,
  deductible_amount NUMERIC(12,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO paye_brackets (min_income, max_income, rate, deductible_amount) VALUES
  (0, 600, 0.0000, 0),
  (600.01, 1650, 0.1000, 60),
  (1650.01, 3200, 0.1500, 142.5),
  (3200.01, 5250, 0.2000, 302.5),
  (5250.01, 7800, 0.2500, 565),
  (7800.01, 10900, 0.3000, 955),
  (10900.01, NULL, 0.3500, 1500)
ON CONFLICT DO NOTHING;

-- Pension Settings
CREATE TABLE IF NOT EXISTS pension_settings (
  id SERIAL PRIMARY KEY,
  employee_rate NUMERIC(5,4) NOT NULL DEFAULT 0.0700,
  employer_rate NUMERIC(5,4) NOT NULL DEFAULT 0.1100,
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO pension_settings (employee_rate, employer_rate) VALUES (0.0700, 0.1100);

-- Payroll Periods
CREATE TABLE IF NOT EXISTS payroll_periods (
  id SERIAL PRIMARY KEY,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft','finalized','paid')),
  processed_by INTEGER REFERENCES users(id),
  processed_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(year, month)
);

-- Payroll Runs
CREATE TABLE IF NOT EXISTS payroll_runs (
  id SERIAL PRIMARY KEY,
  period_id INTEGER NOT NULL REFERENCES payroll_periods(id),
  total_gross NUMERIC(14,2) DEFAULT 0,
  total_paye NUMERIC(14,2) DEFAULT 0,
  total_employee_pension NUMERIC(14,2) DEFAULT 0,
  total_employer_pension NUMERIC(14,2) DEFAULT 0,
  total_deductions NUMERIC(14,2) DEFAULT 0,
  total_net NUMERIC(14,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','processed','approved')),
  processed_by INTEGER REFERENCES users(id),
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payroll Items (per employee)
CREATE TABLE IF NOT EXISTS payroll_items (
  id SERIAL PRIMARY KEY,
  run_id INTEGER NOT NULL REFERENCES payroll_runs(id) ON DELETE CASCADE,
  employee_id INTEGER NOT NULL REFERENCES employees(id),
  basic_salary NUMERIC(12,2) NOT NULL DEFAULT 0,
  overtime NUMERIC(12,2) DEFAULT 0,
  allowances NUMERIC(12,2) DEFAULT 0,
  gross_pay NUMERIC(12,2) DEFAULT 0,
  taxable_income NUMERIC(12,2) DEFAULT 0,
  paye_tax NUMERIC(12,2) DEFAULT 0,
  employee_pension NUMERIC(12,2) DEFAULT 0,
  employer_pension NUMERIC(12,2) DEFAULT 0,
  other_deductions NUMERIC(12,2) DEFAULT 0,
  net_pay NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pension Contributions History
CREATE TABLE IF NOT EXISTS pension_contributions (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(id),
  payroll_item_id INTEGER REFERENCES payroll_items(id),
  period_id INTEGER REFERENCES payroll_periods(id),
  employee_contribution NUMERIC(12,2) NOT NULL DEFAULT 0,
  employer_contribution NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_contribution NUMERIC(12,2) DEFAULT 0,
  contribution_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add pension columns to employees
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='pension_number') THEN
    ALTER TABLE employees ADD COLUMN pension_number VARCHAR(50);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='taxable_allowances') THEN
    ALTER TABLE employees ADD COLUMN taxable_allowances NUMERIC(12,2) DEFAULT 0;
  END IF;
END $$;

-- Add generated status to generated_documents status check if not already done
DO $$ BEGIN
  ALTER TABLE generated_documents DROP CONSTRAINT IF EXISTS generated_documents_status_check;
  ALTER TABLE generated_documents ADD CONSTRAINT generated_documents_status_check
    CHECK (status IN ('draft','final','issued','generated'));
EXCEPTION WHEN undefined_column THEN NULL;
END $$;

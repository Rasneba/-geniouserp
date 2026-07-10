-- Migration v28: Add company_id to employees (was missed in v9)
ALTER TABLE employees ADD COLUMN IF NOT EXISTS company_id INTEGER REFERENCES companies(id) ON DELETE SET NULL;

-- Backfill existing employees to the default company
UPDATE employees SET company_id = (SELECT id FROM companies WHERE tin = 'TIN-000001' LIMIT 1) WHERE company_id IS NULL;

-- Add index for multi-tenant queries
CREATE INDEX IF NOT EXISTS idx_employees_company_id ON employees(company_id);

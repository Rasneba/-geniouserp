-- Genius HRMS v9 - Add company_id to remaining tables for multi-tenant scoping

ALTER TABLE departments ADD COLUMN IF NOT EXISTS company_id INTEGER REFERENCES companies(id) ON DELETE SET NULL;
ALTER TABLE positions ADD COLUMN IF NOT EXISTS company_id INTEGER REFERENCES companies(id) ON DELETE SET NULL;
ALTER TABLE branches ADD COLUMN IF NOT EXISTS company_id INTEGER REFERENCES companies(id) ON DELETE SET NULL;
ALTER TABLE payroll_periods ADD COLUMN IF NOT EXISTS company_id INTEGER REFERENCES companies(id) ON DELETE SET NULL;

-- Assign existing data to the default company (TIN-000001)
UPDATE departments SET company_id = (SELECT id FROM companies WHERE tin = 'TIN-000001') WHERE company_id IS NULL;
UPDATE positions SET company_id = (SELECT id FROM companies WHERE tin = 'TIN-000001') WHERE company_id IS NULL;
UPDATE branches SET company_id = (SELECT id FROM companies WHERE tin = 'TIN-000001') WHERE company_id IS NULL;
UPDATE payroll_periods SET company_id = (SELECT id FROM companies WHERE tin = 'TIN-000001') WHERE company_id IS NULL;

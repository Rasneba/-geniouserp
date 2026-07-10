-- Genius HRMS v8 - Company TIN Login & User-Company Association

-- Add company_id to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS company_id INTEGER REFERENCES companies(id) ON DELETE SET NULL;

-- Add unique index on companies.tin
ALTER TABLE companies ADD COLUMN IF NOT EXISTS tin VARCHAR(50);
CREATE UNIQUE INDEX IF NOT EXISTS idx_companies_tin ON companies(tin) WHERE tin IS NOT NULL AND tin <> '';

-- Seed default company for existing admin user
INSERT INTO companies (name, code, tin, contact_email, license_type, status)
SELECT 'Gast Solar Mechanics PLC', 'CMP-GAST', 'TIN-000001', 'admin@gastsolar.com', 'enterprise', 'active'
WHERE NOT EXISTS (SELECT 1 FROM companies WHERE tin = 'TIN-000001');

-- Assign all modules to the default company
INSERT INTO company_modules (company_id, module_id)
SELECT c.id, m.id FROM companies c, modules m
WHERE c.tin = 'TIN-000001'
AND NOT EXISTS (SELECT 1 FROM company_modules cm WHERE cm.company_id = c.id AND cm.module_id = m.id);

-- Link admin user to the default company
UPDATE users SET company_id = (SELECT id FROM companies WHERE tin = 'TIN-000001')
WHERE email = 'admin@gmail.com' AND (company_id IS NULL);

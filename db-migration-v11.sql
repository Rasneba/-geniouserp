-- Migration v11: Add Membership module

INSERT INTO modules (code, name, description, icon, sort_order) VALUES
  ('membership', 'Membership', 'Membership management, plans, renewals', 'bi-person-badge', 10)
ON CONFLICT DO NOTHING;

-- Grant membership module to default company
INSERT INTO company_modules (company_id, module_id)
SELECT c.id, m.id FROM companies c, modules m
WHERE c.tin = 'TIN-000001' AND m.code = 'membership'
  AND NOT EXISTS (SELECT 1 FROM company_modules cm WHERE cm.company_id = c.id AND cm.module_id = m.id);

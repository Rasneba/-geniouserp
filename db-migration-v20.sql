-- Migration v20: Role-based access control overhaul
-- Fixes schema, seeds resources, enables multi-tenant roles

-- 1. Ensure role_permissions table exists (used by API but was missing from migrations)
CREATE TABLE IF NOT EXISTS role_permissions (
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

-- 2. Add company_id to roles for multi-tenant role definitions
ALTER TABLE roles ADD COLUMN IF NOT EXISTS company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE roles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- 3. Drop the unused `permissions` table (no code references it)
DROP TABLE IF EXISTS permissions;

-- 4. Seed default roles if missing
INSERT INTO roles (name, description) VALUES
  ('super_admin', 'Super administrator — full system access across all companies'),
  ('admin', 'Full system access'),
  ('hr_manager', 'HR department manager'),
  ('hr_clerk', 'HR staff'),
  ('finance', 'Finance department'),
  ('employee', 'Self-service access only')
ON CONFLICT (name) DO NOTHING;

-- 5. Seed default permissions for admin role (full access)
DO $$
DECLARE
  admin_role_id INTEGER;
  resources TEXT[] := ARRAY[
    'employees', 'departments', 'positions', 'branches', 'placements',
    'employment_stages', 'attendance', 'leave', 'overtime', 'performance',
    'shifts', 'employee_shifts',
    'payroll', 'payroll_periods', 'payroll_items', 'vouchers', 'voucher_items',
    'users', 'roles', 'settings', 'id_definitions', 'notifications',
    'documents', 'reports', 'audit_logs',
    'companies', 'modules', 'demo_licenses', 'biometric_devices',
    'items', 'item_categories', 'warehouses', 'stock_movements',
    'stock_adjustments', 'stock_transfers',
    'membership_plans', 'membership_members', 'membership_payments',
    'parking_zones', 'parking_slots', 'parking_gates', 'parking_cameras',
    'parking_vehicles', 'parking_sessions', 'parking_rates',
    'parking_qr_tickets', 'parking_payments', 'parking_subscriptions',
          'parking_customers', 'parking_reports',
      'parking_rfid_cards', 'finance_accounts',
    'finance_journal', 'finance_ledger', 'finance_budget', 'finance_payments',
    'sales_customers', 'sales_orders', 'sales_invoices', 'sales_quotations',
    'sales_pos', 'suppliers', 'purchase_orders', 'rfq',
    'work_orders', 'bom', 'routings',
    'clearance', 'termination'
  ];
  r TEXT;
BEGIN
  SELECT id INTO admin_role_id FROM roles WHERE name = 'admin' LIMIT 1;
  IF admin_role_id IS NOT NULL THEN
    FOREACH r IN ARRAY resources LOOP
      INSERT INTO role_permissions (role_id, resource, can_view, can_create, can_edit, can_delete, can_approve)
      VALUES (admin_role_id, r, true, true, true, true, true)
      ON CONFLICT (role_id, resource) DO NOTHING;
    END LOOP;
  END IF;
END $$;

-- 6. Seed default permissions for employee role (self-service only)
DO $$
DECLARE
  emp_role_id INTEGER;
BEGIN
  SELECT id INTO emp_role_id FROM roles WHERE name = 'employee' LIMIT 1;
  IF emp_role_id IS NOT NULL THEN
    INSERT INTO role_permissions (role_id, resource, can_view, can_create, can_edit, can_delete, can_approve)
    VALUES
      (emp_role_id, 'attendance', true, false, false, false, false),
      (emp_role_id, 'leave', true, true, false, false, false),
      (emp_role_id, 'documents', true, false, false, false, false)
    ON CONFLICT (role_id, resource) DO NOTHING;
  END IF;
END $$;

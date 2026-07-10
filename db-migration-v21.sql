-- Migration v21: Add guest role for limited company data access
-- Guests can only see data that admin explicitly grants via role_permissions

-- Insert guest role if not exists
INSERT INTO roles (name, description, company_id)
SELECT 'guest', 'Guest - Limited access based on configured permissions', NULL
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'guest');

-- Remove the employee role (employees are data records in HRMS, not system users)
DELETE FROM role_permissions WHERE role_id IN (SELECT id FROM roles WHERE name = 'employee');
DELETE FROM users WHERE role_id IN (SELECT id FROM roles WHERE name = 'employee');
DELETE FROM roles WHERE name = 'employee';

-- Insert default guest permissions (view-only on dashboard and reports)
DO $$
DECLARE
  guest_role_id INTEGER;
BEGIN
  SELECT id INTO guest_role_id FROM roles WHERE name = 'guest';
  IF guest_role_id IS NOT NULL THEN
    -- Default: guest can view dashboard, reports, and parking reports only
    INSERT INTO role_permissions (role_id, resource, can_view, can_create, can_edit, can_delete, can_approve)
    VALUES
      (guest_role_id, 'parking_reports', true, false, false, false, false),
      (guest_role_id, 'parking_sessions', true, false, false, false, false),
      (guest_role_id, 'parking_zones', true, false, false, false, false),
      (guest_role_id, 'parking_slots', true, false, false, false, false),
      (guest_role_id, 'parking_customers', true, false, false, false, false),
      (guest_role_id, 'reports', true, false, false, false, false)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

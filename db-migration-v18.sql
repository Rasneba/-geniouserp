-- Migration v18: Row-Level Security (RLS) for multi-tenant data isolation
-- Enables PostgreSQL RLS on all tenant-scoped tables

-- Helper: enable RLS on a table and create a policy scoped to company_id
DO $$
DECLARE
  tbl TEXT;
  tables TEXT[] := ARRAY[
    'employees', 'users', 'departments', 'positions', 'attendance',
    'leave_types', 'leave_requests', 'leave_definitions', 'payroll',
    'payroll_periods', 'payroll_items', 'settings',
    'employment_stages', 'placements', 'employee_benefits',
    'employee_education', 'employee_experience', 'employee_dependents',
    'employee_banks', 'employee_documents', 'employee_hobbies',
    'clearance_items', 'employee_clearance', 'clearance_item_status',
    'item_categories', 'warehouses', 'items', 'stock_balances',
    'stock_movements', 'stock_adjustments', 'stock_transfers',
    'branches', 'modules', 'company_modules', 'demo_licenses',
    'membership_plans', 'membership_members', 'membership_payments',
    'parking_zones', 'parking_slots', 'parking_gates', 'parking_cameras',
    'parking_vehicles', 'parking_sessions', 'parking_rates',
    'parking_qr_tickets', 'parking_payments', 'parking_subscriptions',
    'id_definitions', 'id_sequences', 'vouchers', 'voucher_items',
    'payroll_deductions', 'pension_settings', 'pension_contributions',
    'performance_evaluations', 'notifications',
    'shifts', 'employee_shifts', 'overtime_records',
    'biometric_devices', 'audit_logs'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);
    EXECUTE format('DROP POLICY IF EXISTS tenant_isolation ON %I', tbl);
    EXECUTE format(
      'CREATE POLICY tenant_isolation ON %I
       USING (company_id = current_setting(''app.current_company_id'')::integer)',
      tbl
    );
  END LOOP;
END $$;

-- Super admin bypass policy (role = 'super_admin' can see all)
DO $$
DECLARE
  tbl TEXT;
  tables TEXT[] := ARRAY[
    'employees', 'users', 'departments', 'positions', 'attendance',
    'leave_types', 'leave_requests', 'leave_definitions', 'payroll',
    'payroll_periods', 'payroll_items', 'settings',
    'parking_zones', 'parking_slots', 'parking_gates', 'parking_cameras',
    'parking_vehicles', 'parking_sessions', 'parking_rates',
    'parking_qr_tickets', 'parking_payments', 'parking_subscriptions'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    EXECUTE format(
      'CREATE POLICY super_admin_bypass ON %I
       FOR ALL USING (current_setting(''app.current_user_role'', true) = ''super_admin'')',
      tbl
    );
  END LOOP;
END $$;

-- Function to set the app context (call this at login)
CREATE OR REPLACE FUNCTION set_app_context(p_company_id INTEGER, p_user_role TEXT DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
  PERFORM set_config('app.current_company_id', p_company_id::TEXT, true);
  IF p_user_role IS NOT NULL THEN
    PERFORM set_config('app.current_user_role', p_user_role, true);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

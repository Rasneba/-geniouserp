-- Migration v19: Composite tenant-first indexes for query performance
-- Every index starts with company_id to maximize multi-tenant query performance

-- Employees
CREATE INDEX IF NOT EXISTS idx_employees_company_dept ON employees(company_id, department_id);
CREATE INDEX IF NOT EXISTS idx_employees_company_position ON employees(company_id, position_id);
CREATE INDEX IF NOT EXISTS idx_employees_company_status ON employees(company_id, is_active);
CREATE INDEX IF NOT EXISTS idx_employees_company_hire ON employees(company_id, hire_date);

-- Users
CREATE INDEX IF NOT EXISTS idx_users_company_role ON users(company_id, role);

-- Attendance
CREATE INDEX IF NOT EXISTS idx_attendance_company_emp ON attendance(company_id, employee_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_attendance_company_date ON attendance(company_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_attendance_company_status ON attendance(company_id, status);

-- Leave Requests
CREATE INDEX IF NOT EXISTS idx_leave_requests_company_emp ON leave_requests(company_id, employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_company_status ON leave_requests(company_id, status);
CREATE INDEX IF NOT EXISTS idx_leave_requests_company_dates ON leave_requests(company_id, start_date, end_date);

-- Payroll
CREATE INDEX IF NOT EXISTS idx_payroll_company_emp ON payroll(company_id, employee_id);
CREATE INDEX IF NOT EXISTS idx_payroll_company_period ON payroll(company_id, pay_period_start DESC);
CREATE INDEX IF NOT EXISTS idx_payroll_company_status ON payroll(company_id, status);

-- Parking Sessions
CREATE INDEX IF NOT EXISTS idx_parking_sessions_company_status ON parking_sessions(company_id, status);
CREATE INDEX IF NOT EXISTS idx_parking_sessions_company_entry ON parking_sessions(company_id, entry_time DESC);
CREATE INDEX IF NOT EXISTS idx_parking_sessions_company_plate ON parking_sessions(company_id, plate_number);

-- Parking Payments
CREATE INDEX IF NOT EXISTS idx_parking_payments_company_date ON parking_payments(company_id, payment_date DESC);
CREATE INDEX IF NOT EXISTS idx_parking_payments_company_method ON parking_payments(company_id, payment_method);

-- Parking Vehicles
CREATE INDEX IF NOT EXISTS idx_parking_vehicles_company_plate ON parking_vehicles(company_id, plate_number);

-- Parking Subscriptions
CREATE INDEX IF NOT EXISTS idx_parking_subs_company_status ON parking_subscriptions(company_id, status);
CREATE INDEX IF NOT EXISTS idx_parking_subs_company_dates ON parking_subscriptions(company_id, end_date);

-- Parking QR Tickets
CREATE INDEX IF NOT EXISTS idx_parking_qr_company_status ON parking_qr_tickets(company_id, status);

-- Parking Zones / Slots / Gates / Cameras
CREATE INDEX IF NOT EXISTS idx_parking_zones_company ON parking_zones(company_id, is_active);
CREATE INDEX IF NOT EXISTS idx_parking_slots_company_zone ON parking_slots(company_id, zone_id);
CREATE INDEX IF NOT EXISTS idx_parking_slots_company_status ON parking_slots(company_id, status);
CREATE INDEX IF NOT EXISTS idx_parking_gates_company ON parking_gates(company_id, status);
CREATE INDEX IF NOT EXISTS idx_parking_cameras_company ON parking_cameras(company_id, status);
CREATE INDEX IF NOT EXISTS idx_parking_cameras_company_gate ON parking_cameras(company_id, gate_id);

-- Stock
CREATE INDEX IF NOT EXISTS idx_items_company_category ON items(company_id, category_id);
CREATE INDEX IF NOT EXISTS idx_items_company_code ON items(company_id, code);
CREATE INDEX IF NOT EXISTS idx_stock_movements_company_item ON stock_movements(company_id, item_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stock_movements_company_warehouse ON stock_movements(company_id, warehouse_id);
CREATE INDEX IF NOT EXISTS idx_stock_balances_company_item ON stock_balances(company_id, item_id, warehouse_id);

-- Placements
CREATE INDEX IF NOT EXISTS idx_placements_company_emp ON placements(company_id, employee_id);
CREATE INDEX IF NOT EXISTS idx_placements_company_dates ON placements(company_id, start_date DESC);

-- Performance
CREATE INDEX IF NOT EXISTS idx_performance_company_emp ON performance_evaluations(company_id, employee_id);
CREATE INDEX IF NOT EXISTS idx_performance_company_date ON performance_evaluations(company_id, evaluation_date DESC);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_company_user ON notifications(company_id, user_id, created_at DESC);

-- Biometric Devices
CREATE INDEX IF NOT EXISTS idx_biometric_devices_company ON biometric_devices(company_id, is_active);

-- Vouchers
CREATE INDEX IF NOT EXISTS idx_vouchers_company_date ON vouchers(company_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vouchers_company_status ON vouchers(company_id, status);

-- Overtime
CREATE INDEX IF NOT EXISTS idx_overtime_company_emp ON overtime_records(company_id, employee_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_overtime_company_status ON overtime_records(company_id, status);

-- ID Definitions
CREATE INDEX IF NOT EXISTS idx_id_definitions_company ON id_definitions(company_id, entity_type);
CREATE INDEX IF NOT EXISTS idx_id_sequences_company ON id_sequences(company_id, definition_id);

-- Migration v14: Parking Management System (ANPR, Gates, QR, POS, Customers, Subscriptions, Reports)
-- Complete parking infrastructure for Nega City Mall

-- 1. Parking Zones / Lots
CREATE TABLE IF NOT EXISTS parking_zones (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) NOT NULL,
  floor INTEGER DEFAULT 0,
  description TEXT,
  slot_count INTEGER NOT NULL DEFAULT 0,
  type VARCHAR(20) DEFAULT 'standard' CHECK (type IN ('standard','vip','disabled','reserved','electric','staff')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Parking Slots
CREATE TABLE IF NOT EXISTS parking_slots (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  zone_id INTEGER NOT NULL REFERENCES parking_zones(id) ON DELETE CASCADE,
  slot_number VARCHAR(20) NOT NULL,
  floor INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available','occupied','reserved','maintenance')),
  type VARCHAR(20) DEFAULT 'standard' CHECK (type IN ('standard','vip','disabled','reserved','electric','staff')),
  current_session_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(company_id, slot_number)
);

-- 3. Parking Gates (3 App Gates)
CREATE TABLE IF NOT EXISTS parking_gates (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) NOT NULL UNIQUE,
  type VARCHAR(20) NOT NULL DEFAULT 'entry' CHECK (type IN ('entry','exit','dual')),
  direction VARCHAR(10) DEFAULT 'in' CHECK (direction IN ('in','out','both')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','inactive','maintenance')),
  ip_address VARCHAR(45),
  port INTEGER,
  serial_port VARCHAR(50),
  barrier_open_delay INTEGER DEFAULT 2,
  is_anpr_enabled BOOLEAN DEFAULT true,
  is_qr_enabled BOOLEAN DEFAULT true,
  is_nfc_enabled BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Parking Cameras (ANPR)
CREATE TABLE IF NOT EXISTS parking_cameras (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  gate_id INTEGER REFERENCES parking_gates(id) ON DELETE SET NULL,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) NOT NULL,
  ip_address VARCHAR(45) NOT NULL,
  port INTEGER DEFAULT 80,
  rtsp_url TEXT,
  direction VARCHAR(10) DEFAULT 'in' CHECK (direction IN ('in','out','both')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','inactive','offline','maintenance')),
  protocol VARCHAR(20) DEFAULT 'http' CHECK (protocol IN ('http','rtsp','onvif','tcp_ip')),
  confidence_threshold DECIMAL(5,2) DEFAULT 85.00,
  last_heartbeat TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Registered Vehicles
CREATE TABLE IF NOT EXISTS parking_vehicles (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  plate_number VARCHAR(50) NOT NULL,
  vehicle_type VARCHAR(30) DEFAULT 'car' CHECK (vehicle_type IN ('car','suv','truck','bus','motorcycle','bicycle','other')),
  vehicle_model VARCHAR(100),
  vehicle_color VARCHAR(50),
  owner_name VARCHAR(200),
  owner_phone VARCHAR(30),
  owner_email VARCHAR(200),
  rfid_tag VARCHAR(100),
  nfc_tag VARCHAR(100),
  is_blacklisted BOOLEAN DEFAULT false,
  is_resident BOOLEAN DEFAULT false,
  subscription_id INTEGER,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(company_id, plate_number)
);

-- 6. Parking Sessions (Entry/Exit Records)
CREATE TABLE IF NOT EXISTS parking_sessions (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  vehicle_id INTEGER REFERENCES parking_vehicles(id) ON DELETE SET NULL,
  plate_number VARCHAR(50),
  entry_gate_id INTEGER REFERENCES parking_gates(id) ON DELETE SET NULL,
  exit_gate_id INTEGER REFERENCES parking_gates(id) ON DELETE SET NULL,
  entry_camera_id INTEGER REFERENCES parking_cameras(id) ON DELETE SET NULL,
  exit_camera_id INTEGER REFERENCES parking_cameras(id) ON DELETE SET NULL,
  slot_id INTEGER REFERENCES parking_slots(id) ON DELETE SET NULL,
  entry_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  exit_time TIMESTAMP,
  duration_minutes INTEGER,
  entry_image_url TEXT,
  exit_image_url TEXT,
  entry_plate_confidence DECIMAL(5,2),
  exit_plate_confidence DECIMAL(5,2),
  entry_method VARCHAR(20) DEFAULT 'anpr' CHECK (entry_method IN ('anpr','qr','nfc','manual','rfid')),
  exit_method VARCHAR(20) DEFAULT 'anpr' CHECK (exit_method IN ('anpr','qr','nfc','manual','rfid')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','completed','pending_payment','cancelled')),
  amount DECIMAL(12,2) DEFAULT 0,
  paid BOOLEAN DEFAULT false,
  ticket_number VARCHAR(50),
  qr_ticket_id INTEGER,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Parking Rates / Fee Structure
CREATE TABLE IF NOT EXISTS parking_rates (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  vehicle_type VARCHAR(30) DEFAULT 'car' CHECK (vehicle_type IN ('car','suv','truck','bus','motorcycle','bicycle','all','other')),
  rate_type VARCHAR(20) DEFAULT 'hourly' CHECK (rate_type IN ('hourly','daily','weekly','monthly','annual','flat','custom')),
  base_rate DECIMAL(12,2) NOT NULL DEFAULT 0,
  per_hour_rate DECIMAL(12,2) DEFAULT 0,
  per_day_rate DECIMAL(12,2) DEFAULT 0,
  grace_period_minutes INTEGER DEFAULT 15,
  max_daily_charge DECIMAL(12,2),
  currency VARCHAR(10) DEFAULT 'ETB',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Parking QR Tickets (Visitor Entry)
CREATE TABLE IF NOT EXISTS parking_qr_tickets (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  ticket_number VARCHAR(50) NOT NULL UNIQUE,
  qr_code TEXT NOT NULL,
  visitor_name VARCHAR(200),
  visitor_phone VARCHAR(30),
  visitor_plate VARCHAR(50),
  purpose VARCHAR(200),
  host_name VARCHAR(200),
  host_phone VARCHAR(30),
  valid_from TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  valid_until TIMESTAMP NOT NULL,
  is_used BOOLEAN DEFAULT false,
  used_at TIMESTAMP,
  session_id INTEGER REFERENCES parking_sessions(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','used','expired','cancelled')),
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Parking Payments (POS)
CREATE TABLE IF NOT EXISTS parking_payments (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  session_id INTEGER NOT NULL REFERENCES parking_sessions(id) ON DELETE CASCADE,
  vehicle_id INTEGER REFERENCES parking_vehicles(id) ON DELETE SET NULL,
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'ETB',
  payment_method VARCHAR(30) NOT NULL DEFAULT 'cash' CHECK (payment_method IN ('cash','telebirr','cbebirr','chapa','santimpay','bank','pos','credit_card','debit_card')),
  reference VARCHAR(200),
  pos_terminal_id VARCHAR(50),
  receipt_number VARCHAR(50),
  paid_by VARCHAR(200),
  notes TEXT,
  payment_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Merge customer fields into existing membership_members (unified member/customer)
ALTER TABLE membership_members ADD COLUMN IF NOT EXISTS customer_id VARCHAR(50);
ALTER TABLE membership_members ADD COLUMN IF NOT EXISTS qr_code TEXT;
ALTER TABLE membership_members ALTER COLUMN plan_id DROP NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_membership_members_customer_id ON membership_members(company_id, customer_id) WHERE customer_id IS NOT NULL;

-- 11. Parking Subscriptions (Monthly/Annual Plans) - references membership_members
CREATE TABLE IF NOT EXISTS parking_subscriptions (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  customer_id INTEGER NOT NULL REFERENCES membership_members(id) ON DELETE CASCADE,
  vehicle_id INTEGER REFERENCES parking_vehicles(id) ON DELETE SET NULL,
  plan_type VARCHAR(20) NOT NULL DEFAULT 'monthly' CHECK (plan_type IN ('monthly','quarterly','semi_annual','annual','custom')),
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE NOT NULL,
  amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  payment_method VARCHAR(30) DEFAULT 'cash' CHECK (payment_method IN ('cash','telebirr','cbebirr','chapa','santimpay','bank','pos','credit_card','debit_card')),
  payment_reference VARCHAR(200),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active','expired','cancelled','pending')),
  auto_renew BOOLEAN DEFAULT false,
  renewal_count INTEGER DEFAULT 0,
  last_renewed_at TIMESTAMP,
  notes TEXT,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. Parking Access Logs (Entry/Exit Audit View - uses membership_members)
CREATE OR REPLACE VIEW parking_access_logs AS
SELECT
  ps.id as session_id,
  ps.company_id,
  ps.ticket_number,
  COALESCE(pv.plate_number, ps.plate_number) as plate_number,
  pv.vehicle_type,
  pv.vehicle_model,
  pv.vehicle_color,
  mm.full_name as customer_name,
  mm.phone as customer_phone,
  mm.customer_id as customer_code,
  ps.entry_time,
  ps.exit_time,
  ps.duration_minutes,
  eg.name as entry_gate,
  xg.name as exit_gate,
  ps.entry_method,
  ps.exit_method,
  pz.name as zone_name,
  psl.slot_number,
  ps.status as session_status,
  ps.amount,
  ps.paid,
  pp.payment_method,
  pp.receipt_number,
  pp.created_at as payment_time
FROM parking_sessions ps
LEFT JOIN parking_vehicles pv ON ps.vehicle_id = pv.id
LEFT JOIN membership_members mm ON pv.customer_id = mm.id
LEFT JOIN parking_gates eg ON ps.entry_gate_id = eg.id
LEFT JOIN parking_gates xg ON ps.exit_gate_id = xg.id
LEFT JOIN parking_slots psl ON ps.slot_id = psl.id
LEFT JOIN parking_zones pz ON psl.zone_id = pz.id
LEFT JOIN parking_payments pp ON pp.session_id = ps.id;

-- Add customer_id FK to parking_vehicles (references membership_members)
ALTER TABLE parking_vehicles ADD COLUMN IF NOT EXISTS customer_id INTEGER REFERENCES membership_members(id) ON DELETE SET NULL;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_parking_slots_zone ON parking_slots(zone_id);
CREATE INDEX IF NOT EXISTS idx_parking_slots_status ON parking_slots(status);
CREATE INDEX IF NOT EXISTS idx_parking_sessions_vehicle ON parking_sessions(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_parking_sessions_plate ON parking_sessions(plate_number);
CREATE INDEX IF NOT EXISTS idx_parking_sessions_status ON parking_sessions(status);
CREATE INDEX IF NOT EXISTS idx_parking_sessions_entry ON parking_sessions(entry_time);
CREATE INDEX IF NOT EXISTS idx_parking_vehicles_plate ON parking_vehicles(plate_number);
CREATE INDEX IF NOT EXISTS idx_parking_vehicles_customer ON parking_vehicles(customer_id);
CREATE INDEX IF NOT EXISTS idx_parking_qr_tickets_code ON parking_qr_tickets(qr_code);
CREATE INDEX IF NOT EXISTS idx_parking_payments_session ON parking_payments(session_id);
CREATE INDEX IF NOT EXISTS idx_parking_subscriptions_customer ON parking_subscriptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_parking_subscriptions_vehicle ON parking_subscriptions(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_parking_subscriptions_dates ON parking_subscriptions(start_date, end_date);

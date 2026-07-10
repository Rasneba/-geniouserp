-- Genius HRMS v5 - Employee Exit & Clearance Workflow

-- Add clearance_status to employees if missing
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='clearance_status') THEN
    ALTER TABLE employees ADD COLUMN clearance_status VARCHAR(20) DEFAULT 'not_applicable';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='termination_type') THEN
    ALTER TABLE employees ADD COLUMN termination_type VARCHAR(20);
  END IF;
END $$;

-- Clearance Checklist Items (predefined items for clearance process)
CREATE TABLE IF NOT EXISTS clearance_items (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  department_responsible VARCHAR(50),
  is_required BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO clearance_items (name, description, department_responsible, sort_order) VALUES
  ('Return Company Assets', 'Laptop, phone, ID card, access cards, keys', 'IT', 1),
  ('Settle Final Dues', 'Outstanding loans, advances, salary adjustments', 'Finance', 2),
  ('Handover Documents', 'Handover notes, project files, pending tasks', 'HR', 3),
  ('Exit Interview', 'Conduct exit interview and collect feedback', 'HR', 4),
  ('Benefits Settlement', 'Process final pay, leave encashment, pension', 'Finance', 5),
  ('Clearance from Direct Supervisor', 'Sign-off from reporting manager', 'HR', 6),
  ('Email & System Access Revoked', 'Deactivate email, VPN, and system accounts', 'IT', 7),
  ('Medical Insurance Removal', 'Remove from medical insurance coverage', 'HR', 8)
ON CONFLICT DO NOTHING;

-- Employee Clearance Tracking
CREATE TABLE IF NOT EXISTS employee_clearance (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  termination_date DATE,
  reason TEXT,
  termination_type VARCHAR(20),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','in_progress','cleared','rejected')),
  initiated_by INTEGER REFERENCES users(id),
  approved_by INTEGER REFERENCES users(id),
  approved_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Clearance Item Status per Employee
CREATE TABLE IF NOT EXISTS clearance_item_status (
  id SERIAL PRIMARY KEY,
  clearance_id INTEGER NOT NULL REFERENCES employee_clearance(id) ON DELETE CASCADE,
  item_id INTEGER NOT NULL REFERENCES clearance_items(id),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','completed','waived')),
  completed_by INTEGER REFERENCES users(id),
  completed_at TIMESTAMP,
  remarks TEXT,
  UNIQUE(clearance_id, item_id)
);

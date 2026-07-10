-- Migration v22: Add missing personnel tables

CREATE TABLE IF NOT EXISTS employee_spouse (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  full_name VARCHAR(200) NOT NULL,
  date_of_birth DATE,
  phone VARCHAR(30),
  occupation VARCHAR(100),
  employer VARCHAR(200),
  national_id VARCHAR(50),
  is_dependent BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_employee_spouse_employee ON employee_spouse(employee_id);

CREATE TABLE IF NOT EXISTS employee_training (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  course_name VARCHAR(200) NOT NULL,
  institution VARCHAR(200),
  start_date DATE,
  end_date DATE,
  duration_days INTEGER,
  certificate VARCHAR(200),
  status VARCHAR(30) DEFAULT 'completed' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_employee_training_employee ON employee_training(employee_id);

-- Genius HRMS v13 - Super Admin role
INSERT INTO roles (name, description) VALUES
  ('super_admin', 'Super system administrator - full cross-company access')
ON CONFLICT (name) DO NOTHING;

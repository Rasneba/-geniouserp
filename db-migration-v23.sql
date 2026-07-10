-- Migration v23: relay commands table for local relay
-- The relay script on the LAN polls this table for pending commands

CREATE TABLE IF NOT EXISTS relay_commands (
  id         SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  action     VARCHAR(100) NOT NULL,
  payload    JSONB,
  status     VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_relay_commands_pending ON relay_commands(company_id, status) WHERE status = 'pending';

-- Placement approval workflow
ALTER TABLE placements ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'approved';
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'placements_status_check') THEN
    ALTER TABLE placements ADD CONSTRAINT placements_status_check CHECK (status IN ('pending','approved','rejected'));
  END IF;
END $$;
ALTER TABLE placements ADD COLUMN IF NOT EXISTS approved_by INTEGER REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE placements ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP;

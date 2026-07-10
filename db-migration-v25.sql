-- Migration v25: Raw controller swipe events
-- Stores every card swipe from the door controller for reporting

ALTER TABLE rfid_access_logs ADD COLUMN IF NOT EXISTS direction VARCHAR(10) DEFAULT NULL;
ALTER TABLE rfid_access_logs ADD COLUMN IF NOT EXISTS event_type VARCHAR(50) DEFAULT NULL;
ALTER TABLE rfid_access_logs ADD COLUMN IF NOT EXISTS controller_id VARCHAR(100) DEFAULT NULL;
ALTER TABLE rfid_access_logs ADD COLUMN IF NOT EXISTS raw_data JSONB DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_rfid_access_logs_direction ON rfid_access_logs(direction);
CREATE INDEX IF NOT EXISTS idx_rfid_access_logs_event_type ON rfid_access_logs(event_type);

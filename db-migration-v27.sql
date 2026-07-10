-- Migration v27: Add plan_name and subscription_id to rfid_access_logs
ALTER TABLE rfid_access_logs ADD COLUMN IF NOT EXISTS plan_name VARCHAR(200) DEFAULT NULL;
ALTER TABLE rfid_access_logs ADD COLUMN IF NOT EXISTS subscription_id INTEGER REFERENCES parking_subscriptions(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_rfid_access_logs_subscription_id ON rfid_access_logs(subscription_id);

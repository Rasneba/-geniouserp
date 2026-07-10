-- Migration v30: Add freeze support with date tracking
-- 1. Add 'frozen' to status CHECK constraint
ALTER TABLE parking_subscriptions DROP CONSTRAINT IF EXISTS parking_subscriptions_status_check;
ALTER TABLE parking_subscriptions ADD CONSTRAINT parking_subscriptions_status_check
  CHECK (status IN ('active','expired','cancelled','pending','frozen'));

-- 2. Add freeze date columns
ALTER TABLE parking_subscriptions ADD COLUMN IF NOT EXISTS freeze_start DATE;
ALTER TABLE parking_subscriptions ADD COLUMN IF NOT EXISTS freeze_end DATE;

-- 3. Index for freeze queries
CREATE INDEX IF NOT EXISTS idx_parking_subscriptions_freeze ON parking_subscriptions(freeze_start, freeze_end);

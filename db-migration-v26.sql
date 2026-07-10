-- Migration v26: Link parking_subscriptions to membership_plans
ALTER TABLE parking_subscriptions ADD COLUMN IF NOT EXISTS plan_id INTEGER REFERENCES membership_plans(id) ON DELETE SET NULL;

-- Drop old CHECK constraint that restricted plan_type to hardcoded values
ALTER TABLE parking_subscriptions DROP CONSTRAINT IF EXISTS parking_subscriptions_plan_type_check;

CREATE INDEX IF NOT EXISTS idx_parking_subscriptions_plan_id ON parking_subscriptions(plan_id);

-- Try to link existing plan_type values to matching membership_plans by name pattern
UPDATE parking_subscriptions ps
SET plan_id = mp.id
FROM membership_plans mp
WHERE mp.company_id = ps.company_id
  AND ps.plan_id IS NULL
  AND (
    LOWER(mp.name) LIKE '%' || REPLACE(ps.plan_type, '_', ' ') || '%'
    OR LOWER(mp.name) LIKE '%parking%'
  );

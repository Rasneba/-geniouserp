-- Migration v24: Gym attendance / check-in tracking
-- Tracks member gym visits via RFID card scans

CREATE TABLE IF NOT EXISTS gym_checkins (
  id            SERIAL PRIMARY KEY,
  company_id    INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  member_id     INTEGER NOT NULL REFERENCES membership_members(id) ON DELETE CASCADE,
  card_uid      VARCHAR(100),
  check_in_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  check_out_at  TIMESTAMP,
  status        VARCHAR(20) NOT NULL DEFAULT 'checked_in' CHECK (status IN ('checked_in','checked_out')),
  source        VARCHAR(20) DEFAULT 'rfid' CHECK (source IN ('rfid','manual','kiosk')),
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_gym_checkins_company_date ON gym_checkins(company_id, check_in_at DESC);
CREATE INDEX IF NOT EXISTS idx_gym_checkins_member ON gym_checkins(member_id, check_in_at DESC);
CREATE INDEX IF NOT EXISTS idx_gym_checkins_status ON gym_checkins(company_id, status);
CREATE INDEX IF NOT EXISTS idx_gym_checkins_card ON gym_checkins(card_uid);

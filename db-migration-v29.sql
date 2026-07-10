-- Migration v29: Add QR code support for subscriptions
-- Stores base64-encoded QR data for each subscription
ALTER TABLE parking_subscriptions ADD COLUMN IF NOT EXISTS qr_code TEXT;
ALTER TABLE parking_subscriptions ADD COLUMN IF NOT EXISTS qr_image TEXT;

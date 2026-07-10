-- Migration v16: Webcam support for cameras, POS zone/phone filters
-- 1. Allow 'webcam' protocol in parking_cameras (for laptop built-in webcam)
ALTER TABLE parking_cameras DROP CONSTRAINT IF EXISTS parking_cameras_protocol_check;
ALTER TABLE parking_cameras ADD CONSTRAINT parking_cameras_protocol_check
  CHECK (protocol IN ('http','rtsp','onvif','tcp_ip','webcam'));
-- 2. Make ip_address optional for webcams
ALTER TABLE parking_cameras ALTER COLUMN ip_address DROP NOT NULL;

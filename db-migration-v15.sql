-- Migration v15: ID Definitions & Auto-Generation System
-- Configurable ID format per entity type, company, and branch

-- 1. ID Definitions table — configures ID format for each entity type
CREATE TABLE IF NOT EXISTS id_definitions (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  branch_id INTEGER REFERENCES branches(id) ON DELETE CASCADE,
  entity_type VARCHAR(50) NOT NULL,
  prefix VARCHAR(20) NOT NULL DEFAULT '',
  suffix VARCHAR(50) NOT NULL DEFAULT '',
  separator VARCHAR(5) NOT NULL DEFAULT '-',
  pad_length INTEGER NOT NULL DEFAULT 5,
  start_from INTEGER NOT NULL DEFAULT 1,
  reset_type VARCHAR(20) NOT NULL DEFAULT 'never'
    CHECK (reset_type IN ('never','yearly','monthly','daily')),
  pattern VARCHAR(200) NOT NULL DEFAULT '{PREFIX}{SEP}{SEQ}{SEP}{SUFFIX}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(company_id, entity_type, COALESCE(branch_id, 0))
);

-- 2. ID Sequences table — tracks current sequence values with period support
CREATE TABLE IF NOT EXISTS id_sequences (
  id SERIAL PRIMARY KEY,
  definition_id INTEGER NOT NULL REFERENCES id_definitions(id) ON DELETE CASCADE,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  branch_id INTEGER REFERENCES branches(id) ON DELETE SET NULL,
  period_key VARCHAR(20) NOT NULL DEFAULT 'all',
  current_value INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(definition_id, period_key)
);

-- 3. Insert default ID definitions for common entity types
-- These are inserted for company_id=1 (default first company).
-- Each company that signs up should get their own definitions inserted.

-- Helper: function to insert defaults for a given company_id
CREATE OR REPLACE FUNCTION seed_id_definitions(p_company_id INTEGER)
RETURNS void AS $$
BEGIN
  INSERT INTO id_definitions (company_id, entity_type, prefix, suffix, separator, pad_length, start_from, reset_type, pattern, description)
  VALUES
    (p_company_id, 'customer', 'CUST', '', '-', 5, 1, 'never', '{PREFIX}{SEP}{SEQ}', 'Membership/Parking Customer ID'),
    (p_company_id, 'member', 'MEM', '', '-', 5, 1, 'never', '{PREFIX}{SEP}{SEQ}', 'Membership Member ID'),
    (p_company_id, 'employee', 'EMP', '', '-', 5, 1, 'never', '{PREFIX}{SEP}{SEQ}', 'Employee Code'),
    (p_company_id, 'voucher', 'VCH', '{BRANCH_CODE}', '-', 5, 1, 'never', '{PREFIX}{SEP}{SEQ}{SEP}{SUFFIX}', 'Voucher Number'),
    (p_company_id, 'parking_session', 'PK', '', '-', 6, 1, 'daily', '{PREFIX}{SEP}{SEQ}', 'Parking Session Ticket'),
    (p_company_id, 'qr_ticket', 'QR', '', '-', 6, 1, 'daily', '{PREFIX}{SEP}{SEQ}', 'QR Entry Ticket'),
    (p_company_id, 'invoice', 'INV', '', '-', 5, 1, 'yearly', '{PREFIX}{SEP}{SEQ}', 'Sales Invoice Number'),
    (p_company_id, 'sales_order', 'SO', '', '-', 5, 1, 'yearly', '{PREFIX}{SEP}{SEQ}', 'Sales Order Number'),
    (p_company_id, 'quotation', 'QTN', '', '-', 5, 1, 'yearly', '{PREFIX}{SEP}{SEQ}', 'Quotation Number'),
    (p_company_id, 'purchase_order', 'PO', '', '-', 5, 1, 'yearly', '{PREFIX}{SEP}{SEQ}', 'Purchase Order Number'),
    (p_company_id, 'purchase_return', 'PR', '', '-', 5, 1, 'yearly', '{PREFIX}{SEP}{SEQ}', 'Purchase Return Number'),
    (p_company_id, 'stock_item', 'ITM', '', '-', 5, 1, 'never', '{PREFIX}{SEP}{SEQ}', 'Stock Item Code'),
    (p_company_id, 'product', 'PROD', '', '-', 5, 1, 'never', '{PREFIX}{SEP}{SEQ}', 'E-Commerce Product Code'),
    (p_company_id, 'branch', 'BR', '', '-', 3, 1, 'never', '{PREFIX}{SEP}{SEQ}', 'Branch Code')
  ON CONFLICT (company_id, entity_type, COALESCE(branch_id, 0)) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Seed for company_id = 1 (existing default)
SELECT seed_id_definitions(1);

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_id_definitions_company ON id_definitions(company_id);
CREATE INDEX IF NOT EXISTS idx_id_definitions_entity ON id_definitions(entity_type);
CREATE INDEX IF NOT EXISTS idx_id_sequences_definition ON id_sequences(definition_id);
CREATE INDEX IF NOT EXISTS idx_id_sequences_company ON id_sequences(company_id);

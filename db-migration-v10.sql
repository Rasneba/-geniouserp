-- Migration v10: Add company_id to Stock module tables
-- Ensures multi-tenant isolation for inventory data

-- 1. item_categories
ALTER TABLE item_categories ADD COLUMN IF NOT EXISTS company_id INTEGER REFERENCES companies(id);
UPDATE item_categories SET company_id = 1 WHERE company_id IS NULL;
ALTER TABLE item_categories ALTER COLUMN company_id SET NOT NULL;

-- 2. warehouses
ALTER TABLE warehouses ADD COLUMN IF NOT EXISTS company_id INTEGER REFERENCES companies(id);
UPDATE warehouses SET company_id = 1 WHERE company_id IS NULL;
ALTER TABLE warehouses ALTER COLUMN company_id SET NOT NULL;

-- 3. items
ALTER TABLE items ADD COLUMN IF NOT EXISTS company_id INTEGER REFERENCES companies(id);
UPDATE items SET company_id = 1 WHERE company_id IS NULL;
ALTER TABLE items ALTER COLUMN company_id SET NOT NULL;

-- 4. stock_balances
ALTER TABLE stock_balances ADD COLUMN IF NOT EXISTS company_id INTEGER REFERENCES companies(id);
UPDATE stock_balances sb SET company_id = 1 FROM items i WHERE sb.item_id = i.id AND sb.company_id IS NULL;
-- If no items exist yet, set default
UPDATE stock_balances SET company_id = 1 WHERE company_id IS NULL;
ALTER TABLE stock_balances ALTER COLUMN company_id SET NOT NULL;

-- 5. stock_movements
ALTER TABLE stock_movements ADD COLUMN IF NOT EXISTS company_id INTEGER REFERENCES companies(id);
UPDATE stock_movements sm SET company_id = 1 FROM items i WHERE sm.item_id = i.id AND sm.company_id IS NULL;
UPDATE stock_movements SET company_id = 1 WHERE company_id IS NULL;
ALTER TABLE stock_movements ALTER COLUMN company_id SET NOT NULL;

-- 6. stock_adjustments
ALTER TABLE stock_adjustments ADD COLUMN IF NOT EXISTS company_id INTEGER REFERENCES companies(id);
UPDATE stock_adjustments sa SET company_id = 1 FROM items i WHERE sa.item_id = i.id AND sa.company_id IS NULL;
UPDATE stock_adjustments SET company_id = 1 WHERE company_id IS NULL;
ALTER TABLE stock_adjustments ALTER COLUMN company_id SET NOT NULL;

-- 7. stock_transfers
ALTER TABLE stock_transfers ADD COLUMN IF NOT EXISTS company_id INTEGER REFERENCES companies(id);
UPDATE stock_transfers st SET company_id = 1 FROM items i WHERE st.item_id = i.id AND st.company_id IS NULL;
UPDATE stock_transfers SET company_id = 1 WHERE company_id IS NULL;
ALTER TABLE stock_transfers ALTER COLUMN company_id SET NOT NULL;

-- Drop unique constraint on items.code (cannot be unique across companies)
ALTER TABLE items DROP CONSTRAINT IF EXISTS items_code_key;
CREATE UNIQUE INDEX IF NOT EXISTS idx_items_code_company ON items(code, company_id);

-- Drop unique constraint on warehouses.code
ALTER TABLE warehouses DROP CONSTRAINT IF EXISTS warehouses_code_key;
CREATE UNIQUE INDEX IF NOT EXISTS idx_warehouses_code_company ON warehouses(code, company_id);

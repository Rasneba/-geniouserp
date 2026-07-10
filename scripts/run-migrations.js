const { Pool } = require("pg");
const fs = require("fs");

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "genius_hrms",
  password: process.env.DB_PASSWORD || "Admin123",
  port: parseInt(process.env.DB_PORT || "5432"),
});

(async () => {
  try {
    // Run v11 (add membership module)
    const v11 = fs.readFileSync("db-migration-v11.sql", "utf8");
    await pool.query(v11);
    console.log("v11 migration applied");

    // Run v12 (membership tables + seed data)
    const v12 = fs.readFileSync("db-migration-v12.sql", "utf8");
    await pool.query(v12);
    console.log("v12 migration applied");

    // Assign membership to default company
    await pool.query(`
      INSERT INTO company_modules (company_id, module_id, is_enabled)
      SELECT c.id, m.id, true FROM companies c, modules m
      WHERE c.tin = 'TIN-000001' AND m.code = 'membership'
        AND NOT EXISTS (
          SELECT 1 FROM company_modules cm WHERE cm.company_id = c.id AND cm.module_id = m.id
        )
    `);
    console.log("Membership module assigned to default company");

    const { rows } = await pool.query(`
      SELECT COUNT(*) as cnt FROM company_modules cm
      JOIN companies c ON cm.company_id = c.id
      WHERE c.tin = 'TIN-000001' AND cm.is_enabled = true
    `);
    console.log("Total enabled modules for default company:", rows[0].cnt);
  } catch (err) {
    console.error("Error:", err.message);
  }
  await pool.end();
})();

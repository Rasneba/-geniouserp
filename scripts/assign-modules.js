const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "genius_hrms",
  password: process.env.DB_PASSWORD || "Admin123",
  port: parseInt(process.env.DB_PORT || "5432"),
});

(async () => {
  try {
    // Assign all modules to default company
    await pool.query(`
      INSERT INTO company_modules (company_id, module_id, is_enabled)
      SELECT c.id, m.id, true FROM companies c, modules m
      WHERE c.tin = 'TIN-000001'
        AND NOT EXISTS (
          SELECT 1 FROM company_modules cm WHERE cm.company_id = c.id AND cm.module_id = m.id
        )
    `);
    console.log("Modules assigned successfully");

    const { rows } = await pool.query(`
      SELECT c.name, c.tin, COUNT(cm.id) as module_count
      FROM companies c
      LEFT JOIN company_modules cm ON cm.company_id = c.id AND cm.is_enabled = true
      WHERE c.tin = 'TIN-000001'
      GROUP BY c.id
    `);
    console.log("Company:", rows[0]?.name);
    console.log("TIN:", rows[0]?.tin);
    console.log("Enabled modules:", rows[0]?.module_count);
  } catch (err) {
    console.error("Error:", err.message);
  }
  await pool.end();
})();

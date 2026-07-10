const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

async function main() {
  const pool = new Pool({
    user: process.env.DB_USER || "postgres",
    host: process.env.DB_HOST || "localhost",
    database: process.env.DB_NAME || "genius_hrms",
    password: process.env.DB_PASSWORD || "Admin123",
    port: parseInt(process.env.DB_PORT || "5432"),
  });

  try {
    // Ensure super_admin role exists
    await pool.query(
      `INSERT INTO roles (name, description) VALUES ('super_admin', 'Super system administrator - full cross-company access') ON CONFLICT (name) DO NOTHING`
    );
    console.log("✓ super_admin role ensured");

    // Get the super_admin role id
    const roleRes = await pool.query("SELECT id FROM roles WHERE name = 'super_admin'");
    const roleId = roleRes.rows[0].id;

    // Hash password
    const password = await bcrypt.hash("123456", 10);

    // Upsert super admin user
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role_id, is_active)
       VALUES ($1, $2, $3, $4, true)
       ON CONFLICT (email) DO UPDATE SET role_id = $4, password = $3, is_active = true, name = $1
       RETURNING id, name, email`,
      ["Super Admin", "admin@genius.com", password, roleId]
    );

    console.log(`✓ Super admin user: ${result.rows[0].email} (password: 123456)`);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await pool.end();
  }
}

main();

import pool from "@/lib/db";
import { withAuth, ok, err, isAdmin } from "@/lib/api-utils";

export async function GET(req: Request) {
  return withAuth(req, async (user) => {
    if (user.role !== "admin" && user.role !== "super_admin") {
      return err("Forbidden", 403);
    }

    try {
      const [companies, licenses, users, expiring, modules] = await Promise.all([
        pool.query("SELECT COUNT(*) FROM companies"),
        pool.query("SELECT COUNT(*) FROM demo_licenses WHERE status = 'active'"),
        pool.query("SELECT COUNT(*) FROM users"),
        pool.query("SELECT COUNT(*) FROM demo_licenses WHERE status = 'active' AND expiry_date BETWEEN CURRENT_DATE AND CURRENT_DATE + 7"),
        pool.query(`
          SELECT m.name, m.code,
            (SELECT COUNT(*) FROM company_modules cm JOIN companies c ON cm.company_id = c.id WHERE cm.module_id = m.id AND cm.is_enabled = true AND c.status = 'active') as active_companies
          FROM modules m ORDER BY m.sort_order
        `),
      ]);

      const companyList = await pool.query(`
        SELECT c.id, c.name, c.tin, c.status, c.license_type, c.registration_date, c.contact_email,
          (SELECT COUNT(*) FROM users WHERE company_id = c.id) as user_count,
          (SELECT COUNT(*) FROM demo_licenses WHERE company_id = c.id AND status = 'active') as active_licenses,
          (SELECT MAX(expiry_date) FROM demo_licenses WHERE company_id = c.id AND status = 'active') as latest_expiry
        FROM companies c ORDER BY c.created_at DESC LIMIT 20
      `);

      return ok({
        totalCompanies: parseInt(companies.rows[0].count),
        totalActiveLicenses: parseInt(licenses.rows[0].count),
        totalUsers: parseInt(users.rows[0].count),
        expiringThisWeek: parseInt(expiring.rows[0].count),
        moduleAdoption: modules.rows,
        recentCompanies: companyList.rows,
      });
    } catch (e: any) {
      return err(e.message);
    }
  });
}

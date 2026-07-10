import { withAuth, ok, created, err, isAdmin } from "@/lib/api-utils";
import { requirePermission } from "@/lib/permissions";
import pool from "@/lib/db";

export async function GET(req: Request) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "view", "leave_definitions");
    if (!allowed) return err("Permission denied", 403);
    try {
      const params: any[] = [];
      let query = `
        SELECT ld.*, e.first_name || ' ' || e.last_name as employee_name, e.code as employee_code,
          lt.name as leave_type_name, lt.code as leave_type_code
        FROM leave_definitions ld
        JOIN employees e ON ld.employee_id = e.id
        JOIN leave_types lt ON ld.leave_type_id = lt.id
        WHERE 1=1
      `;
      if (!isAdmin(user)) {
        params.push(user.company_id);
        query += ` AND e.company_id = $${params.length}`;
      }
      query += ` ORDER BY e.first_name, ld.year`;
      const result = await pool.query(query, params);
      return ok(result.rows);
    } catch (e: any) { return err(e.message); }
  });
}

export async function POST(req: Request) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "create", "leave_definitions");
    if (!allowed) return err("Permission denied", 403);
    try {
      const { employee_id, leave_type_id, year, total_days } = await req.json();
      const result = await pool.query(
        `INSERT INTO leave_definitions (employee_id, leave_type_id, year, total_days)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (employee_id, leave_type_id, year) DO UPDATE SET total_days = EXCLUDED.total_days
         RETURNING *`,
        [employee_id, leave_type_id, year, total_days]
      );
      return created(result.rows[0]);
    } catch (e: any) { return err(e.message); }
  });
}

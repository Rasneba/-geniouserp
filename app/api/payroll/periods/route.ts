import pool from "@/lib/db";
import { withAuth, ok, created, err, isAdmin } from "@/lib/api-utils";
import { requirePermission } from "@/lib/permissions";

export async function GET(req: Request) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "view", "payroll_periods");
    if (!allowed) return err("Permission denied", 403);

    const admin = isAdmin(user);
    try {
      let query = `
        SELECT pp.*, u.name as processed_by_name
        FROM payroll_periods pp
        LEFT JOIN users u ON pp.processed_by = u.id
      `;
      const params: any[] = [];
      if (!admin) {
        query += ` WHERE pp.company_id = $1`;
        params.push(user.company_id);
      }
      query += ` ORDER BY pp.year DESC, pp.month DESC`;
      const result = await pool.query(query, params);
      return ok(result.rows);
    } catch (e: any) {
      return err(e.message);
    }
  });
}

export async function POST(req: Request) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "create", "payroll_periods");
    if (!allowed) return err("Permission denied", 403);

    try {
      const { year, month, start_date, end_date, notes } = await req.json();
      const result = await pool.query(
        `INSERT INTO payroll_periods (year, month, start_date, end_date, notes, company_id)
         VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
        [year, month, start_date, end_date, notes, user.company_id]
      );
      return created(result.rows[0]);
    } catch (e: any) {
      return err(e.message);
    }
  });
}

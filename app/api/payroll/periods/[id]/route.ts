import pool from "@/lib/db";
import { withAuth, ok, err, notFound, isAdmin } from "@/lib/api-utils";
import { requirePermission } from "@/lib/permissions";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "view", "payroll_periods");
    if (!allowed) return err("Permission denied", 403);

    const admin = isAdmin(user);
    const { id } = await params;
    try {
      let query = `
        SELECT pp.*, u.name as processed_by_name
        FROM payroll_periods pp
        LEFT JOIN users u ON pp.processed_by = u.id
        WHERE pp.id = $1`;
      const queryParams: any[] = [id];
      if (!admin) {
        query += ` AND pp.company_id = $2`;
        queryParams.push(user.company_id);
      }
      const result = await pool.query(query, queryParams);
      if (result.rows.length === 0) return notFound("Payroll period");
      return ok(result.rows[0]);
    } catch (e: any) {
      return err(e.message);
    }
  });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "edit", "payroll_periods");
    if (!allowed) return err("Permission denied", 403);

    const admin = isAdmin(user);
    const { id } = await params;
    const { status, notes } = await req.json();
    try {
      let query = `UPDATE payroll_periods SET status = COALESCE($1, status), notes = COALESCE($2, notes), updated_at = CURRENT_TIMESTAMP WHERE id = $3`;
      const queryParams: any[] = [status, notes, id];
      if (!admin) {
        query += ` AND company_id = $4`;
        queryParams.push(user.company_id);
      }
      query += ` RETURNING *`;
      const result = await pool.query(query, queryParams);
      if (result.rows.length === 0) return notFound("Payroll period");
      return ok(result.rows[0]);
    } catch (e: any) {
      return err(e.message);
    }
  });
}

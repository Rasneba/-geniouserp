import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { withAuth, ok, created, err, notFound, badRequest, deleted, isAdmin } from "@/lib/api-utils";
import { requirePermission } from "@/lib/permissions";

export async function GET(req: Request) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "view", "pension_contributions");
    if (!allowed) return NextResponse.json({ error: "Permission denied" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const employee_id = searchParams.get("employee_id");
    try {
      let query = `
        SELECT pc.*, e.code as employee_code, e.first_name, e.middle_name, e.last_name,
               pp.year, pp.month
        FROM pension_contributions pc
        JOIN employees e ON pc.employee_id = e.id
        LEFT JOIN payroll_periods pp ON pc.period_id = pp.id
      `;
      const params: any[] = [];
      if (employee_id) {
        query += " WHERE pc.employee_id = $1";
        params.push(employee_id);
      }
      query += " ORDER BY pc.created_at DESC";
      const result = await pool.query(query, params);
      return ok(result.rows);
    } catch (e: any) {
      return err(e.message);
    }
  });
}

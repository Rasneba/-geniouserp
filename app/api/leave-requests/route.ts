import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { withAuth, ok, created, err, isAdmin } from "@/lib/api-utils";
import { requirePermission } from "@/lib/permissions";

export async function GET(req: Request) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "view", "leave");
    if (!allowed) return NextResponse.json({ error: "Permission denied" }, { status: 403 });

    const admin = isAdmin(user);
    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const employee_id = url.searchParams.get("employee_id");

    try {
      let query = `
        SELECT lr.*, e.code as employee_code,
          e.first_name || ' ' || e.last_name as employee_name,
          lt.name as leave_type_name, lt.code as leave_type_code
        FROM leave_requests lr
        JOIN employees e ON lr.employee_id = e.id
        JOIN leave_types lt ON lr.leave_type_id = lt.id
        WHERE 1=1
      `;
      const params: any[] = [];
      let idx = 1;

      if (!admin) {
        query += ` AND e.company_id = $${idx}`;
        params.push(user.company_id);
        idx++;
      }
      if (status) {
        query += ` AND lr.status = $${idx}`;
        params.push(status);
        idx++;
      }
      if (employee_id) {
        query += ` AND lr.employee_id = $${idx}`;
        params.push(employee_id);
        idx++;
      }

      query += ` ORDER BY lr.created_at DESC`;

      const result = await pool.query(query, params);
      return ok(result.rows);
    } catch (e: any) {
      return err(e.message);
    }
  });
}

export async function POST(req: Request) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "create", "leave");
    if (!allowed) return NextResponse.json({ error: "Permission denied" }, { status: 403 });

    try {
      const { employee_id, leave_type_id, start_date, end_date, total_days, reason } = await req.json();
      const result = await pool.query(
        `INSERT INTO leave_requests (employee_id, leave_type_id, start_date, end_date, total_days, reason)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [employee_id, leave_type_id, start_date, end_date, total_days, reason]
      );
      return created(result.rows[0]);
    } catch (e: any) {
      return err(e.message);
    }
  });
}

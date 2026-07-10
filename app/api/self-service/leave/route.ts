import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { withAuth, ok, created, err, notFound } from "@/lib/api-utils";
import { requirePermission } from "@/lib/permissions";

export async function GET(req: Request) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "view", "self_leave");
    if (!allowed) return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    try {
      const empRes = await pool.query(
        "SELECT id FROM employees WHERE email = $1",
        [user.email]
      );

      if (empRes.rows.length === 0) {
        return notFound("Employee");
      }

      const employeeId = empRes.rows[0].id;

      const url = new URL(req.url);
      const status = url.searchParams.get("status");

      let query = `
        SELECT lr.*, lt.name as leave_type_name, lt.code as leave_type_code
        FROM leave_requests lr
        JOIN leave_types lt ON lr.leave_type_id = lt.id
        WHERE lr.employee_id = $1
      `;
      const params: any[] = [employeeId];
      let idx = 2;

      if (status) {
        query += ` AND lr.status = $${idx}`;
        params.push(status);
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
    const { allowed } = await requirePermission(user, "create", "self_leave");
    if (!allowed) return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    try {
      const empRes = await pool.query(
        "SELECT id FROM employees WHERE email = $1",
        [user.email]
      );

      if (empRes.rows.length === 0) {
        return notFound("Employee");
      }

      const employeeId = empRes.rows[0].id;
      const { leave_type_id, start_date, end_date, total_days, reason } = await req.json();

      const result = await pool.query(
        `INSERT INTO leave_requests (employee_id, leave_type_id, start_date, end_date, total_days, reason, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'pending') RETURNING *`,
        [employeeId, leave_type_id, start_date, end_date, total_days, reason]
      );

      return created(result.rows[0]);
    } catch (e: any) {
      return err(e.message);
    }
  });
}

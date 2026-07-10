import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { withAuth, ok, err, notFound, isAdmin } from "@/lib/api-utils";
import { requirePermission } from "@/lib/permissions";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "view", "leave");
    if (!allowed) return NextResponse.json({ error: "Permission denied" }, { status: 403 });

    const { id } = await params;
    const admin = isAdmin(user);

    try {
      let query = `
        SELECT lr.*, e.code as employee_code,
          e.first_name || ' ' || e.last_name as employee_name,
          lt.name as leave_type_name, lt.code as leave_type_code
        FROM leave_requests lr
        JOIN employees e ON lr.employee_id = e.id
        JOIN leave_types lt ON lr.leave_type_id = lt.id
        WHERE lr.id = $1
      `;
      const params: any[] = [id];
      if (!admin) {
        query += ` AND e.company_id = $2`;
        params.push(user.company_id);
      }
      const result = await pool.query(query, params);
      if (result.rows.length === 0) return notFound("Leave request");
      return ok(result.rows[0]);
    } catch (e: any) {
      return err(e.message);
    }
  });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(req, async (user) => {
    const { id } = await params;
    let body: any;
    try { body = await req.json(); } catch { body = {}; }

    const action = body.status === "approved" || body.status === "rejected" ? "approve" : "edit";

    const { allowed } = await requirePermission(user, action as any, "leave");
    if (!allowed) return NextResponse.json({ error: "Permission denied" }, { status: 403 });

    const admin = isAdmin(user);

    try {
      const existing = await pool.query(`SELECT employee_id, leave_type_id, total_days, status FROM leave_requests WHERE id = $1`, [id]);
      if (existing.rows.length === 0) return notFound("Leave request");
      const prev = existing.rows[0];

      let query = `UPDATE leave_requests SET status = $1`;
      const params: any[] = [body.status];
      let idx = 2;

      if (body.status === "approved" || body.status === "rejected") {
        query += `, approved_by = $${idx}, approved_at = CURRENT_TIMESTAMP`;
        params.push(user.id);
        idx++;
      }

      query += ` WHERE id = $${idx}`;
      params.push(id);
      idx++;

      if (!admin) {
        query += ` AND employee_id IN (SELECT id FROM employees WHERE company_id = $${idx})`;
        params.push(user.company_id);
      }

      query += ` RETURNING *`;

      const result = await pool.query(query, params);
      if (result.rows.length === 0) return notFound("Leave request");

      const updated = result.rows[0];
      const year = new Date(updated.start_date).getFullYear();

      if (body.status === "approved" && prev.status !== "approved") {
        await pool.query(
          `INSERT INTO leave_definitions (employee_id, leave_type_id, year, total_days, used_days)
           VALUES ($1, $2, $3, 0, $4)
           ON CONFLICT (employee_id, leave_type_id, year)
           DO UPDATE SET used_days = leave_definitions.used_days + $4`,
          [prev.employee_id, prev.leave_type_id, year, prev.total_days]
        );
      } else if (prev.status === "approved" && body.status !== "approved") {
        await pool.query(
          `UPDATE leave_definitions SET used_days = GREATEST(used_days - $1, 0)
           WHERE employee_id = $2 AND leave_type_id = $3 AND year = $4`,
          [prev.total_days, prev.employee_id, prev.leave_type_id, year]
        );
      }

      return ok(result.rows[0]);
    } catch (e: any) {
      return err(e.message);
    }
  });
}

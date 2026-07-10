import { NextResponse } from "next/server";
import { withAuth, ok, created, err } from "@/lib/api-utils";
import { requirePermission } from "@/lib/permissions";
import pool from "@/lib/db";

export async function GET(req: Request) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "view", "placements");
    if (!allowed) return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    const isAdmin = user.role === "super_admin";
    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status");
    const params: any[] = [];
    let idx = 1;
    try {
      let query = `
        SELECT p.*,
          e.code as employee_code,
          e.first_name || ' ' || e.last_name as employee_name,
          d.name as department_name,
          pos.title as position_title,
          es.name as employment_stage_name
        FROM placements p
        JOIN employees e ON p.employee_id = e.id
        LEFT JOIN departments d ON p.department_id = d.id
        LEFT JOIN positions pos ON p.position_id = pos.id
        LEFT JOIN employment_stages es ON p.employment_stage_id = es.id
        WHERE 1=1
      `;
      if (!isAdmin) {
        query += ` AND e.company_id = $${idx++}`;
        params.push(user.company_id);
      }
      if (statusFilter) {
        query += ` AND p.status = $${idx++}`;
        params.push(statusFilter);
      }
      query += ` ORDER BY p.created_at DESC`;
      const result = await pool.query(query, params);
      return ok(result.rows);
    } catch (e: any) { return err(e.message); }
  });
}

export async function POST(req: Request) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "create", "placements");
    if (!allowed) return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    try {
      const {
        employee_id, placement_type, employment_stage_id,
        department_id, position_id, branch, salary,
        start_date, end_date, reason, previous_placement_id
      } = await req.json();
      const status = user.role === "super_admin" ? "approved" : "pending";
      const result = await pool.query(
        `INSERT INTO placements (employee_id, placement_type, employment_stage_id,
          department_id, position_id, branch, salary, start_date, end_date,
          reason, previous_placement_id, created_by, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
        [employee_id, placement_type, employment_stage_id,
          department_id, position_id, branch, salary, start_date, end_date,
          reason, previous_placement_id, user.id, status]
      );
      if (status === "approved") {
        await pool.query(
          `UPDATE employees SET employment_stage_id = $1, department_id = $2,
            position_id = $3, branch = $4, salary = $5, updated_at = CURRENT_TIMESTAMP
           WHERE id = $6`,
          [employment_stage_id, department_id, position_id, branch, salary, employee_id]
        );
      }
      return created(result.rows[0]);
    } catch (e: any) { return err(e.message); }
  });
}

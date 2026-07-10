import { NextResponse } from "next/server";
import { withAuth, ok, created, err } from "@/lib/api-utils";
import { requirePermission } from "@/lib/permissions";
import pool from "@/lib/db";

export async function GET(req: Request) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "view", "clearance");
    if (!allowed) return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    try {
      const result = await pool.query(
        `SELECT ec.*, e.code as employee_code, e.first_name, e.middle_name, e.last_name,
                e.department_id, d.name as department_name,
                u1.name as initiated_by_name, u2.name as approved_by_name
         FROM employee_clearance ec
         JOIN employees e ON ec.employee_id = e.id
         LEFT JOIN departments d ON e.department_id = d.id
         LEFT JOIN users u1 ON ec.initiated_by = u1.id
         LEFT JOIN users u2 ON ec.approved_by = u2.id
         ORDER BY ec.created_at DESC`
      );
      return ok(result.rows);
    } catch (e: any) { return err(e.message); }
  });
}

export async function POST(req: Request) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "create", "clearance");
    if (!allowed) return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    try {
      const { employee_id, termination_date, reason, termination_type } = await req.json();
      const result = await pool.query(
        `INSERT INTO employee_clearance (employee_id, termination_date, reason, termination_type, initiated_by)
         VALUES ($1,$2,$3,$4,$5) RETURNING *`,
        [employee_id, termination_date, reason, termination_type, user.id]
      );
      const clearance = result.rows[0];
      const items = await pool.query("SELECT id FROM clearance_items WHERE is_active = true ORDER BY sort_order");
      for (const item of items.rows) {
        await pool.query(
          "INSERT INTO clearance_item_status (clearance_id, item_id) VALUES ($1,$2)",
          [clearance.id, item.id]
        );
      }
      await pool.query(
        "UPDATE employees SET clearance_status='pending', termination_date=$1, termination_reason=$2, termination_type=$3, is_active=false WHERE id=$4",
        [termination_date, reason, termination_type, employee_id]
      );
      return created(clearance);
    } catch (e: any) { return err(e.message); }
  });
}

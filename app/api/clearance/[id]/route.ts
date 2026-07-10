import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getAuthUser, unauthorized } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  const { id } = await params;
  try {
    const clearance = await pool.query(
      `SELECT ec.*, e.code as employee_code, e.first_name, e.middle_name, e.last_name,
              e.department_id, e.position_id, e.phone, e.email, e.hire_date, e.salary, e.photo,
              d.name as department_name, p.title as position_title,
              u1.name as initiated_by_name, u2.name as approved_by_name
       FROM employee_clearance ec
       JOIN employees e ON ec.employee_id = e.id
       LEFT JOIN departments d ON e.department_id = d.id
       LEFT JOIN positions p ON e.position_id = p.id
       LEFT JOIN users u1 ON ec.initiated_by = u1.id
       LEFT JOIN users u2 ON ec.approved_by = u2.id
       WHERE ec.id = $1`, [id]
    );
    if (clearance.rows.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const items = await pool.query(
      `SELECT cis.*, ci.name as item_name, ci.description, ci.department_responsible,
              u.name as completed_by_name
       FROM clearance_item_status cis
       JOIN clearance_items ci ON cis.item_id = ci.id
       LEFT JOIN users u ON cis.completed_by = u.id
       WHERE cis.clearance_id = $1
       ORDER BY ci.sort_order`, [id]
    );
    return NextResponse.json({ ...clearance.rows[0], items: items.rows });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  const { id } = await params;
  try {
    const { status, notes } = await req.json();
    const result = await pool.query(
      `UPDATE employee_clearance SET status=$1, notes=COALESCE($2, notes),
       approved_by=$3, approved_at=CURRENT_TIMESTAMP WHERE id=$4 RETURNING *`,
      [status, notes, user.id, id]
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (status === "cleared") {
      const clearance = result.rows[0];
      await pool.query("UPDATE employees SET clearance_status='cleared' WHERE id=$1", [clearance.employee_id]);
    }
    return NextResponse.json(result.rows[0]);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

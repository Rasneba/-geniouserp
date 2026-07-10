import { NextResponse } from "next/server";
import { withAuth, ok, err, notFound, badRequest, deleted } from "@/lib/api-utils";
import { requirePermission } from "@/lib/permissions";
import pool from "@/lib/db";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "view", "overtime");
    if (!allowed) return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    const { id } = await params;
    try {
      const result = await pool.query(`
        SELECT o.*,
          e.code as employee_code,
          e.first_name || ' ' || e.last_name as employee_name
        FROM overtime_records o
        JOIN employees e ON o.employee_id = e.id
        WHERE o.id = $1
      `, [id]);
      if (result.rows.length === 0) return notFound("Overtime record not found");
      return ok(result.rows[0]);
    } catch (e: any) { return err(e.message); }
  });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(req, async (user) => {
    const { id } = await params;
    let body: any;
    try { body = await req.json(); } catch { body = {}; }

    const action = body.status === "approved" || body.status === "rejected" ? "approve" : "edit";
    const { allowed } = await requirePermission(user, action as any, "overtime");
    if (!allowed) return NextResponse.json({ error: "Permission denied" }, { status: 403 });

    try {
      const existing = await pool.query(`SELECT status FROM overtime_records WHERE id = $1`, [id]);
      if (existing.rows.length === 0) return notFound("Overtime record not found");
      const prevStatus = existing.rows[0].status;

      const fields: string[] = [];
      const values: any[] = [];
      let idx = 1;
      const allowedFields = [
        "employee_id", "date", "start_time", "end_time",
        "total_hours", "rate_multiplier", "rate_type", "amount", "status"
      ];
      for (const field of allowedFields) {
        if (body[field] !== undefined) {
          fields.push(`${field} = $${idx}`);
          values.push(body[field]);
          idx++;
        }
      }
      if ((body.status === "approved" && prevStatus !== "approved") || (body.status === "rejected" && prevStatus !== "rejected")) {
        fields.push(`approved_by = $${idx}`);
        values.push(user.id);
        idx++;
        fields.push(`approved_at = CURRENT_TIMESTAMP`);
      }
      if (fields.length === 0) return badRequest("No fields to update");
      values.push(id);
      const result = await pool.query(
        `UPDATE overtime_records SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
        values
      );
      if (result.rows.length === 0) return notFound("Overtime record not found");
      return ok(result.rows[0]);
    } catch (e: any) { return err(e.message); }
  });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "delete", "overtime");
    if (!allowed) return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    const { id } = await params;
    try {
      await pool.query("DELETE FROM overtime_records WHERE id = $1", [id]);
      return deleted("Overtime record deleted");
    } catch (e: any) { return err(e.message); }
  });
}

import { NextResponse } from "next/server";
import { withAuth, ok, err, notFound, badRequest, deleted } from "@/lib/api-utils";
import { requirePermission } from "@/lib/permissions";
import pool from "@/lib/db";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "view", "performance");
    if (!allowed) return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    const { id } = await params;
    try {
      const result = await pool.query(`
        SELECT pe.*,
          e.first_name || ' ' || e.last_name as employee_name,
          r.first_name || ' ' || r.last_name as reviewer_name
        FROM performance_evaluations pe
        JOIN employees e ON pe.employee_id = e.id
        LEFT JOIN employees r ON pe.reviewer_id = r.id
        WHERE pe.id = $1
      `, [id]);
      if (result.rows.length === 0) return notFound("Evaluation not found");
      return ok(result.rows[0]);
    } catch (e: any) { return err(e.message); }
  });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "edit", "performance");
    if (!allowed) return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    const { id } = await params;
    try {
      const { status } = await req.json();
      if (!["submitted", "acknowledged"].includes(status)) return badRequest("Invalid status");
      const result = await pool.query(
        `UPDATE performance_evaluations SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
        [status, id]
      );
      if (result.rows.length === 0) return notFound("Evaluation not found");
      return ok(result.rows[0]);
    } catch (e: any) { return err(e.message); }
  });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "delete", "performance");
    if (!allowed) return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    const { id } = await params;
    try {
      await pool.query("DELETE FROM performance_evaluations WHERE id = $1", [id]);
      return deleted("Evaluation deleted");
    } catch (e: any) { return err(e.message); }
  });
}

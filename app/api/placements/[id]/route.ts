import { NextResponse } from "next/server";
import { withAuth, ok, err, notFound, deleted, badRequest } from "@/lib/api-utils";
import { requirePermission } from "@/lib/permissions";
import pool from "@/lib/db";

async function verifyPlacementCompany(placementId: number, user: any): Promise<boolean> {
  if (user.role === "super_admin") return true;
  const result = await pool.query(
    `SELECT e.company_id FROM placements p JOIN employees e ON p.employee_id = e.id WHERE p.id = $1`,
    [placementId]
  );
  if (result.rows.length === 0) return false;
  return result.rows[0].company_id === user.company_id;
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "view", "placements");
    if (!allowed) return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    const { id } = await params;
    if (!(await verifyPlacementCompany(Number(id), user))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    try {
      const result = await pool.query(`
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
        WHERE p.id = $1
      `, [id]);
      if (result.rows.length === 0) return notFound("Placement not found");
      return ok(result.rows[0]);
    } catch (e: any) { return err(e.message); }
  });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "edit", "placements");
    if (!allowed) return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    const { id } = await params;
    if (!(await verifyPlacementCompany(Number(id), user))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    try {
      const {
        employee_id, placement_type, employment_stage_id,
        department_id, position_id, branch, salary,
        start_date, end_date, reason, previous_placement_id
      } = await req.json();
      const result = await pool.query(
        `UPDATE placements SET employee_id = $1, placement_type = $2,
          employment_stage_id = $3, department_id = $4, position_id = $5,
          branch = $6, salary = $7, start_date = $8, end_date = $9,
          reason = $10, previous_placement_id = $11
         WHERE id = $12 RETURNING *`,
        [employee_id, placement_type, employment_stage_id,
          department_id, position_id, branch, salary, start_date, end_date,
          reason, previous_placement_id, id]
      );
      if (result.rows.length === 0) return notFound("Placement not found");
      return ok(result.rows[0]);
    } catch (e: any) { return err(e.message); }
  });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "approve", "placements");
    if (!allowed) return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    const { id } = await params;
    if (!(await verifyPlacementCompany(Number(id), user))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    try {
      const { status } = await req.json();
      if (status !== "approved" && status !== "rejected") {
        return badRequest("Status must be 'approved' or 'rejected'");
      }
      const placement = await pool.query(
        `UPDATE placements SET status = $1, approved_by = $2, approved_at = CURRENT_TIMESTAMP
         WHERE id = $3 RETURNING *`,
        [status, user.id, id]
      );
      if (placement.rows.length === 0) return notFound("Placement not found");
      if (status === "approved") {
        const p = placement.rows[0];
        await pool.query(
          `UPDATE employees SET employment_stage_id = $1, department_id = $2,
            position_id = $3, branch = $4, salary = $5, updated_at = CURRENT_TIMESTAMP
           WHERE id = $6`,
          [p.employment_stage_id, p.department_id, p.position_id, p.branch, p.salary, p.employee_id]
        );
      }
      return ok(placement.rows[0]);
    } catch (e: any) { return err(e.message); }
  });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "delete", "placements");
    if (!allowed) return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    const { id } = await params;
    if (!(await verifyPlacementCompany(Number(id), user))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    try {
      await pool.query("DELETE FROM placements WHERE id = $1", [id]);
      return deleted("Placement deleted");
    } catch (e: any) { return err(e.message); }
  });
}

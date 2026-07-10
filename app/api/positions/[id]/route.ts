import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { withAuth, ok, err, notFound, deleted, isAdmin } from "@/lib/api-utils";
import { requirePermission } from "@/lib/permissions";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "view", "positions");
    if (!allowed) return NextResponse.json({ error: "Permission denied" }, { status: 403 });

    const { id } = await params;
    const admin = isAdmin(user);

    try {
      let query = `
        SELECT p.*, d.name as department_name
        FROM positions p
        LEFT JOIN departments d ON p.department_id = d.id
        WHERE p.id = $1
      `;
      const queryParams: any[] = [id];
      if (!admin) {
        query += ` AND p.company_id = $2`;
        queryParams.push(user.company_id);
      }
      const result = await pool.query(query, queryParams);
      if (result.rows.length === 0) return notFound("Position");
      return ok(result.rows[0]);
    } catch (e: any) {
      return err(e.message);
    }
  });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "edit", "positions");
    if (!allowed) return NextResponse.json({ error: "Permission denied" }, { status: 403 });

    const { id } = await params;
    const admin = isAdmin(user);

    try {
      const { title, department_id, description, min_salary, max_salary, is_active } = await req.json();
      let query = `UPDATE positions SET title = $1, department_id = $2, description = $3,
         min_salary = $4, max_salary = $5, is_active = $6 WHERE id = $7`;
      const queryParams: any[] = [title, department_id, description, min_salary, max_salary, is_active, id];
      if (!admin) {
        query += ` AND company_id = $8`;
        queryParams.push(user.company_id);
      }
      query += ` RETURNING *`;
      const result = await pool.query(query, queryParams);
      if (result.rows.length === 0) return notFound("Position");
      return ok(result.rows[0]);
    } catch (e: any) {
      return err(e.message);
    }
  });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "delete", "positions");
    if (!allowed) return NextResponse.json({ error: "Permission denied" }, { status: 403 });

    const { id } = await params;
    try {
      if (user.role !== "super_admin" && user.company_id) {
        const check = await pool.query("SELECT company_id FROM positions WHERE id = $1", [id]);
        if (check.rows.length === 0 || check.rows[0].company_id !== user.company_id) {
          return notFound("Position");
        }
      }
      await pool.query("DELETE FROM positions WHERE id = $1", [id]);
      return deleted("Position");
    } catch (e: any) {
      return err(e.message);
    }
  });
}

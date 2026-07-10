import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { withAuth, ok, err, notFound, deleted, isAdmin } from "@/lib/api-utils";
import { requirePermission } from "@/lib/permissions";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "view", "departments");
    if (!allowed) return NextResponse.json({ error: "Permission denied" }, { status: 403 });

    const { id } = await params;
    const admin = isAdmin(user);

    try {
      let query = `
        SELECT d.*, e.first_name || ' ' || e.last_name as manager_name
        FROM departments d
        LEFT JOIN employees e ON d.manager_id = e.id
        WHERE d.id = $1
      `;
      const queryParams: any[] = [id];
      if (!admin) {
        query += ` AND d.company_id = $2`;
        queryParams.push(user.company_id);
      }
      const result = await pool.query(query, queryParams);
      if (result.rows.length === 0) return notFound("Department");
      return ok(result.rows[0]);
    } catch (e: any) {
      return err(e.message);
    }
  });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "edit", "departments");
    if (!allowed) return NextResponse.json({ error: "Permission denied" }, { status: 403 });

    const { id } = await params;
    const admin = isAdmin(user);

    try {
      const { name, code, description, manager_id, is_active } = await req.json();
      let query = `UPDATE departments SET name = $1, code = $2, description = $3,
         manager_id = $4, is_active = $5 WHERE id = $6`;
      const queryParams: any[] = [name, code, description, manager_id, is_active, id];
      if (!admin) {
        query += ` AND company_id = $7`;
        queryParams.push(user.company_id);
      }
      query += ` RETURNING *`;
      const result = await pool.query(query, queryParams);
      if (result.rows.length === 0) return notFound("Department");
      return ok(result.rows[0]);
    } catch (e: any) {
      return err(e.message);
    }
  });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "delete", "departments");
    if (!allowed) return NextResponse.json({ error: "Permission denied" }, { status: 403 });

    const { id } = await params;
    try {
      if (user.role !== "super_admin" && user.company_id) {
        const check = await pool.query("SELECT company_id FROM departments WHERE id = $1", [id]);
        if (check.rows.length === 0 || check.rows[0].company_id !== user.company_id) {
          return notFound("Department");
        }
      }
      await pool.query("DELETE FROM departments WHERE id = $1", [id]);
      return deleted("Department");
    } catch (e: any) {
      return err(e.message);
    }
  });
}

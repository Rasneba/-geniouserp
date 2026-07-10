import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { withAuth, ok, err, notFound, deleted, isAdmin } from "@/lib/api-utils";
import { requirePermission } from "@/lib/permissions";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "view", "branches");
    if (!allowed) return NextResponse.json({ error: "Permission denied" }, { status: 403 });

    const { id } = await params;
    const admin = isAdmin(user);

    try {
      let query = `SELECT * FROM branches WHERE id = $1`;
      const params: any[] = [id];
      if (!admin) {
        query += ` AND company_id = $2`;
        params.push(user.company_id);
      }
      const result = await pool.query(query, params);
      if (result.rows.length === 0) return notFound("Branch");
      return ok(result.rows[0]);
    } catch (e: any) {
      return err(e.message);
    }
  });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "edit", "branches");
    if (!allowed) return NextResponse.json({ error: "Permission denied" }, { status: 403 });

    const { id } = await params;
    const admin = isAdmin(user);

    try {
      const { name, code, address, phone, email, is_head_office, is_active } = await req.json();
      let query = `UPDATE branches SET name = $1, code = $2, address = $3,
         phone = $4, email = $5, is_head_office = $6, is_active = $7 WHERE id = $8`;
      const params: any[] = [name, code, address, phone, email, is_head_office, is_active, id];
      if (!admin) {
        query += ` AND company_id = $9`;
        params.push(user.company_id);
      }
      query += ` RETURNING *`;
      const result = await pool.query(query, params);
      if (result.rows.length === 0) return notFound("Branch");
      return ok(result.rows[0]);
    } catch (e: any) {
      return err(e.message);
    }
  });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "delete", "branches");
    if (!allowed) return NextResponse.json({ error: "Permission denied" }, { status: 403 });

    const { id } = await params;
    try {
      if (user.role !== "super_admin" && user.company_id) {
        const check = await pool.query("SELECT company_id FROM branches WHERE id = $1", [id]);
        if (check.rows.length === 0 || check.rows[0].company_id !== user.company_id) {
          return notFound("Branch");
        }
      }
      await pool.query("DELETE FROM branches WHERE id = $1", [id]);
      return deleted("Branch");
    } catch (e: any) {
      return err(e.message);
    }
  });
}

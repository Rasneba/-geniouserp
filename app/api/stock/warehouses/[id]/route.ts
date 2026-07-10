import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { withAuth, ok, created, err, notFound, badRequest, deleted, isAdmin } from "@/lib/api-utils";
import { requirePermission } from "@/lib/permissions";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(req, async (user) => {
    const { allowed, error } = await requirePermission(user, "view", "warehouses");
    if (!allowed) return NextResponse.json(error, { status: 403 });
    const admin = isAdmin(user);
    const { id } = await params;
    try {
      const result = await pool.query(`SELECT * FROM warehouses WHERE id = $1${admin ? "" : " AND company_id = $2"}`, admin ? [id] : [id, user.company_id]);
      if (result.rows.length === 0) return notFound("Warehouse");
      return ok(result.rows[0]);
    } catch (e: any) { return err(e.message); }
  });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(req, async (user) => {
    const { allowed, error } = await requirePermission(user, "edit", "warehouses");
    if (!allowed) return NextResponse.json(error, { status: 403 });
    const admin = isAdmin(user);
    const { id } = await params;
    try {
      const body = await req.json();
      const allowedFields = ["name","code","location","manager","phone","is_active"];
      const sets: string[] = [];
      const vals: any[] = [];
      let idx = 1;
      for (const key of allowedFields) {
        if (body[key] !== undefined) { sets.push(`${key} = $${idx}`); vals.push(body[key]); idx++; }
      }
      if (sets.length === 0) return badRequest("No fields");
      let whereClause = `id = $${idx}`;
      vals.push(id);
      if (!admin) { idx++; whereClause += ` AND company_id = $${idx}`; vals.push(user.company_id); }
      const result = await pool.query(`UPDATE warehouses SET ${sets.join(", ")} WHERE ${whereClause} RETURNING *`, vals);
      return ok(result.rows[0]);
    } catch (e: any) { return err(e.message); }
  });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(req, async (user) => {
    const { allowed, error } = await requirePermission(user, "delete", "warehouses");
    if (!allowed) return NextResponse.json(error, { status: 403 });
    const admin = isAdmin(user);
    const { id } = await params;
    try {
      await pool.query(`UPDATE warehouses SET is_active = false WHERE id = $1${admin ? "" : " AND company_id = $2"}`, admin ? [id] : [id, user.company_id]);
      return deleted("Warehouse");
    } catch (e: any) { return err(e.message); }
  });
}

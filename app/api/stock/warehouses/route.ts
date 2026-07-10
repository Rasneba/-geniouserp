import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { withAuth, ok, created, err, notFound, badRequest, deleted, isAdmin } from "@/lib/api-utils";
import { requirePermission } from "@/lib/permissions";

export async function GET(req: Request) {
  return withAuth(req, async (user) => {
    const { allowed, error } = await requirePermission(user, "view", "warehouses");
    if (!allowed) return NextResponse.json(error, { status: 403 });
    const admin = isAdmin(user);
    try {
      let query = "SELECT * FROM warehouses WHERE is_active = true";
      const params: any[] = [];
      if (!admin) { query += " AND company_id = $1"; params.push(user.company_id); }
      query += " ORDER BY name";
      const result = await pool.query(query, params);
      return ok(result.rows);
    } catch (e: any) { return err(e.message); }
  });
}

export async function POST(req: Request) {
  return withAuth(req, async (user) => {
    const { allowed, error } = await requirePermission(user, "create", "warehouses");
    if (!allowed) return NextResponse.json(error, { status: 403 });
    try {
      const body = await req.json();
      const { name, code, location, manager, phone } = body;
      if (!name || !code) return badRequest("Name and code are required");
      const company_id = user.company_id || 1;
      const result = await pool.query(
        "INSERT INTO warehouses (name, code, location, manager, phone, company_id) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
        [name, code, location, manager, phone, company_id]
      );
      return created(result.rows[0]);
    } catch (e: any) { return err(e.message); }
  });
}

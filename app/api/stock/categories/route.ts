import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { withAuth, ok, created, err, notFound, badRequest, deleted, isAdmin } from "@/lib/api-utils";
import { requirePermission } from "@/lib/permissions";

export async function GET(req: Request) {
  return withAuth(req, async (user) => {
    const { allowed, error } = await requirePermission(user, "view", "item_categories");
    if (!allowed) return NextResponse.json(error, { status: 403 });
    const admin = isAdmin(user);
    try {
      let query = `
        SELECT c.*, (SELECT COUNT(*) FROM items WHERE category_id = c.id AND i.company_id = c.company_id AND is_active = true) as item_count
        FROM item_categories c WHERE c.is_active = true
      `;
      const params: any[] = [];
      if (!admin) { query += ` AND c.company_id = $1`; params.push(user.company_id); }
      query += ` ORDER BY c.name`;
      const result = await pool.query(query, params);
      return ok(result.rows);
    } catch (e: any) { return err(e.message); }
  });
}

export async function POST(req: Request) {
  return withAuth(req, async (user) => {
    const { allowed, error } = await requirePermission(user, "create", "item_categories");
    if (!allowed) return NextResponse.json(error, { status: 403 });
    try {
      const body = await req.json();
      const { name, description } = body;
      if (!name) return badRequest("Name is required");
      const company_id = user.company_id || 1;
      const result = await pool.query(
        "INSERT INTO item_categories (name, description, company_id) VALUES ($1,$2,$3) RETURNING *",
        [name, description, company_id]
      );
      return created(result.rows[0]);
    } catch (e: any) { return err(e.message); }
  });
}

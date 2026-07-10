import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { withAuth, ok, created, err, notFound, badRequest, deleted, isAdmin } from "@/lib/api-utils";
import { requirePermission } from "@/lib/permissions";

export async function GET(req: Request) {
  return withAuth(req, async (user) => {
    const { allowed, error } = await requirePermission(user, "view", "items");
    if (!allowed) return NextResponse.json(error, { status: 403 });
    const admin = isAdmin(user);
    try {
      const { searchParams } = new URL(req.url);
      const cat = searchParams.get("category_id");
      let query = `
        SELECT i.*, ic.name as category_name,
          COALESCE((SELECT SUM(sb.quantity) FROM stock_balances sb WHERE sb.item_id = i.id), 0) as total_stock
        FROM items i
        LEFT JOIN item_categories ic ON i.category_id = ic.id
        WHERE i.is_active = true
      `;
      const params: any[] = [];
      let idx = 1;
      if (!admin) { query += ` AND i.company_id = $${idx++}`; params.push(user.company_id); }
      if (cat) { query += ` AND i.category_id = $${idx++}`; params.push(cat); }
      query += ` ORDER BY i.name`;
      const result = await pool.query(query, params);
      return ok(result.rows);
    } catch (e: any) { return err(e.message); }
  });
}

export async function POST(req: Request) {
  return withAuth(req, async (user) => {
    const { allowed, error } = await requirePermission(user, "create", "items");
    if (!allowed) return NextResponse.json(error, { status: 403 });
    try {
      const body = await req.json();
      const { code, name, description, category_id, unit, cost_price, selling_price, reorder_level } = body;
      if (!code || !name) return badRequest("Code and name are required");
      const company_id = user.company_id || 1;
      const result = await pool.query(
        `INSERT INTO items (code, name, description, category_id, unit, cost_price, selling_price, reorder_level, company_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
        [code, name, description, category_id, unit, cost_price, selling_price, reorder_level, company_id]
      );
      return created(result.rows[0]);
    } catch (e: any) { return err(e.message); }
  });
}

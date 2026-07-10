import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { withAuth, ok, created, err, notFound, badRequest, deleted, isAdmin } from "@/lib/api-utils";
import { requirePermission } from "@/lib/permissions";

export async function GET(req: Request) {
  return withAuth(req, async (user) => {
    const { allowed, error } = await requirePermission(user, "view", "stock_movements");
    if (!allowed) return NextResponse.json(error, { status: 403 });
    const admin = isAdmin(user);
    try {
      const { searchParams } = new URL(req.url);
      const limit = searchParams.get("limit") || "50";
      let query = `
        SELECT sm.*, i.name as item_name, i.code as item_code, w.name as warehouse_name
        FROM stock_movements sm
        LEFT JOIN items i ON sm.item_id = i.id
        LEFT JOIN warehouses w ON sm.warehouse_id = w.id
      `;
      const params: any[] = [];
      let idx = 1;
      if (!admin) { query += ` WHERE sm.company_id = $${idx++}`; params.push(user.company_id); }
      query += ` ORDER BY sm.created_at DESC LIMIT $${idx}`;
      params.push(limit);
      const result = await pool.query(query, params);
      return ok(result.rows);
    } catch (e: any) { return err(e.message); }
  });
}

export async function POST(req: Request) {
  return withAuth(req, async (user) => {
    const { allowed, error } = await requirePermission(user, "create", "stock_movements");
    if (!allowed) return NextResponse.json(error, { status: 403 });
    try {
      const body = await req.json();
      const { item_id, warehouse_id, movement_type, quantity, reference_type, reference_id, notes } = body;
      if (!item_id || !warehouse_id || !movement_type || !quantity) {
        return badRequest("item_id, warehouse_id, movement_type, quantity are required");
      }

      const company_id = user.company_id || 1;

      const result = await pool.query(
        `INSERT INTO stock_movements (item_id, warehouse_id, movement_type, quantity, reference_type, reference_id, notes, created_by, company_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
        [item_id, warehouse_id, movement_type, quantity, reference_type, reference_id, notes, user.id, company_id]
      );

      const sign = movement_type === 'in' || movement_type === 'transfer_in' ? '+' : '-';
      await pool.query(`
        INSERT INTO stock_balances (item_id, warehouse_id, quantity, company_id)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (item_id, warehouse_id)
        DO UPDATE SET quantity = stock_balances.quantity ${sign} $3
      `, [item_id, warehouse_id, quantity, company_id]);

      return created(result.rows[0]);
    } catch (e: any) { return err(e.message); }
  });
}

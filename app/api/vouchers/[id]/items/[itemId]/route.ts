import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getAuthUser, unauthorized } from "@/lib/auth";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string; itemId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();

  const { id, itemId } = await params;

  try {
    const { payroll_item_id, description, quantity, unit_price } = await req.json();

    const result = await pool.query(
      `UPDATE voucher_items SET payroll_item_id = $1, description = $2, quantity = $3, unit_price = $4
       WHERE id = $5 AND voucher_id = $6 RETURNING *`,
      [payroll_item_id, description, quantity, unit_price, itemId, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Voucher item not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string; itemId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();

  const { id, itemId } = await params;

  try {
    await pool.query("DELETE FROM voucher_items WHERE id = $1 AND voucher_id = $2", [itemId, id]);
    return NextResponse.json({ message: "Voucher item deleted" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

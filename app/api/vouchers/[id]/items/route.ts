import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getAuthUser, unauthorized } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();

  const { id } = await params;

  try {
    const result = await pool.query(`
      SELECT vi.*, pi.name as payroll_item_name, pi.code as payroll_item_code
      FROM voucher_items vi
      LEFT JOIN payroll_items pi ON vi.payroll_item_id = pi.id
      WHERE vi.voucher_id = $1
      ORDER BY vi.id
    `, [id]);

    return NextResponse.json(result.rows);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();

  const { id } = await params;

  try {
    const { payroll_item_id, description, quantity, unit_price } = await req.json();

    const result = await pool.query(
      `INSERT INTO voucher_items (voucher_id, payroll_item_id, description, quantity, unit_price)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [id, payroll_item_id, description, quantity, unit_price]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

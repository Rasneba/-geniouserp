import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getAuthUser, unauthorized } from "@/lib/auth";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string; bankId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();

  const { id, bankId } = await params;
  const { bank_name, account_number, account_holder, branch, is_active } = await req.json();

  try {
    const result = await pool.query(
      `UPDATE employee_banks SET bank_name = $1, account_number = $2, account_holder = $3,
       branch = $4, is_active = $5 WHERE id = $6 AND employee_id = $7 RETURNING *`,
      [bank_name, account_number, account_holder, branch, is_active, bankId, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Bank record not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string; bankId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();

  const { id, bankId } = await params;

  try {
    const result = await pool.query(
      "DELETE FROM employee_banks WHERE id = $1 AND employee_id = $2 RETURNING *",
      [bankId, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Bank record not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Bank record deleted" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

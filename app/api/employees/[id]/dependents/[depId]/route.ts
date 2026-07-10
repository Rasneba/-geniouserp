import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getAuthUser, unauthorized } from "@/lib/auth";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string; depId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();

  const { id, depId } = await params;
  const { full_name, relationship, date_of_birth, phone } = await req.json();

  try {
    const result = await pool.query(
      `UPDATE employee_dependents SET full_name = $1, relationship = $2,
       date_of_birth = $3, phone = $4 WHERE id = $5 AND employee_id = $6 RETURNING *`,
      [full_name, relationship, date_of_birth, phone, depId, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Dependent not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string; depId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();

  const { id, depId } = await params;

  try {
    const result = await pool.query(
      "DELETE FROM employee_dependents WHERE id = $1 AND employee_id = $2 RETURNING *",
      [depId, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Dependent not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Dependent deleted" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

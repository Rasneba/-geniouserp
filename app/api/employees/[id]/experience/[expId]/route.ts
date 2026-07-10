import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getAuthUser, unauthorized } from "@/lib/auth";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string; expId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();

  const { id, expId } = await params;
  const { company, position, start_date, end_date, reason_leaving } = await req.json();

  try {
    const result = await pool.query(
      `UPDATE employee_work_experience SET company = $1, position = $2,
       start_date = $3, end_date = $4, reason_leaving = $5
       WHERE id = $6 AND employee_id = $7 RETURNING *`,
      [company, position, start_date, end_date, reason_leaving, expId, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Experience record not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string; expId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();

  const { id, expId } = await params;

  try {
    const result = await pool.query(
      "DELETE FROM employee_work_experience WHERE id = $1 AND employee_id = $2 RETURNING *",
      [expId, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Experience record not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Experience record deleted" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

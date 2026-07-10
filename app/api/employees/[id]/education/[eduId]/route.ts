import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getAuthUser, unauthorized } from "@/lib/auth";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string; eduId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();

  const { id, eduId } = await params;
  const { institution, degree, field_of_study, start_date, end_date, grade } = await req.json();
  const clean = (v: any) => (v === "" || v === undefined ? null : v);

  try {
    const result = await pool.query(
      `UPDATE employee_education SET institution = $1, degree = $2, field_of_study = $3,
       start_date = $4, end_date = $5, grade = $6 WHERE id = $7 AND employee_id = $8 RETURNING *`,
      [institution, degree, field_of_study, clean(start_date), clean(end_date), clean(grade), eduId, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Education record not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string; eduId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();

  const { id, eduId } = await params;

  try {
    const result = await pool.query(
      "DELETE FROM employee_education WHERE id = $1 AND employee_id = $2 RETURNING *",
      [eduId, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Education record not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Education record deleted" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

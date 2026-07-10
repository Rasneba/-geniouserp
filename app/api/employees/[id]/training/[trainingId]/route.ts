import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getAuthUser, unauthorized } from "@/lib/auth";

async function verifyEmployeeCompany(employeeId: number, user: any): Promise<boolean> {
  if (user.role === "super_admin") return true;
  const result = await pool.query(`SELECT company_id FROM employees WHERE id = $1`, [employeeId]);
  if (result.rows.length === 0) return false;
  return result.rows[0].company_id === user.company_id;
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string; trainingId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();

  const { id, trainingId } = await params;

  if (!(await verifyEmployeeCompany(Number(id), user))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM employee_training WHERE id = $1 AND employee_id = $2",
      [trainingId, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Training record not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string; trainingId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();

  const { id, trainingId } = await params;

  if (!(await verifyEmployeeCompany(Number(id), user))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { course_name, institution, start_date, end_date, duration_days, certificate, status, notes } = await req.json();

  try {
    const result = await pool.query(
      `UPDATE employee_training SET course_name = $1, institution = $2, start_date = $3, end_date = $4,
       duration_days = $5, certificate = $6, status = $7, notes = $8 WHERE id = $9 AND employee_id = $10 RETURNING *`,
      [course_name, institution || null, start_date || null, end_date || null, duration_days || null, certificate || null, status, notes || null, trainingId, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Training record not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string; trainingId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();

  const { id, trainingId } = await params;

  if (!(await verifyEmployeeCompany(Number(id), user))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const result = await pool.query(
      "DELETE FROM employee_training WHERE id = $1 AND employee_id = $2 RETURNING *",
      [trainingId, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Training record not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Training record deleted" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

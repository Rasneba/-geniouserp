import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getAuthUser, unauthorized } from "@/lib/auth";

async function verifyEmployeeCompany(employeeId: number, user: any): Promise<boolean> {
  if (user.role === "super_admin") return true;
  const result = await pool.query(`SELECT company_id FROM employees WHERE id = $1`, [employeeId]);
  if (result.rows.length === 0) return false;
  return result.rows[0].company_id === user.company_id;
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();

  const { id } = await params;

  if (!(await verifyEmployeeCompany(Number(id), user))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM employee_education WHERE employee_id = $1 ORDER BY id",
      [id]
    );
    return NextResponse.json(result.rows);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();

  const { id } = await params;

  if (!(await verifyEmployeeCompany(Number(id), user))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { institution, degree, field_of_study, start_date, end_date, grade } = await req.json();

  try {
    const result = await pool.query(
      `INSERT INTO employee_education (employee_id, institution, degree, field_of_study, start_date, end_date, grade)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [id, institution, degree, field_of_study, start_date, end_date, grade]
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

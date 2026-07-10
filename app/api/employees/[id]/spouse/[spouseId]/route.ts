import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getAuthUser, unauthorized } from "@/lib/auth";

async function verifyEmployeeCompany(employeeId: number, user: any): Promise<boolean> {
  if (user.role === "super_admin") return true;
  const result = await pool.query(`SELECT company_id FROM employees WHERE id = $1`, [employeeId]);
  if (result.rows.length === 0) return false;
  return result.rows[0].company_id === user.company_id;
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string; spouseId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();

  const { id, spouseId } = await params;

  if (!(await verifyEmployeeCompany(Number(id), user))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM employee_spouse WHERE id = $1 AND employee_id = $2",
      [spouseId, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Spouse record not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string; spouseId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();

  const { id, spouseId } = await params;

  if (!(await verifyEmployeeCompany(Number(id), user))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { full_name, date_of_birth, phone, occupation, employer, national_id, is_dependent } = await req.json();

  try {
    const result = await pool.query(
      `UPDATE employee_spouse SET full_name = $1, date_of_birth = $2, phone = $3, occupation = $4,
       employer = $5, national_id = $6, is_dependent = $7 WHERE id = $8 AND employee_id = $9 RETURNING *`,
      [full_name, date_of_birth || null, phone || null, occupation || null, employer || null, national_id || null, is_dependent, spouseId, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Spouse record not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string; spouseId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();

  const { id, spouseId } = await params;

  if (!(await verifyEmployeeCompany(Number(id), user))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const result = await pool.query(
      "DELETE FROM employee_spouse WHERE id = $1 AND employee_id = $2 RETURNING *",
      [spouseId, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Spouse record not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Spouse record deleted" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

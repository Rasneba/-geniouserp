import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { buildCompanyFilter } from "@/lib/api-utils";
import { getAuthUser, unauthorized } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();

  const { id } = await params;
  const isSuper = user.role === "super_admin";

  try {
    let query = `
      SELECT p.*, e.code as employee_code,
        e.first_name || ' ' || e.last_name as employee_name
      FROM payroll p
      JOIN employees e ON p.employee_id = e.id
      WHERE p.id = $1`;
    const queryParams: any[] = [id];
    if (!isSuper) {
      query += ` AND e.company_id = $2`;
      queryParams.push(user.company_id);
    }
    const result = await pool.query(query, queryParams);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Payroll record not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();

  const { id } = await params;

  try {
    const isSuper = user.role === "super_admin";
    const { status } = await req.json();

    if (!["draft", "processed", "paid", "cancelled"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    let checkQuery = `
      SELECT 1 FROM payroll p
      JOIN employees e ON p.employee_id = e.id
      WHERE p.id = $1`;
    const checkParams: any[] = [id];
    if (!isSuper) {
      checkQuery += ` AND e.company_id = $2`;
      checkParams.push(user.company_id);
    }
    const checkRes = await pool.query(checkQuery, checkParams);
    if (checkRes.rows.length === 0) {
      return NextResponse.json({ error: "Payroll record not found" }, { status: 404 });
    }

    const result = await pool.query(
      `UPDATE payroll SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Payroll record not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

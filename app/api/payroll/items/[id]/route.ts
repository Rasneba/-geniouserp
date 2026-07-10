import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { buildCompanyFilter } from "@/lib/api-utils";
import { getAuthUser, unauthorized } from "@/lib/auth";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  const { id } = await params;
  try {
    const isSuper = user.role === "super_admin";
    const { other_deductions, overtime, allowances } = await req.json();

    let itemQuery = `
      SELECT pi.* FROM payroll_items pi
      JOIN employees e ON pi.employee_id = e.id
      WHERE pi.id = $1`;
    const itemParams: any[] = [id];
    if (!isSuper) {
      itemQuery += ` AND e.company_id = $2`;
      itemParams.push(user.company_id);
    }
    const item = await pool.query(itemQuery, itemParams);
    if (item.rows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const pi = item.rows[0];
    const newOvertime = overtime ?? parseFloat(pi.overtime);
    const newAllowances = allowances ?? parseFloat(pi.allowances);
    const newOtherDed = other_deductions ?? parseFloat(pi.other_deductions);
    const grossPay = parseFloat(pi.basic_salary) + newOvertime + newAllowances;
    const taxableIncome = grossPay - parseFloat(pi.employee_pension);
    const netPay = grossPay - parseFloat(pi.employee_pension) - parseFloat(pi.paye_tax) - newOtherDed;

    const result = await pool.query(
      `UPDATE payroll_items SET overtime = $1, allowances = $2, gross_pay = $3,
       taxable_income = $4, other_deductions = $5, net_pay = $6 WHERE id = $7 RETURNING *`,
      [newOvertime, newAllowances, grossPay, taxableIncome, newOtherDed, netPay, id]
    );
    return NextResponse.json(result.rows[0]);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  const { id } = await params;
  const isSuper = user.role === "super_admin";
  try {
    let query = `
      SELECT pi.*, e.code as employee_code, e.first_name, e.middle_name, e.last_name,
              d.name as department_name, p.title as position_title
       FROM payroll_items pi
       JOIN employees e ON pi.employee_id = e.id
       LEFT JOIN departments d ON e.department_id = d.id
       LEFT JOIN positions p ON e.position_id = p.id
       WHERE pi.run_id = $1`;
    const queryParams: any[] = [id];
    if (!isSuper) {
      query += ` AND e.company_id = $2`;
      queryParams.push(user.company_id);
    }
    query += ` ORDER BY e.first_name`;
    const result = await pool.query(query, queryParams);
    return NextResponse.json(result.rows);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

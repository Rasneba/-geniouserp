import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { withAuth, ok, created, err, notFound, badRequest, deleted, isAdmin, buildCompanyFilter } from "@/lib/api-utils";
import { requirePermission } from "@/lib/permissions";

function calcEthiopianTax(basicSalary: number, transportAllowance: number, housingAllowance: number, positionAllowance: number, overtimeAmount: number, otherAllowances: number): { taxableIncome: number; incomeTax: number } {
  const totalAllowances = transportAllowance + housingAllowance + positionAllowance + overtimeAmount + otherAllowances;
  const taxableAllowances = transportAllowance > 0 ? Math.max(0, transportAllowance - Math.min(2200, 0.25 * basicSalary)) : totalAllowances;
  const taxableIncome = basicSalary + taxableAllowances;

  let incomeTax = 0;
  if (taxableIncome <= 2000) {
    incomeTax = 0;
  } else if (taxableIncome <= 4000) {
    incomeTax = taxableIncome * 0.15 - 300;
  } else if (taxableIncome <= 7000) {
    incomeTax = taxableIncome * 0.20 - 500;
  } else if (taxableIncome <= 10000) {
    incomeTax = taxableIncome * 0.25 - 850;
  } else if (taxableIncome <= 14000) {
    incomeTax = taxableIncome * 0.30 - 1350;
  } else {
    incomeTax = taxableIncome * 0.35 - 2050;
  }

  return { taxableIncome: Math.round(taxableIncome), incomeTax: Math.max(0, Math.round(incomeTax)) };
}

export async function GET(req: Request) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "view", "payroll");
    if (!allowed) return NextResponse.json({ error: "Permission denied" }, { status: 403 });

    const url = new URL(req.url);
    const employee_id = url.searchParams.get("employee_id");
    const status = url.searchParams.get("status");

    try {
      const isSuper = user.role === "super_admin";

      let query = `
        SELECT ep.*, e.code as employee_code,
          e.first_name || ' ' || e.last_name as employee_name
        FROM enhanced_payroll ep
        JOIN employees e ON ep.employee_id = e.id
        WHERE 1=1
      `;
      const params: any[] = [];
      let idx = 1;

      if (!isSuper) {
        query += ` AND e.company_id = $${idx}`;
        params.push(user.company_id);
        idx++;
      }

      if (employee_id) {
        query += ` AND ep.employee_id = $${idx}`;
        params.push(employee_id);
        idx++;
      }
      if (status) {
        query += ` AND ep.status = $${idx}`;
        params.push(status);
        idx++;
      }

      query += ` ORDER BY ep.created_at DESC`;

      const result = await pool.query(query, params);
      return ok(result.rows);
    } catch (e: any) {
      return err(e.message);
    }
  });
}

export async function POST(req: Request) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "create", "payroll");
    if (!allowed) return NextResponse.json({ error: "Permission denied" }, { status: 403 });

    try {
      const {
        employee_id, pay_period_start, pay_period_end,
        basic_salary, transport_allowance, housing_allowance,
        position_allowance, overtime_amount, other_allowances,
        other_deductions
      } = await req.json();

      const ta = transport_allowance || 0;
      const ha = housing_allowance || 0;
      const pa = position_allowance || 0;
      const oa = overtime_amount || 0;
      const oth = other_allowances || 0;
      const totalAllowances = ta + ha + pa + oa + oth;
      const od = other_deductions || 0;

      const { taxableIncome, incomeTax } = calcEthiopianTax(basic_salary, ta, ha, pa, oa, oth);
      const employeePension = Math.round(basic_salary * 0.07);
      const employerPension = Math.round(basic_salary * 0.11);
      const netPay = basic_salary + totalAllowances - incomeTax - employeePension - od;

      const result = await pool.query(
        `INSERT INTO enhanced_payroll
         (employee_id, pay_period_start, pay_period_end, basic_salary,
          transport_allowance, housing_allowance, position_allowance,
          overtime_amount, other_allowances, other_deductions,
          income_tax, employee_pension, employer_pension, net_pay, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`,
        [employee_id, pay_period_start, pay_period_end, basic_salary,
         ta, ha, pa, oa, oth, od,
         incomeTax, employeePension, employerPension, netPay, "processed"]
      );

      return created(result.rows[0]);
    } catch (e: any) {
      return err(e.message);
    }
  });
}

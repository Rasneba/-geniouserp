import pool from "@/lib/db";
import { withAuth, ok, err, notFound, badRequest } from "@/lib/api-utils";
import { buildCompanyFilter } from "@/lib/api-utils";
import { requirePermission } from "@/lib/permissions";

function calculatePAYE(taxableIncome: number): number {
  const brackets = [
    { min: 0, max: 600, rate: 0, deductible: 0 },
    { min: 600.01, max: 1650, rate: 0.10, deductible: 60 },
    { min: 1650.01, max: 3200, rate: 0.15, deductible: 142.5 },
    { min: 3200.01, max: 5250, rate: 0.20, deductible: 302.5 },
    { min: 5250.01, max: 7800, rate: 0.25, deductible: 565 },
    { min: 7800.01, max: 10900, rate: 0.30, deductible: 955 },
    { min: 10900.01, max: Infinity, rate: 0.35, deductible: 1500 },
  ];
  for (const b of brackets) {
    if (taxableIncome >= b.min && taxableIncome <= b.max) {
      return Math.round(taxableIncome * b.rate - b.deductible);
    }
  }
  return 0;
}

export async function POST(req: Request) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "create", "payroll");
    if (!allowed) return err("Permission denied", 403);

    try {
      const { period_id } = await req.json();

      const periodRes = await pool.query("SELECT * FROM payroll_periods WHERE id = $1", [period_id]);
      if (periodRes.rows.length === 0) {
        return notFound("Payroll period");
      }
      const period = periodRes.rows[0];
      if (period.status !== "draft") {
        return badRequest("Period already processed");
      }

      const pensionRes = await pool.query("SELECT * FROM pension_settings WHERE is_active = true ORDER BY id DESC LIMIT 1");
      const pension = pensionRes.rows[0] || { employee_rate: 0.07, employer_rate: 0.11 };

      const isSuper = user.role === "super_admin";
      let empQuery = "SELECT id, salary, taxable_allowances, pension_number FROM employees WHERE is_active = true AND salary IS NOT NULL";
      const empParams: any[] = [];
      if (!isSuper) {
        empQuery += ` AND company_id = $1`;
        empParams.push(user.company_id);
      }
      const empRes = await pool.query(empQuery, empParams);

      if (empRes.rows.length === 0) {
        return badRequest("No active employees with salary found");
      }

      const runRes = await pool.query(
        `INSERT INTO payroll_runs (period_id, processed_by, processed_at, status)
         VALUES ($1, $2, CURRENT_TIMESTAMP, 'processed') RETURNING *`,
        [period_id, user.id]
      );
      const run = runRes.rows[0];

      let totalGross = 0, totalPAYE = 0, totalEmpPension = 0, totalEmprPension = 0;
      let totalDed = 0, totalNet = 0;

      for (const emp of empRes.rows) {
        const basicSalary = parseFloat(emp.salary) || 0;
        const allowances = parseFloat(emp.taxable_allowances) || 0;

        const otRes = await pool.query(
          `SELECT COALESCE(SUM(amount), 0) as total_overtime
           FROM overtime_records
           WHERE employee_id = $1 AND status = 'approved'
             AND date >= $2 AND date <= $3`,
          [emp.id, period.start_date, period.end_date]
        );
        const overtimeAmount = parseFloat(otRes.rows[0].total_overtime) || 0;

        const leaveRes = await pool.query(
          `SELECT COALESCE(SUM(lr.total_days), 0) as total_leave_days
           FROM leave_requests lr
           WHERE lr.employee_id = $1 AND lr.status = 'approved'
             AND lr.start_date >= $2 AND lr.start_date <= $3
             AND lr.leave_type_id IN (SELECT id FROM leave_types WHERE is_paid = true)`,
          [emp.id, period.start_date, period.end_date]
        );
        const paidLeaveDays = parseFloat(leaveRes.rows[0].total_leave_days) || 0;

        const totalAllowances = allowances + overtimeAmount;
        const grossPay = basicSalary + totalAllowances;
        const employeePension = Math.round(basicSalary * parseFloat(pension.employee_rate));
        const taxableIncome = grossPay - employeePension;
        const payeTax = calculatePAYE(taxableIncome);
        const employerPension = Math.round(basicSalary * parseFloat(pension.employer_rate));
        const netPay = grossPay - employeePension - payeTax;

        const itemRes = await pool.query(
          `INSERT INTO payroll_items
           (run_id, employee_id, basic_salary, allowances, gross_pay, taxable_income,
            paye_tax, employee_pension, employer_pension, net_pay)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
          [run.id, emp.id, basicSalary, totalAllowances, grossPay, taxableIncome,
           payeTax, employeePension, employerPension, netPay]
        );
        const itemId = itemRes.rows[0].id;

        if (emp.pension_number) {
          await pool.query(
            `INSERT INTO pension_contributions
             (employee_id, payroll_item_id, period_id, employee_contribution, employer_contribution, total_contribution, contribution_date)
             VALUES ($1,$2,$3,$4,$5,$6,$7)`,
            [emp.id, itemId, period_id, employeePension, employerPension,
             employeePension + employerPension, period.end_date]
          );
        }

        if (overtimeAmount > 0) {
          const otCode = await generateVoucherCode("OTV");
          const otVoucher = await pool.query(
            `INSERT INTO vouchers (code, voucher_type, employee_id, status, total_amount, notes, prepared_by)
             VALUES ($1, 'OTV', $2, 'completed', $3, $4, $5) RETURNING id`,
            [otCode, emp.id, overtimeAmount, `Auto-generated for payroll period ${period.start_date} to ${period.end_date}`, user.id]
          );
          await pool.query(
            `INSERT INTO voucher_items (voucher_id, payroll_item_id, description, quantity, unit_price)
             VALUES ($1, $2, 'Overtime payment', 1, $3)`,
            [otVoucher.rows[0].id, itemId, overtimeAmount]
          );
        }

        if (paidLeaveDays > 0) {
          const lvCode = await generateVoucherCode("LV");
          const dailyRate = basicSalary / 30;
          const lvAmount = Math.round(dailyRate * paidLeaveDays);
          const lvVoucher = await pool.query(
            `INSERT INTO vouchers (code, voucher_type, employee_id, status, total_amount, notes, prepared_by)
             VALUES ($1, 'LV', $2, 'completed', $3, $4, $5) RETURNING id`,
            [lvCode, emp.id, lvAmount, `Auto-generated for ${paidLeaveDays} paid leave days in period ${period.start_date} to ${period.end_date}`, user.id]
          );
          await pool.query(
            `INSERT INTO voucher_items (voucher_id, payroll_item_id, description, quantity, unit_price)
             VALUES ($1, $2, $3, $4, $5)`,
            [lvVoucher.rows[0].id, itemId, `Paid leave (${paidLeaveDays} days)`, paidLeaveDays, dailyRate]
          );
        }

        totalGross += grossPay;
        totalPAYE += payeTax;
        totalEmpPension += employeePension;
        totalEmprPension += employerPension;
        totalNet += netPay;
      }

      await pool.query(
        `UPDATE payroll_runs SET
          total_gross = $1, total_paye = $2, total_employee_pension = $3,
          total_employer_pension = $4, total_deductions = $5, total_net = $6
         WHERE id = $7`,
        [totalGross, totalPAYE, totalEmpPension, totalEmprPension,
         totalPAYE + totalEmpPension, totalNet, run.id]
      );

      await pool.query(
        "UPDATE payroll_periods SET status = 'finalized', processed_by = $1, processed_at = CURRENT_TIMESTAMP WHERE id = $2",
        [user.id, period_id]
      );

      return ok({
        run_id: run.id,
        total_employees: empRes.rows.length,
        total_gross: totalGross,
        total_paye: totalPAYE,
        total_employee_pension: totalEmpPension,
        total_employer_pension: totalEmprPension,
        total_net: totalNet,
      });
    } catch (e: any) {
      return err(e.message);
    }
  });
}

async function generateVoucherCode(type: string): Promise<string> {
  const result = await pool.query(
    `SELECT COUNT(*) + 1 as next FROM vouchers WHERE voucher_type = $1`,
    [type]
  );
  const seq = String(result.rows[0].next).padStart(4, "0");
  return `${type}${seq}`;
}

import pool from "@/lib/db";
import { withAuth, ok, created, err } from "@/lib/api-utils";
import { buildCompanyFilter } from "@/lib/api-utils";
import { requirePermission } from "@/lib/permissions";

export async function GET(req: Request) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "view", "payroll");
    if (!allowed) return err("Permission denied", 403);

    const url = new URL(req.url);
    const employee_id = url.searchParams.get("employee_id");
    const status = url.searchParams.get("status");

    try {
      const isSuper = user.role === "super_admin";

      let query = `
        SELECT p.*, e.code as employee_code,
          e.first_name || ' ' || e.last_name as employee_name
        FROM payroll p
        JOIN employees e ON p.employee_id = e.id
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
        query += ` AND p.employee_id = $${idx}`;
        params.push(employee_id);
        idx++;
      }
      if (status) {
        query += ` AND p.status = $${idx}`;
        params.push(status);
        idx++;
      }

      query += ` ORDER BY p.created_at DESC`;

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
    if (!allowed) return err("Permission denied", 403);

    try {
      const { employee_id, pay_period_start, pay_period_end, basic_salary, allowances, deductions, net_pay } = await req.json();

      const result = await pool.query(
        `INSERT INTO payroll (employee_id, pay_period_start, pay_period_end, basic_salary, allowances, deductions, net_pay, status, processed_by, processed_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'processed', $8, CURRENT_TIMESTAMP) RETURNING *`,
        [employee_id, pay_period_start, pay_period_end, basic_salary, allowances || 0, deductions || 0, net_pay, user.id]
      );

      return created(result.rows[0]);
    } catch (e: any) {
      return err(e.message);
    }
  });
}

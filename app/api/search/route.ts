import pool from "@/lib/db";
import { withAuth, ok, err, badRequest } from "@/lib/api-utils";
import { requirePermission } from "@/lib/permissions";

export async function GET(req: Request) {
  return withAuth(req, async (user) => {
    requirePermission(user, "view", "employees");

    const url = new URL(req.url);
    const q = url.searchParams.get("q");

    if (!q || q.trim().length === 0) {
      return badRequest("Query parameter q is required");
    }

    const query = `%${q}%`;

    try {
      const [employees, vouchers, departments] = await Promise.all([
        pool.query(`
          SELECT e.code, e.first_name, e.last_name, d.name as department_name
          FROM employees e
          LEFT JOIN departments d ON e.department_id = d.id
          WHERE e.first_name ILIKE $1 OR e.last_name ILIKE $1 OR e.code ILIKE $1
          LIMIT 5
        `, [query]),
        pool.query(`
          SELECT v.code as voucher_no, v.voucher_type as type,
            e.first_name || ' ' || e.last_name as employee_name
          FROM vouchers v
          LEFT JOIN employees e ON v.employee_id = e.id
          WHERE v.code ILIKE $1 OR v.voucher_type ILIKE $1
          LIMIT 5
        `, [query]),
        pool.query(`
          SELECT name
          FROM departments
          WHERE name ILIKE $1
          LIMIT 5
        `, [query]),
      ]);

      return ok({
        employees: employees.rows,
        vouchers: vouchers.rows,
        departments: departments.rows,
      });
    } catch (e: any) {
      return err(e.message);
    }
  });
}

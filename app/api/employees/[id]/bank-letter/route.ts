import pool from "@/lib/db";
import { withAuth, ok, err, notFound, isAdmin } from "@/lib/api-utils";
import { requirePermission } from "@/lib/permissions";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "view", "employees");
    if (!allowed) return err("Permission denied", 403);

    const { id } = await params;
    const admin = isAdmin(user);

    try {
      let query = `
        SELECT e.code, e.first_name, e.middle_name, e.last_name, e.gender,
          e.phone, e.email, e.address, e.hire_date, e.salary, e.tin,
          e.position_title, e.department_name, e.branch, e.contract_end_date,
          e.employment_stage_name,
          d.name as department_name_full
        FROM employees e
        LEFT JOIN departments d ON e.department_id = d.id
        WHERE e.id = $1
      `;
      const queryParams: any[] = [id];
      if (!admin) {
        query += ` AND e.company_id = $2`;
        queryParams.push(user.company_id);
      }

      const result = await pool.query(query, queryParams);
      if (result.rows.length === 0) return notFound("Employee");
      return ok(result.rows[0]);
    } catch (e: any) {
      return err(e.message);
    }
  });
}

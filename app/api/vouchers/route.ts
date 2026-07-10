import pool from "@/lib/db";
import { withAuth, ok, created, err, badRequest, isAdmin } from "@/lib/api-utils";
import { requirePermission } from "@/lib/permissions";
import { generateSequentialId } from "@/lib/id-generator";

export async function GET(req: Request) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "view", "vouchers");
    if (!allowed) return err("Permission denied", 403);

    const admin = isAdmin(user);
    const url = new URL(req.url);
    const status = url.searchParams.get("status");

    try {
      let query = `
        SELECT v.*,
          e.first_name || ' ' || e.last_name as employee_name,
          u.name as prepared_by_name
        FROM vouchers v
        JOIN employees e ON v.employee_id = e.id
        LEFT JOIN users u ON v.prepared_by = u.id
        WHERE 1=1
      `;
      const params: any[] = [];
      let idx = 1;

      if (!admin) {
        query += ` AND e.company_id = $${idx}`;
        params.push(user.company_id);
        idx++;
      }
      if (status) {
        query += ` AND v.status = $${idx}`;
        params.push(status);
        idx++;
      }

      query += ` ORDER BY v.created_at DESC`;

      const result = await pool.query(query, params);
      return ok(result.rows);
    } catch (e: any) {
      return err(e.message);
    }
  });
}

export async function POST(req: Request) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "create", "vouchers");
    if (!allowed) return err("Permission denied", 403);

    try {
      const { voucher_type, employee_id, notes, total_amount } = await req.json();
      if (!/^[A-Z]+$/.test(voucher_type)) return badRequest("Invalid voucher type");

      const code = await generateSequentialId("vouchers", "code", voucher_type);

      const result = await pool.query(
        `INSERT INTO vouchers (code, voucher_type, employee_id, status, notes, total_amount, prepared_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [code, voucher_type, employee_id, "prepared", notes, total_amount, user.id]
      );

      return created(result.rows[0]);
    } catch (e: any) {
      return err(e.message);
    }
  });
}

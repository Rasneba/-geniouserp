import pool from "@/lib/db";
import { withAuth, ok, err, notFound, badRequest, deleted } from "@/lib/api-utils";
import { requirePermission } from "@/lib/permissions";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "view", "vouchers");
    if (!allowed) return err("Permission denied", 403);

    const { id } = await params;

    try {
      const voucherRes = await pool.query(`
        SELECT v.*,
          e.first_name || ' ' || e.last_name as employee_name,
          u.name as prepared_by_name
        FROM vouchers v
        JOIN employees e ON v.employee_id = e.id
        LEFT JOIN users u ON v.prepared_by = u.id
        WHERE v.id = $1
      `, [id]);

      if (voucherRes.rows.length === 0) {
        return notFound("Voucher");
      }

      const itemsRes = await pool.query(`
        SELECT vi.*, pi.name as payroll_item_name, pi.code as payroll_item_code
        FROM voucher_items vi
        LEFT JOIN payroll_items pi ON vi.payroll_item_id = pi.id
        WHERE vi.voucher_id = $1
        ORDER BY vi.id
      `, [id]);

      return ok({ ...voucherRes.rows[0], items: itemsRes.rows });
    } catch (e: any) {
      return err(e.message);
    }
  });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "edit", "vouchers");
    if (!allowed) return err("Permission denied", 403);

    const { id } = await params;

    try {
      const { status } = await req.json();

      if (!["approved", "void"].includes(status)) {
        return badRequest("Invalid status");
      }

      let query: string;
      const values: any[] = [status, id];

      if (status === "approved") {
        query = `UPDATE vouchers SET status = $1, approved_by = $2, approved_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *`;
        values.splice(1, 0, user.id);
      } else {
        query = `UPDATE vouchers SET status = $1 WHERE id = $2 RETURNING *`;
      }

      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        return notFound("Voucher");
      }

      return ok(result.rows[0]);
    } catch (e: any) {
      return err(e.message);
    }
  });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "delete", "vouchers");
    if (!allowed) return err("Permission denied", 403);

    const { id } = await params;

    try {
      await pool.query("DELETE FROM voucher_items WHERE voucher_id = $1", [id]);
      await pool.query("DELETE FROM vouchers WHERE id = $1", [id]);
      return deleted("Voucher");
    } catch (e: any) {
      return err(e.message);
    }
  });
}

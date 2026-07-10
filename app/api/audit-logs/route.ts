import pool from "@/lib/db";
import { withAuth, ok, err } from "@/lib/api-utils";
import { requirePermission } from "@/lib/permissions";

export async function GET(req: Request) {
  return withAuth(req, async (user) => {
    requirePermission(user, "view", "audit_logs");

    try {
      const result = await pool.query(`
        SELECT al.*, u.name as user_name
        FROM audit_logs al
        LEFT JOIN users u ON al.user_id = u.id
        ORDER BY al.created_at DESC
        LIMIT 100
      `);
      return ok(result.rows);
    } catch (e: any) {
      return err(e.message);
    }
  });
}

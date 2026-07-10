import { withAuth, ok, created, err } from "@/lib/api-utils";
import { requirePermission } from "@/lib/permissions";
import pool from "@/lib/db";

export async function GET(req: Request) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "view", "leave_types");
    if (!allowed) return err("Permission denied", 403);
    try {
      const result = await pool.query(
        "SELECT * FROM leave_types WHERE is_active = true ORDER BY name"
      );
      return ok(result.rows);
    } catch (e: any) { return err(e.message); }
  });
}

export async function POST(req: Request) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "create", "leave_types");
    if (!allowed) return err("Permission denied", 403);
    const isSuper = user.role === "super_admin";
    const isAdmin = user.role === "admin";
    if (!isSuper && !isAdmin) return err("Only admin can create leave types", 403);
    try {
      const { name, code, days_per_year, is_paid } = await req.json();
      const result = await pool.query(
        `INSERT INTO leave_types (name, code, days_per_year, is_paid)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [name, code, days_per_year ?? 0, is_paid ?? true]
      );
      return created(result.rows[0]);
    } catch (e: any) { return err(e.message); }
  });
}

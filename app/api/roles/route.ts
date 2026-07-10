import pool from "@/lib/db";
import { withAuth, ok, err, badRequest, created } from "@/lib/api-utils";
import { requirePermission } from "@/lib/permissions";

export async function GET(req: Request) {
  return withAuth(req, async (user) => {
    const perm = await requirePermission(user, "view", "roles");
    if (!perm.allowed) return err("Permission denied", 403);

    try {
      // Ensure guest role exists
      const existing = await pool.query(`SELECT id FROM roles WHERE name = 'guest'`);
      if (existing.rows.length === 0) {
        await pool.query(
          `INSERT INTO roles (name, description) VALUES ('guest', 'Guest - Limited access based on configured permissions') ON CONFLICT (name) DO NOTHING`
        );
      }

      const result = await pool.query(
        `SELECT r.*,
           (SELECT COUNT(*) FROM role_permissions WHERE role_id = r.id) as permission_count
         FROM roles r
         ORDER BY r.name`
      );
      return ok(result.rows);
    } catch (e: any) {
      console.error("GET /api/roles error:", e);
      return ok([]);
    }
  });
}

export async function POST(req: Request) {
  return withAuth(req, async (user) => {
    const perm = await requirePermission(user, "create", "roles");
    if (!perm.allowed) return err("Permission denied", 403);

    try {
      const { name, description, company_id } = await req.json();
      if (!name) {
        return badRequest("Role name is required");
      }

      const isSuper = user.role === "super_admin";
      const result = await pool.query(
        `INSERT INTO roles (name, description, company_id)
         VALUES ($1, $2, $3) RETURNING *`,
        [name, description, isSuper ? (company_id || null) : user.company_id]
      );

      return created(result.rows[0]);
    } catch (e: any) {
      if (e.code === "23505") {
        return err("Role name already exists", 409);
      }
      return err(e.message);
    }
  });
}

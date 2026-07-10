import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { withAuth, ok, created, err, isAdmin } from "@/lib/api-utils";
import { requirePermission } from "@/lib/permissions";

export async function GET(req: Request) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "view", "positions");
    if (!allowed) return NextResponse.json({ error: "Permission denied" }, { status: 403 });

    const admin = isAdmin(user);
    try {
      let query = `
        SELECT p.*, d.name as department_name
        FROM positions p
        LEFT JOIN departments d ON p.department_id = d.id
      `;
      const params: any[] = [];
      if (!admin) {
        query += ` WHERE p.company_id = $1`;
        params.push(user.company_id);
      }
      query += ` ORDER BY p.title`;
      const result = await pool.query(query, params);
      return ok(result.rows);
    } catch (e: any) {
      return err(e.message);
    }
  });
}

export async function POST(req: Request) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "create", "positions");
    if (!allowed) return NextResponse.json({ error: "Permission denied" }, { status: 403 });

    try {
      const { title, department_id, description, min_salary, max_salary } = await req.json();
      const result = await pool.query(
        `INSERT INTO positions (title, department_id, description, min_salary, max_salary, company_id)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [title, department_id, description, min_salary, max_salary, user.company_id]
      );
      return created(result.rows[0]);
    } catch (e: any) {
      return err(e.message);
    }
  });
}

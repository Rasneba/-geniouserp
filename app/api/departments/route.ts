import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { withAuth, ok, created, err, isAdmin } from "@/lib/api-utils";
import { requirePermission } from "@/lib/permissions";

export async function GET(req: Request) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "view", "departments");
    if (!allowed) return NextResponse.json({ error: "Permission denied" }, { status: 403 });

    const admin = isAdmin(user);
    try {
      let query = `
        SELECT d.*, e.first_name || ' ' || e.last_name as manager_name,
          (SELECT COUNT(*) FROM employees WHERE department_id = d.id) as employee_count
        FROM departments d
        LEFT JOIN employees e ON d.manager_id = e.id
      `;
      const params: any[] = [];
      if (!admin) {
        query += ` WHERE d.company_id = $1`;
        params.push(user.company_id);
      }
      query += ` ORDER BY d.name`;
      const result = await pool.query(query, params);
      return ok(result.rows);
    } catch (e: any) {
      return err(e.message);
    }
  });
}

export async function POST(req: Request) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "create", "departments");
    if (!allowed) return NextResponse.json({ error: "Permission denied" }, { status: 403 });

    try {
      const { name, code, description, manager_id } = await req.json();
      const result = await pool.query(
        `INSERT INTO departments (name, code, description, manager_id, company_id)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [name, code, description, manager_id, user.company_id]
      );
      return created(result.rows[0]);
    } catch (e: any) {
      return err(e.message);
    }
  });
}

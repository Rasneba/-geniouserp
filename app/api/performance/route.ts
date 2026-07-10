import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { withAuth, ok, created, err, badRequest, isAdmin } from "@/lib/api-utils";
import { requirePermission } from "@/lib/permissions";

export async function GET(req: Request) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "view", "performance");
    if (!allowed) return NextResponse.json({ error: "Permission denied" }, { status: 403 });

    const admin = isAdmin(user);
    const url = new URL(req.url);
    const employee_id = url.searchParams.get("employee_id");

    try {
      let query = `
        SELECT pe.*,
          e.first_name || ' ' || e.last_name as employee_name,
          r.first_name || ' ' || r.last_name as reviewer_name
        FROM performance_evaluations pe
        JOIN employees e ON pe.employee_id = e.id
        LEFT JOIN employees r ON pe.reviewer_id = r.id
        WHERE 1=1
      `;
      const params: any[] = [];
      let idx = 1;

      if (!admin) {
        query += ` AND e.company_id = $${idx}`;
        params.push(user.company_id);
        idx++;
      }
      if (employee_id) {
        query += ` AND pe.employee_id = $${idx}`;
        params.push(employee_id);
        idx++;
      }

      query += ` ORDER BY pe.created_at DESC`;

      const result = await pool.query(query, params);
      return ok(result.rows);
    } catch (e: any) {
      return err(e.message);
    }
  });
}

export async function POST(req: Request) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "create", "performance");
    if (!allowed) return NextResponse.json({ error: "Permission denied" }, { status: 403 });

    try {
      const { employee_id, reviewer_id, evaluation_date, rating, comments, strengths, improvements } = await req.json();

      if (rating < 1 || rating > 5) return badRequest("Rating must be between 1 and 5");

      const result = await pool.query(
        `INSERT INTO performance_evaluations (employee_id, reviewer_id, evaluation_date, rating, comments, strengths, improvements)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [employee_id, reviewer_id, evaluation_date, rating, comments, strengths, improvements]
      );

      return created(result.rows[0]);
    } catch (e: any) {
      return err(e.message);
    }
  });
}

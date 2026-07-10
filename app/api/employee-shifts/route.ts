import { NextResponse } from "next/server";
import { withAuth, ok, created, err, notFound } from "@/lib/api-utils";
import { requirePermission } from "@/lib/permissions";
import pool from "@/lib/db";

export async function GET(req: Request) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "view", "attendance");
    if (!allowed) return NextResponse.json({ error: "Permission denied" }, { status: 403 });

    const isSuper = user.role === "super_admin";
    const params: any[] = [];
    let idx = 1;

    try {
      let query = `
        SELECT es.*,
          e.first_name || ' ' || e.last_name as employee_name, e.code as employee_code,
          s.name as shift_name, s.start_time as shift_start, s.end_time as shift_end
        FROM employee_shifts es
        JOIN employees e ON es.employee_id = e.id
        JOIN shifts s ON es.shift_id = s.id
        WHERE 1=1
      `;
      if (!isSuper) {
        query += ` AND e.company_id = $${idx++}`;
        params.push(user.company_id);
      }
      query += ` ORDER BY es.start_date DESC`;

      const result = await pool.query(query, params);
      return ok(result.rows);
    } catch (e: any) { return err(e.message); }
  });
}

export async function POST(req: Request) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "create", "attendance");
    if (!allowed) return NextResponse.json({ error: "Permission denied" }, { status: 403 });

    const isSuper = user.role === "super_admin";

    try {
      const body = await req.json();
      const { employee_id, shift_id, start_date, end_date, is_recurring } = body;

      if (!isSuper && user.company_id) {
        const check = await pool.query(
          `SELECT company_id FROM employees WHERE id = $1`,
          [employee_id]
        );
        if (check.rows.length === 0 || check.rows[0].company_id !== user.company_id) {
          return err("Employee not found", 404);
        }
      }

      const result = await pool.query(
        `INSERT INTO employee_shifts (employee_id, shift_id, start_date, end_date, is_recurring)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [employee_id, shift_id, start_date, end_date, is_recurring ?? false]
      );
      return created(result.rows[0]);
    } catch (e: any) { return err(e.message); }
  });
}

export async function DELETE(req: Request) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "delete", "attendance");
    if (!allowed) return NextResponse.json({ error: "Permission denied" }, { status: 403 });

    const isSuper = user.role === "super_admin";
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return err("Missing id", 400);

    try {
      let query = `DELETE FROM employee_shifts WHERE id = $1`;
      const params: any[] = [id];

      if (!isSuper) {
        query = `
          DELETE FROM employee_shifts WHERE id = $1
          AND employee_id IN (
            SELECT id FROM employees WHERE company_id = $2
          )
        `;
        params.push(user.company_id);
      }
      query += ` RETURNING *`;

      const result = await pool.query(query, params);
      if (result.rows.length === 0) return notFound("Employee shift");
      return ok({ message: "Employee shift deleted" });
    } catch (e: any) { return err(e.message); }
  });
}

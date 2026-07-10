import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { withAuth, ok, created, err, notFound, badRequest } from "@/lib/api-utils";
import { requirePermission } from "@/lib/permissions";

export async function GET(req: Request) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "view", "self_attendance");
    if (!allowed) return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    try {
      const empRes = await pool.query(
        "SELECT id FROM employees WHERE email = $1",
        [user.email]
      );

      if (empRes.rows.length === 0) {
        return notFound("Employee");
      }

      const employeeId = empRes.rows[0].id;

      const url = new URL(req.url);
      const date = url.searchParams.get("date");

      let query = `
        SELECT a.*, e.code as employee_code,
          e.first_name || ' ' || e.last_name as employee_name
        FROM attendance a
        JOIN employees e ON a.employee_id = e.id
        WHERE a.employee_id = $1
      `;
      const params: any[] = [employeeId];
      let idx = 2;

      if (date) {
        query += ` AND a.date = $${idx}`;
        params.push(date);
        idx++;
      }

      query += ` ORDER BY a.date DESC`;

      const result = await pool.query(query, params);
      return ok(result.rows);
    } catch (e: any) {
      return err(e.message);
    }
  });
}

export async function PATCH(req: Request) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "edit", "self_attendance");
    if (!allowed) return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    try {
      const empRes = await pool.query(
        "SELECT id FROM employees WHERE email = $1",
        [user.email]
      );
      if (empRes.rows.length === 0) {
        return notFound("Employee");
      }
      const employeeId = empRes.rows[0].id;
      const body = await req.json();

      if (body.field === "phone") {
        await pool.query("UPDATE employees SET phone = $1 WHERE id = $2", [body.value, employeeId]);
      } else if (body.field === "address") {
        await pool.query("UPDATE employees SET address = $1 WHERE id = $2", [body.value, employeeId]);
      }

      return ok({ success: true });
    } catch (e: any) {
      return err(e.message);
    }
  });
}

export async function POST(req: Request) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "create", "self_attendance");
    if (!allowed) return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    try {
      const empRes = await pool.query(
        "SELECT id FROM employees WHERE email = $1",
        [user.email]
      );

      if (empRes.rows.length === 0) {
        return notFound("Employee");
      }

      const employeeId = empRes.rows[0].id;
      const { action, time, remarks } = await req.json();

      const today = new Date().toISOString().split("T")[0];
      const currentTime = time || new Date().toTimeString().split(" ")[0].slice(0, 5);

      if (action === "clock_in") {
        const result = await pool.query(
          `INSERT INTO attendance (employee_id, date, time_in, status, remarks)
           VALUES ($1, $2, $3, 'present', $4)
           ON CONFLICT (employee_id, date) DO UPDATE SET time_in = $3, status = 'present', remarks = COALESCE($4, remarks)
           RETURNING *`,
          [employeeId, today, currentTime, remarks || null]
        );
        return created(result.rows[0]);
      }

      if (action === "clock_out") {
        const result = await pool.query(
          `UPDATE attendance SET time_out = $1, remarks = COALESCE($3, remarks)
           WHERE employee_id = $2 AND date = $4 RETURNING *`,
          [currentTime, employeeId, remarks || null, today]
        );
        if (result.rows.length === 0) {
          return badRequest("No clock-in record found for today");
        }
        return ok(result.rows[0]);
      }

      return badRequest("Invalid action. Use 'clock_in' or 'clock_out'.");
    } catch (e: any) {
      return err(e.message);
    }
  });
}

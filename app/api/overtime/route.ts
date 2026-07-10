import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { withAuth, ok, created, err, isAdmin } from "@/lib/api-utils";
import { requirePermission } from "@/lib/permissions";

export async function GET(req: Request) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "view", "overtime");
    if (!allowed) return NextResponse.json({ error: "Permission denied" }, { status: 403 });

    const admin = isAdmin(user);
    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const employee_id = url.searchParams.get("employee_id");

    try {
      let query = `
        SELECT o.*,
          e.code as employee_code,
          e.first_name || ' ' || e.last_name as employee_name
        FROM overtime_records o
        JOIN employees e ON o.employee_id = e.id
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
        query += ` AND o.status = $${idx}`;
        params.push(status);
        idx++;
      }
      if (employee_id) {
        query += ` AND o.employee_id = $${idx}`;
        params.push(employee_id);
        idx++;
      }

      query += ` ORDER BY o.date DESC`;

      const result = await pool.query(query, params);
      return ok(result.rows);
    } catch (e: any) {
      return err(e.message);
    }
  });
}

export async function POST(req: Request) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "create", "overtime");
    if (!allowed) return NextResponse.json({ error: "Permission denied" }, { status: 403 });

    try {
      let { employee_id, date, start_time, end_time, total_hours, rate_multiplier, rate_type, amount } = await req.json();

      if (amount === undefined || amount === null) {
        const empRes = await pool.query("SELECT salary FROM employees WHERE id = $1", [employee_id]);
        if (empRes.rows.length > 0) {
          const hourlyRate = (parseFloat(empRes.rows[0].salary) || 0) / 30 / 8;
          amount = total_hours * rate_multiplier * hourlyRate;
        } else {
          amount = 0;
        }
      }

      const result = await pool.query(
        `INSERT INTO overtime_records (employee_id, date, start_time, end_time,
          total_hours, rate_multiplier, rate_type, amount, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending') RETURNING *`,
        [employee_id, date, start_time, end_time, total_hours, rate_multiplier || 1.5, rate_type, amount]
      );

      return created(result.rows[0]);
    } catch (e: any) {
      return err(e.message);
    }
  });
}

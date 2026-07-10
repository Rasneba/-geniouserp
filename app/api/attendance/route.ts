import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { withAuth, ok, created, err, isAdmin } from "@/lib/api-utils";
import { requirePermission } from "@/lib/permissions";

export async function GET(req: Request) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "view", "attendance");
    if (!allowed) return NextResponse.json({ error: "Permission denied" }, { status: 403 });

    const admin = isAdmin(user);
    const url = new URL(req.url);
    const date = url.searchParams.get("date");
    const employee_id = url.searchParams.get("employee_id");

    try {
      let query = `
        SELECT a.*, e.code as employee_code,
          e.first_name || ' ' || e.last_name as employee_name
        FROM attendance a
        JOIN employees e ON a.employee_id = e.id
        WHERE 1=1
      `;
      const params: any[] = [];
      let idx = 1;

      if (!admin) {
        query += ` AND e.company_id = $${idx}`;
        params.push(user.company_id);
        idx++;
      }
      if (date) {
        query += ` AND a.date = $${idx}`;
        params.push(date);
        idx++;
      }
      if (employee_id) {
        query += ` AND a.employee_id = $${idx}`;
        params.push(employee_id);
        idx++;
      }

      query += ` ORDER BY a.date DESC, e.first_name`;

      const result = await pool.query(query, params);
      return ok(result.rows);
    } catch (e: any) {
      return err(e.message);
    }
  });
}

export async function POST(req: Request) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "create", "attendance");
    if (!allowed) return NextResponse.json({ error: "Permission denied" }, { status: 403 });

    try {
      const { employee_id, date, time_in, time_out, status, remarks } = await req.json();

      let finalStatus = status || "present";
      let finalRemarks = remarks || "";

      if (time_in && (!status || status === "present")) {
        const shiftRes = await pool.query(
          `SELECT s.start_time, s.end_time
           FROM employee_shifts es
           JOIN shifts s ON es.shift_id = s.id
           WHERE es.employee_id = $1
             AND es.start_date <= $2
             AND (es.end_date IS NULL OR es.end_date >= $2)
           ORDER BY es.start_date DESC LIMIT 1`,
          [employee_id, date]
        );
        if (shiftRes.rows.length > 0) {
          const shift = shiftRes.rows[0];
          const clockIn = time_in instanceof Date ? time_in.toTimeString().slice(0, 8) : String(time_in);
          const shiftStart = String(shift.start_time).slice(0, 8);
          if (clockIn > shiftStart) {
            finalStatus = "late";
            finalRemarks = finalRemarks
              ? `${finalRemarks}; Late arrival (shift starts ${shiftStart}, clocked in ${clockIn})`
              : `Late arrival (shift starts ${shiftStart}, clocked in ${clockIn})`;
          }
        }
      }

      const result = await pool.query(
        `INSERT INTO attendance (employee_id, date, time_in, time_out, status, remarks)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (employee_id, date)
         DO UPDATE SET time_in = $3, time_out = $4, status = $5, remarks = $6
         RETURNING *`,
        [employee_id, date, time_in, time_out, finalStatus, finalRemarks]
      );
      return created(result.rows[0]);
    } catch (e: any) {
      return err(e.message);
    }
  });
}

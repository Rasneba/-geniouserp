import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { withAuth, ok, err, notFound } from "@/lib/api-utils";
import { requirePermission } from "@/lib/permissions";

export async function GET(req: Request) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "view", "self_profile");
    if (!allowed) return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    try {
      const empRes = await pool.query(
        `SELECT e.*, d.name as department_name, p.title as position_title
         FROM employees e
         LEFT JOIN departments d ON e.department_id = d.id
         LEFT JOIN positions p ON e.position_id = p.id
         WHERE e.email = $1`,
        [user.email]
      );

      if (empRes.rows.length === 0) {
        return notFound("Employee profile");
      }

      const employee = empRes.rows[0];
      const empId = employee.id;

      const [banks, dependents, education, experience, documents, hobbies, placements, leaveBalance] = await Promise.all([
        pool.query("SELECT * FROM employee_banks WHERE employee_id = $1", [empId]),
        pool.query("SELECT * FROM employee_dependents WHERE employee_id = $1", [empId]),
        pool.query("SELECT * FROM employee_education WHERE employee_id = $1 ORDER BY start_date DESC", [empId]),
        pool.query("SELECT * FROM employee_experience WHERE employee_id = $1 ORDER BY start_date DESC", [empId]),
        pool.query("SELECT * FROM employee_documents WHERE employee_id = $1", [empId]),
        pool.query("SELECT * FROM employee_hobbies WHERE employee_id = $1", [empId]),
        pool.query("SELECT * FROM placements WHERE employee_id = $1 ORDER BY start_date DESC", [empId]),
        pool.query("SELECT ld.*, lt.name as leave_type_name FROM leave_definitions ld JOIN leave_types lt ON ld.leave_type_id = lt.id WHERE ld.employee_id = $1", [empId]),
      ]);

      return ok({
        ...employee,
        banks: banks.rows,
        dependents: dependents.rows,
        education: education.rows,
        experience: experience.rows,
        documents: documents.rows,
        hobbies: hobbies.rows,
        placements: placements.rows,
        leave_definitions: leaveBalance.rows,
      });
    } catch (e: any) {
      return err(e.message);
    }
  });
}

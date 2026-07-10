import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getAuthUser, unauthorized } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();

  const { id } = await params;

  try {
    const isSuperAdmin = user.role === "super_admin";
    const employeeResult = await pool.query(`
      SELECT e.*, d.name as department_name, p.title as position_title,
        es.name as employment_stage_name
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN positions p ON e.position_id = p.id
      LEFT JOIN employment_stages es ON e.employment_stage_id = es.id
      WHERE e.id = $1 ${isSuperAdmin ? "" : "AND e.company_id = $2"}
    `, isSuperAdmin ? [id] : [id, user.company_id]);

    if (employeeResult.rows.length === 0) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    const employee = employeeResult.rows[0];

    if (!isSuperAdmin && employee.company_id !== user.company_id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [banks, dependents, education, experience, documents, hobbies, placements, spouse, training] = await Promise.all([
      pool.query("SELECT * FROM employee_banks WHERE employee_id = $1 ORDER BY id", [id]),
      pool.query("SELECT * FROM employee_dependents WHERE employee_id = $1 ORDER BY id", [id]),
      pool.query("SELECT * FROM employee_education WHERE employee_id = $1 ORDER BY id", [id]),
      pool.query("SELECT * FROM employee_work_experience WHERE employee_id = $1 ORDER BY id", [id]),
      pool.query("SELECT * FROM employee_documents WHERE employee_id = $1 ORDER BY id", [id]),
      pool.query("SELECT * FROM employee_hobbies WHERE employee_id = $1 ORDER BY id", [id]),
      pool.query("SELECT * FROM placements WHERE employee_id = $1 ORDER BY id", [id]),
      pool.query("SELECT * FROM employee_spouse WHERE employee_id = $1 ORDER BY id", [id]),
      pool.query("SELECT * FROM employee_training WHERE employee_id = $1 ORDER BY id", [id]),
    ]);

    return NextResponse.json({
      ...employee,
      banks: banks.rows,
      dependents: dependents.rows,
      education: education.rows,
      experience: experience.rows,
      documents: documents.rows,
      hobbies: hobbies.rows,
      placements: placements.rows,
      spouse: spouse.rows,
      training: training.rows,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getAuthUser, unauthorized } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();

  const { id } = await params;

  try {
    const isSuperAdmin = user.role === "super_admin";
    const empRes = await pool.query(`
      SELECT e.*, d.name as department_name,
        p.title as position_title
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN positions p ON e.position_id = p.id
      WHERE e.id = $1 ${isSuperAdmin ? "" : "AND e.company_id = $2"}
    `, isSuperAdmin ? [id] : [id, user.company_id]);

    if (empRes.rows.length === 0) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    const employee = empRes.rows[0];
    const employeeName = `${employee.first_name} ${employee.last_name}`;

    const placementsRes = await pool.query(`
      SELECT pl.*, p.title as position_title, d.name as department_name
      FROM placements pl
      LEFT JOIN positions p ON pl.position_id = p.id
      LEFT JOIN departments d ON pl.department_id = d.id
      WHERE pl.employee_id = $1
      ORDER BY pl.start_date
    `, [id]);

    const positions = placementsRes.rows.map((pl: any) => ({
      position: pl.position_title || employee.position_title,
      department: pl.department_name || employee.department_name,
      start_date: pl.start_date,
      end_date: pl.end_date,
    }));

    const today = new Date().toISOString().split("T")[0];

    let content = `WORK EXPERIENCE CERTIFICATE

Date: ${today}

This is to certify that ${employeeName} (Employee Code: ${employee.code}) was employed with Genius HRMS.

Department: ${employee.department_name || "N/A"}
Position: ${employee.position_title || "N/A"}
Joined: ${employee.hire_date ? new Date(employee.hire_date).toISOString().split("T")[0] : "N/A"}
`;

    if (employee.termination_date) {
      content += `Terminated: ${new Date(employee.termination_date).toISOString().split("T")[0]}\n`;
    }

    if (positions.length > 0) {
      content += `\nPosition History:\n`;
      for (const pos of positions) {
        content += `- ${pos.position} (${pos.department}) from ${pos.start_date ? new Date(pos.start_date).toISOString().split("T")[0] : "N/A"} to ${pos.end_date ? new Date(pos.end_date).toISOString().split("T")[0] : "Present"}\n`;
      }
    }

    content += `\n\nThis certificate is issued upon request.

Genius HRMS`;

    return NextResponse.json({
      employee_name: employeeName,
      employee_code: employee.code,
      department: employee.department_name || "",
      position: employee.position_title || "",
      joined_at: employee.hire_date,
      terminated_at: employee.termination_date || null,
      position_history: positions,
      content,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

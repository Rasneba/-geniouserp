import { NextResponse } from "next/server";
import { withAuth, ok, created, err, notFound } from "@/lib/api-utils";
import { requirePermission } from "@/lib/permissions";
import pool from "@/lib/db";
import { generateSequentialId } from "@/lib/id-generator";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "view", "termination");
    if (!allowed) return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    const { id } = await params;
    try {
      const isSuperAdmin = user.role === "super_admin";
      const result = await pool.query(`
        SELECT id, first_name, last_name, code, is_active, termination_date,
          termination_reason, termination_type, clearance_status, company_id
        FROM employees WHERE id = $1 ${isSuperAdmin ? "" : "AND company_id = $2"}
      `, isSuperAdmin ? [id] : [id, user.company_id]);
      if (result.rows.length === 0) return notFound("Employee not found");
      return ok(result.rows[0]);
    } catch (e: any) { return err(e.message); }
  });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "create", "termination");
    if (!allowed) return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    const { id } = await params;
    try {
      const { termination_date, reason, is_voluntary, clearance_status } = await req.json();
      const isSuperAdmin = user.role === "super_admin";
      const employeeRes = await pool.query(
        `SELECT * FROM employees WHERE id = $1 ${isSuperAdmin ? "" : "AND company_id = $2"}`,
        isSuperAdmin ? [id] : [id, user.company_id]
      );
      if (employeeRes.rows.length === 0) return notFound("Employee not found");
      const employee = employeeRes.rows[0];
      const updatedEmployee = await pool.query(
        `UPDATE employees SET is_active = false, termination_date = $1,
         termination_reason = $2, termination_type = $3, clearance_status = $4,
         updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *`,
        [termination_date, reason, is_voluntary === false ? "involuntary" : "voluntary", clearance_status || "pending", id]
      );
      const tervCode = await generateSequentialId("vouchers", "code", "TERV");
      const voucherRes = await pool.query(
        `INSERT INTO vouchers (code, voucher_type, employee_id, status, notes, prepared_by)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [tervCode, "TERV", id, "prepared", `Termination voucher for ${employee.first_name} ${employee.last_name}`, user.id]
      );
      const refNum = await generateSequentialId("generated_documents", "reference_number", "DOC");
      const today = new Date().toISOString().split("T")[0];
      const terminationContent = `Termination Letter

Employee: ${employee.first_name} ${employee.last_name}
Employee Code: ${employee.code}
Termination Date: ${termination_date}
Reason: ${reason}
Type: ${is_voluntary === false ? "Involuntary" : "Voluntary"}

This is to confirm that ${employee.first_name} ${employee.last_name} has been terminated from employment effective ${termination_date}.

Company: Genius HRMS
Date Generated: ${today}`;
      const docRes = await pool.query(
        `INSERT INTO generated_documents (template_id, employee_id, voucher_id, reference_number, content, status, created_by)
         VALUES ((SELECT id FROM document_templates WHERE code = 'TERM' LIMIT 1), $1, $2, $3, $4, $5, $6) RETURNING *`,
        [id, voucherRes.rows[0].id, refNum, terminationContent, "generated", user.id]
      );
      await pool.query(
        `INSERT INTO audit_logs (user_id, action, resource, resource_id, details)
         VALUES ($1, $2, $3, $4, $5)`,
        [user.id, "TERMINATE_EMPLOYEE", "employees", id, `Terminated employee ${employee.first_name} ${employee.last_name}`]
      );
      return created({
        employee: updatedEmployee.rows[0],
        voucher: voucherRes.rows[0],
        document: docRes.rows[0],
      });
    } catch (e: any) { return err(e.message); }
  });
}

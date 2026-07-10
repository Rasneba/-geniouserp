import pool from "@/lib/db";
import { withAuth, created, err, notFound } from "@/lib/api-utils";
import { requirePermission } from "@/lib/permissions";
import { generateSequentialId } from "@/lib/id-generator";

export async function POST(req: Request) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "create", "documents");
    if (!allowed) return err("Permission denied", 403);

    try {
      const { template_id, employee_id, voucher_id, custom_fields } = await req.json();

      const [templateRes, employeeRes] = await Promise.all([
        pool.query("SELECT * FROM document_templates WHERE id = $1", [template_id]),
        pool.query(`
          SELECT e.*, d.name as department_name
          FROM employees e
          LEFT JOIN departments d ON e.department_id = d.id
          WHERE e.id = $1
        `, [employee_id]),
      ]);

      if (templateRes.rows.length === 0) {
        return notFound("Document template");
      }

      if (employeeRes.rows.length === 0) {
        return notFound("Employee");
      }

      const template = templateRes.rows[0];
      const employee = employeeRes.rows[0];
      const employeeName = `${employee.first_name} ${employee.last_name}`;
      const today = new Date().toISOString().split("T")[0];
      const docTitle = `${template.name} - ${employeeName}`;

      let voucherNo = null;
      if (voucher_id) {
        const voucherRes = await pool.query("SELECT * FROM vouchers WHERE id = $1", [voucher_id]);
        if (voucherRes.rows.length > 0) {
          voucherNo = voucherRes.rows[0].code;
        }
      }

      const refNum = await generateSequentialId("generated_documents", "reference_number", "DOC");

      let content = template.content || template.template_content || "";

      const replacements: Record<string, string> = {
        "{{employee_name}}": employeeName,
        "{{employee_code}}": employee.code,
        "{{department}}": employee.department_name || "",
        "{{date}}": today,
        "{{voucher_no}}": voucherNo || "",
        "{{company_name}}": "Genius HRMS",
        ...(custom_fields || {}),
      };

      for (const [key, value] of Object.entries(replacements)) {
        content = content.replace(new RegExp(key.replace(/[{}]/g, "\\{?\\}?"), "g"), value);
      }

      const result = await pool.query(
        `INSERT INTO generated_documents (template_id, employee_id, voucher_id, document_type, reference_number, title, content, status, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [template_id, employee_id, voucher_id || null, template.type, refNum, docTitle, content, "generated", user.id]
      );

      return created(result.rows[0]);
    } catch (e: any) {
      return err(e.message);
    }
  });
}

import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { withAuth, ok, err, notFound, badRequest, deleted, isAdmin } from "@/lib/api-utils";
import { requirePermission } from "@/lib/permissions";

const ALLOWED_FIELDS = [
  "code", "title", "first_name", "middle_name", "last_name",
  "nationality", "gender", "marital_status", "date_of_birth",
  "tin", "biold", "passport_id", "national_id", "category_id",
  "department_id", "position_id", "phone", "email", "address",
  "emergency_contact", "emergency_phone", "hire_date", "salary",
  "is_active", "employment_stage_id", "branch",
  "probation_start_date", "probation_end_date", "contract_end_date", "photo",
];

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "view", "employees");
    if (!allowed) return NextResponse.json({ error: "Permission denied" }, { status: 403 });

    const { id } = await params;
    const admin = isAdmin(user);

    try {
      let query = `
        SELECT e.*, d.name as department_name, p.title as position_title,
          es.name as employment_stage_name
        FROM employees e
        LEFT JOIN departments d ON e.department_id = d.id
        LEFT JOIN positions p ON e.position_id = p.id
        LEFT JOIN employment_stages es ON e.employment_stage_id = es.id
        WHERE e.id = $1
      `;
      const queryParams: any[] = [id];
      if (!admin) {
        query += ` AND e.company_id = $2`;
        queryParams.push(user.company_id);
      }

      const result = await pool.query(query, queryParams);
      if (result.rows.length === 0) return notFound("Employee");
      return ok(result.rows[0]);
    } catch (e: any) {
      return err(e.message);
    }
  });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "edit", "employees");
    if (!allowed) return NextResponse.json({ error: "Permission denied" }, { status: 403 });

    const { id } = await params;
    const admin = isAdmin(user);
    const body = await req.json();

    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    const clean = (v: any) => (v === "" || v === undefined ? null : v);

    for (const field of ALLOWED_FIELDS) {
      if (body[field] !== undefined) {
        fields.push(`${field} = $${idx}`);
        values.push(clean(body[field]));
        idx++;
      }
    }

    if (fields.length === 0) return badRequest("No fields to update");

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    try {
      let whereClause = `WHERE id = $${idx}`;
      if (!admin) {
        idx++;
        whereClause += ` AND company_id = $${idx}`;
        values.push(user.company_id);
      }

      const result = await pool.query(
        `UPDATE employees SET ${fields.join(", ")} ${whereClause} RETURNING *`,
        values
      );

      if (result.rows.length === 0) return notFound("Employee");
      return ok(result.rows[0]);
    } catch (e: any) {
      return err(e.message);
    }
  });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "delete", "employees");
    if (!allowed) return NextResponse.json({ error: "Permission denied" }, { status: 403 });

    const { id } = await params;
    const admin = isAdmin(user);

    try {
      let query = "DELETE FROM employees WHERE id = $1";
      const queryParams: any[] = [id];
      if (!admin) {
        query += " AND company_id = $2";
        queryParams.push(user.company_id);
      }
      query += " RETURNING *";

      const result = await pool.query(query, queryParams);
      if (result.rows.length === 0) return notFound("Employee");
      return deleted("Employee");
    } catch (e: any) {
      return err(e.message);
    }
  });
}

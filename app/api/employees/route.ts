import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { withAuth, ok, created, err, badRequest, isAdmin } from "@/lib/api-utils";
import { requirePermission } from "@/lib/permissions";
import { generateSequentialId } from "@/lib/id-generator";

export async function GET(req: Request) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "view", "employees");
    if (!allowed) return NextResponse.json({ error: "Permission denied" }, { status: 403 });

    const isSuper = user.role === "super_admin";
    const params: any[] = [];
    let idx = 1;

    try {
      let query = `
        SELECT e.*, d.name as department_name, p.title as position_title,
          es.name as employment_stage_name
        FROM employees e
        LEFT JOIN departments d ON e.department_id = d.id
        LEFT JOIN positions p ON e.position_id = p.id
        LEFT JOIN employment_stages es ON e.employment_stage_id = es.id
        WHERE 1=1
      `;
      if (!isSuper) {
        query += ` AND e.company_id = $${idx++}`;
        params.push(user.company_id);
      }
      query += ` ORDER BY e.id DESC`;

      const result = await pool.query(query, params);
      return ok(result.rows);
    } catch (e: any) {
      return err(e.message);
    }
  });
}

export async function POST(req: Request) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "create", "employees");
    if (!allowed) return NextResponse.json({ error: "Permission denied" }, { status: 403 });

    try {
      const body = await req.json();
      const {
        title, first_name, middle_name, last_name,
        nationality, gender, marital_status, date_of_birth,
        tin, biold, passport_id, national_id, category_id,
        department_id, position_id, phone, email, address,
        emergency_contact, emergency_phone, hire_date, salary, photo,
      } = body;

      const clean = (v: any) => (v === "" || v === undefined ? null : v);
      const code = body.code || await generateSequentialId("employees", "code", "EMP");

      const result = await pool.query(
        `INSERT INTO employees
         (code, title, first_name, middle_name, last_name,
          nationality, gender, marital_status, date_of_birth,
          tin, biold, passport_id, national_id, category_id,
          department_id, position_id, phone, email, address,
          emergency_contact, emergency_phone, hire_date, salary, photo, company_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25)
         RETURNING *`,
        [
          code, clean(title), first_name, middle_name, last_name,
          clean(nationality), clean(gender), clean(marital_status), clean(date_of_birth),
          clean(tin), clean(biold), clean(passport_id), clean(national_id), category_id || 1,
          clean(department_id), clean(position_id), clean(phone), clean(email), clean(address),
          clean(emergency_contact), clean(emergency_phone), clean(hire_date), clean(salary), clean(photo),
          user.company_id,
        ]
      );

      return created(result.rows[0]);
    } catch (e: any) {
      return err(e.message);
    }
  });
}

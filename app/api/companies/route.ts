import pool from "@/lib/db";
import { withAuth, ok, created, err, badRequest } from "@/lib/api-utils";
import { requirePermission } from "@/lib/permissions";
import { generateSequentialId } from "@/lib/id-generator";

export async function GET(req: Request) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "view", "companies");
    if (!allowed) return err("Permission denied", 403);

    try {
      const isSuper = user.role === "super_admin";
      let query = `
        SELECT c.*,
          (SELECT COUNT(*) FROM demo_licenses WHERE company_id = c.id) as license_count,
          (SELECT COUNT(*) FROM users WHERE company_id = c.id) as user_count,
          (SELECT string_agg(m.name, ', ') FROM company_modules cm JOIN modules m ON cm.module_id = m.id WHERE cm.company_id = c.id AND cm.is_enabled = true) as enabled_modules
         FROM companies c
      `;
      const params: any[] = [];
      if (!isSuper && user.company_id) {
        query += ` WHERE c.id = $1`;
        params.push(user.company_id);
      }
      query += ` ORDER BY c.created_at DESC`;
      const result = await pool.query(query, params);
      return ok(result.rows);
    } catch (e: any) {
      return err(e.message);
    }
  });
}

export async function POST(req: Request) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "create", "companies");
    if (!allowed) return err("Permission denied", 403);

    try {
      const body = await req.json();
      const { name, address, phone, email, website, contact_person, contact_phone, contact_email, tin, license_type, notes, modules: moduleIds } = body;
      if (!name) return badRequest("Company name is required");
      if (!tin) return badRequest("Company TIN is required");

      const code = body.code || await generateSequentialId("companies", "code", "CMP");

      const result = await pool.query(
        `INSERT INTO companies (name, code, address, phone, email, website, contact_person, contact_phone, contact_email, tin, license_type, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
        [name, code, address, phone, email, website, contact_person, contact_phone, contact_email, tin, license_type || 'demo', notes]
      );

      const company = result.rows[0];

      if (moduleIds && Array.isArray(moduleIds) && moduleIds.length > 0) {
        for (const mid of moduleIds) {
          await pool.query(
            "INSERT INTO company_modules (company_id, module_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
            [company.id, mid]
          );
        }
      }

      return created(company);
    } catch (e: any) {
      return err(e.message);
    }
  });
}

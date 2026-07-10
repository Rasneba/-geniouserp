import pool from "@/lib/db";
import { withAuth, ok, created, err, badRequest, notFound } from "@/lib/api-utils";
import { requirePermission } from "@/lib/permissions";
import crypto from "crypto";
import { generateSequentialId } from "@/lib/id-generator";

function generateKey(): string {
  const segments: string[] = [];
  for (let i = 0; i < 4; i++) {
    segments.push(crypto.randomBytes(3).toString("hex").toUpperCase());
  }
  return `DEMO-${segments.join("-")}`;
}

export async function GET(req: Request) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "view", "demo_licenses");
    if (!allowed) return err("Permission denied", 403);

    try {
      const isSuper = user.role === "super_admin";
      let query = `
        SELECT dl.*, u.name as issued_by_name,
          c.name as registered_company, c.id as company_id, c.tin as company_tin,
          (SELECT json_agg(json_build_object('code', m.code, 'name', m.name))
           FROM company_modules cm JOIN modules m ON cm.module_id = m.id WHERE cm.company_id = dl.company_id AND cm.is_enabled = true) as licensed_modules
        FROM demo_licenses dl
        LEFT JOIN users u ON dl.issued_by = u.id
        LEFT JOIN companies c ON dl.company_id = c.id
      `;
      const params: any[] = [];
      if (!isSuper && user.company_id) {
        query += ` WHERE dl.company_id = $1`;
        params.push(user.company_id);
      }
      query += ` ORDER BY dl.created_at DESC`;
      const result = await pool.query(query, params);
      return ok(result.rows);
    } catch (e: any) {
      return err(e.message);
    }
  });
}

export async function POST(req: Request) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "create", "demo_licenses");
    if (!allowed) return err("Permission denied", 403);

    try {
      const body = await req.json();
      let { company_name, company_tin, contact_name, contact_email, contact_phone, duration_days, notes, module_ids } = body;

      const isSuper = user.role === "super_admin";
      if (!isSuper && user.company_id) {
        const companyRes = await pool.query("SELECT id, name, tin FROM companies WHERE id = $1", [user.company_id]);
        if (companyRes.rows.length === 0) {
          return notFound("Company");
        }
        company_name = companyRes.rows[0].name;
        company_tin = companyRes.rows[0].tin;
      }
      if (!company_name) {
        return badRequest("Company name is required");
      }
      if (!company_tin) {
        return badRequest("Company TIN is required");
      }
      const days = parseInt(duration_days) || 15;
      const license_key = generateKey();

      let companyRes = await pool.query("SELECT id FROM companies WHERE tin = $1", [company_tin]);
      let companyId: number | null = null;
      if (companyRes.rows.length === 0) {
        const code = await generateSequentialId("companies", "code", "CMP");
        const newCompany = await pool.query(
          `INSERT INTO companies (name, code, tin, contact_person, contact_email, contact_phone, license_type, notes)
           VALUES ($1,$2,$3,$4,$5,$6,'demo',$7) RETURNING id`,
          [company_name, code, company_tin, contact_name, contact_email, contact_phone, notes]
        );
        companyId = newCompany.rows[0].id;

        const mids = module_ids && Array.isArray(module_ids) ? module_ids : [];
        if (mids.length > 0) {
          for (const mid of mids) {
            await pool.query(
              "INSERT INTO company_modules (company_id, module_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
              [companyId, mid]
            );
          }
        }
      } else {
        companyId = companyRes.rows[0].id;
      }

      const result = await pool.query(
        `INSERT INTO demo_licenses (license_key, company_id, company_name, contact_name, contact_email, contact_phone, duration_days, expiry_date, notes, issued_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7::int,CURRENT_DATE + $7::int,$8,$9) RETURNING *`,
        [license_key, companyId, company_name, contact_name || null, contact_email || null, contact_phone || null, days, notes || null, user.id]
      );

      return created(result.rows[0]);
    } catch (e: any) {
      return err(e.message);
    }
  });
}

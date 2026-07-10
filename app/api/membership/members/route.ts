import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { withAuth, ok, created, err, notFound, badRequest } from "@/lib/api-utils";
import { requirePermission } from "@/lib/permissions";
import { generateSequentialId } from "@/lib/id-generator";

export async function GET(req: Request) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "view", "membership_members");
    if (!allowed) return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    try {
      const result = await pool.query(
        `SELECT mm.*, mp.name as plan_name, mp.type as plan_type,
          mp.price as plan_price, mp.duration_days as plan_duration
         FROM membership_members mm
         LEFT JOIN membership_plans mp ON mm.plan_id = mp.id
         WHERE mm.company_id = $1
         ORDER BY mm.created_at DESC`,
        [user.company_id]
      );
      return ok(result.rows);
    } catch (e: any) {
      return err(e.message);
    }
  });
}

export async function POST(req: Request) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "create", "membership_members");
    if (!allowed) return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    try {
      const body = await req.json();
      const { customer_id, plan_id, full_name, phone, email, id_number, address, photo_url, start_date, end_date, notes } = body;
      if (!full_name) return badRequest("Member name is required");

      const cid = customer_id || await generateSequentialId("membership_members", "customer_id", "MEM");

      if (plan_id) {
        const planRes = await pool.query("SELECT duration_days FROM membership_plans WHERE id = $1", [plan_id]);
        if (planRes.rows.length === 0) return notFound("Plan");
        const duration = planRes.rows[0].duration_days;
        const result = await pool.query(
          `INSERT INTO membership_members (company_id, customer_id, plan_id, full_name, phone, email, id_number, address, photo_url, start_date, end_date, notes)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$10 + $11::int,$12) RETURNING *`,
          [user.company_id, cid, plan_id, full_name, phone, email, id_number || null, address || null, photo_url || null, start_date || new Date(), duration, notes || null]
        );
        return created(result.rows[0]);
      }

      const result = await pool.query(
        `INSERT INTO membership_members (company_id, customer_id, full_name, phone, email, id_number, address, photo_url, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
        [user.company_id, cid, full_name, phone, email || null, id_number || null, address || null, photo_url || null, notes || null]
      );
      return created(result.rows[0]);
    } catch (e: any) {
      return err(e.message);
    }
  });
}

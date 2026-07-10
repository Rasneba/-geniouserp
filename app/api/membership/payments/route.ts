import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { withAuth, ok, created, err, badRequest } from "@/lib/api-utils";
import { requirePermission } from "@/lib/permissions";
import { generateSequentialId } from "@/lib/id-generator";

export async function GET(req: Request) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "view", "membership_payments");
    if (!allowed) return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    try {
      const result = await pool.query(
        `SELECT mpay.*, mm.full_name as member_name, mp.name as plan_name, mp.type as plan_type
         FROM membership_payments mpay
         JOIN membership_members mm ON mpay.member_id = mm.id
         JOIN membership_plans mp ON mm.plan_id = mp.id
         WHERE mpay.company_id = $1
         ORDER BY mpay.created_at DESC`,
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
    const { allowed } = await requirePermission(user, "create", "membership_payments");
    if (!allowed) return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    try {
      if (!user.company_id) return badRequest("Company required");
      const body = await req.json();
      const { member_id, amount, payment_method, reference, payment_date, notes } = body;
      if (!member_id) return badRequest("Member is required");
      if (!amount) return badRequest("Amount is required");
      const ref = reference || await generateSequentialId("membership_payments", "reference", "PAY");
      const result = await pool.query(
        `INSERT INTO membership_payments (company_id, member_id, amount, payment_method, reference, payment_date, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
        [user.company_id, member_id, amount, payment_method || "cash", ref, payment_date || new Date(), notes]
      );
      return created(result.rows[0]);
    } catch (e: any) {
      return err(e.message);
    }
  });
}

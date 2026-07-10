import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { withAuth, ok, created, err, notFound, badRequest, deleted, isAdmin } from "@/lib/api-utils";
import { requirePermission } from "@/lib/permissions";

export async function GET(req: Request) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "view", "pension_settings");
    if (!allowed) return NextResponse.json({ error: "Permission denied" }, { status: 403 });

    try {
      const result = await pool.query(
        "SELECT * FROM pension_settings WHERE is_active = true ORDER BY id DESC LIMIT 1"
      );
      return ok(result.rows[0] || { employee_rate: 0.07, employer_rate: 0.11 });
    } catch (e: any) {
      return err(e.message);
    }
  });
}

export async function PUT(req: Request) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "edit", "pension_settings");
    if (!allowed) return NextResponse.json({ error: "Permission denied" }, { status: 403 });

    try {
      const { employee_rate, employer_rate } = await req.json();
      await pool.query("UPDATE pension_settings SET is_active = false");
      const result = await pool.query(
        "INSERT INTO pension_settings (employee_rate, employer_rate) VALUES ($1,$2) RETURNING *",
        [employee_rate, employer_rate]
      );
      return ok(result.rows[0]);
    } catch (e: any) {
      return err(e.message);
    }
  });
}

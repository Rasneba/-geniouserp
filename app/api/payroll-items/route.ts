import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { withAuth, ok, created, err, notFound, badRequest, deleted, isAdmin } from "@/lib/api-utils";
import { requirePermission } from "@/lib/permissions";

export async function GET(req: Request) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "view", "payroll_items");
    if (!allowed) return NextResponse.json({ error: "Permission denied" }, { status: 403 });

    try {
      const result = await pool.query(
        "SELECT * FROM payroll_items WHERE is_active = true ORDER BY type, name"
      );
      return ok(result.rows);
    } catch (e: any) {
      return err(e.message);
    }
  });
}

export async function POST(req: Request) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "create", "payroll_items");
    if (!allowed) return NextResponse.json({ error: "Permission denied" }, { status: 403 });

    try {
      const { name, code, type, is_taxable, is_pensionable } = await req.json();

      const result = await pool.query(
        `INSERT INTO payroll_items (name, code, type, is_taxable, is_pensionable)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [name, code, type, is_taxable ?? true, is_pensionable ?? true]
      );

      return created(result.rows[0]);
    } catch (e: any) {
      return err(e.message);
    }
  });
}

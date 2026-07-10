import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { withAuth, ok, created, err, notFound, badRequest, deleted, isAdmin } from "@/lib/api-utils";
import { requirePermission } from "@/lib/permissions";

export async function GET(req: Request) {
  return withAuth(req, async (user) => {
    const { allowed, error } = await requirePermission(user, "view", "documents");
    if (!allowed) return NextResponse.json(error, { status: 403 });
    try {
      const result = await pool.query(`
        SELECT gd.*,
          e.first_name || ' ' || e.last_name as employee_name,
          dt.name as template_name
        FROM generated_documents gd
        LEFT JOIN employees e ON gd.employee_id = e.id
        LEFT JOIN document_templates dt ON gd.template_id = dt.id
        ORDER BY gd.created_at DESC
      `);
      return ok(result.rows);
    } catch (e: any) { return err(e.message); }
  });
}

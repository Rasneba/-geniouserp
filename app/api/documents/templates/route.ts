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
        SELECT id, name, code, type, is_active
        FROM document_templates
        ORDER BY name
      `);
      return ok(result.rows);
    } catch (e: any) { return err(e.message); }
  });
}

import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { withAuth, ok, created, err, notFound, badRequest, deleted, isAdmin } from "@/lib/api-utils";
import { requirePermission } from "@/lib/permissions";

export async function GET(req: Request) {
  return withAuth(req, async (user) => {
    const { allowed, error } = await requirePermission(user, "view", "settings");
    if (!allowed) return NextResponse.json(error, { status: 403 });
    try {
      const result = await pool.query("SELECT * FROM settings ORDER BY id");
      const settings: Record<string, string> = {};
      for (const row of result.rows) {
        settings[row.key] = row.value;
      }
      return ok(settings);
    } catch (e: any) { return err(e.message); }
  });
}

export async function PUT(req: Request) {
  return withAuth(req, async (user) => {
    const { allowed, error } = await requirePermission(user, "edit", "settings");
    if (!allowed) return NextResponse.json(error, { status: 403 });
    try {
      const body = await req.json();

      for (const [key, value] of Object.entries(body)) {
        await pool.query(
          `UPDATE settings SET value = $1, updated_at = CURRENT_TIMESTAMP WHERE key = $2`,
          [value, key]
        );
      }

      const result = await pool.query("SELECT * FROM settings ORDER BY id");
      const settings: Record<string, string> = {};
      for (const row of result.rows) {
        settings[row.key] = row.value;
      }
      return ok(settings);
    } catch (e: any) { return err(e.message); }
  });
}

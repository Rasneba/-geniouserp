import { NextResponse } from "next/server";
import { withAuth, ok, created, err } from "@/lib/api-utils";
import { requirePermission } from "@/lib/permissions";
import pool from "@/lib/db";

export async function GET(req: Request) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "view", "shifts");
    if (!allowed) return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    try {
      const result = await pool.query(
        "SELECT * FROM shifts WHERE is_active = true ORDER BY name"
      );
      return ok(result.rows);
    } catch (e: any) { return err(e.message); }
  });
}

export async function POST(req: Request) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "create", "shifts");
    if (!allowed) return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    try {
      const { name, start_time, end_time, description } = await req.json();
      const result = await pool.query(
        `INSERT INTO shifts (name, start_time, end_time, description)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [name, start_time, end_time, description]
      );
      return created(result.rows[0]);
    } catch (e: any) { return err(e.message); }
  });
}

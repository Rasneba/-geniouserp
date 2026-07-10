import { NextResponse } from "next/server";
import { withAuth, ok, err, notFound, deleted } from "@/lib/api-utils";
import { requirePermission } from "@/lib/permissions";
import pool from "@/lib/db";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "view", "shifts");
    if (!allowed) return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    const { id } = await params;
    try {
      const result = await pool.query("SELECT * FROM shifts WHERE id = $1", [id]);
      if (result.rows.length === 0) return notFound("Shift not found");
      return ok(result.rows[0]);
    } catch (e: any) { return err(e.message); }
  });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "edit", "shifts");
    if (!allowed) return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    const { id } = await params;
    try {
      const { name, start_time, end_time, description, is_active } = await req.json();
      const result = await pool.query(
        `UPDATE shifts SET name = $1, start_time = $2, end_time = $3,
          description = $4, is_active = $5 WHERE id = $6 RETURNING *`,
        [name, start_time, end_time, description, is_active, id]
      );
      if (result.rows.length === 0) return notFound("Shift not found");
      return ok(result.rows[0]);
    } catch (e: any) { return err(e.message); }
  });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "delete", "shifts");
    if (!allowed) return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    const { id } = await params;
    try {
      await pool.query("DELETE FROM shifts WHERE id = $1", [id]);
      return deleted("Shift deleted");
    } catch (e: any) { return err(e.message); }
  });
}

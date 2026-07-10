import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getAuthUser, unauthorized } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();

  const { id } = await params;

  try {
    const result = await pool.query(
      `SELECT resource, can_view, can_create, can_edit, can_delete, can_approve
       FROM role_permissions WHERE role_id = $1 ORDER BY resource`,
      [id]
    );

    const perms: Record<string, boolean[]> = {};
    for (const row of result.rows) {
      perms[row.resource] = [
        row.can_view, row.can_create, row.can_edit, row.can_delete, row.can_approve,
      ];
    }

    return NextResponse.json(perms);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();

  if (user.role !== "super_admin" && user.role !== "admin") {
    return NextResponse.json({ error: "Permission denied" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const permissions: Record<string, boolean[]> = body;

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query("DELETE FROM role_permissions WHERE role_id = $1", [id]);

      for (const [resource, bits] of Object.entries(permissions)) {
        await client.query(
          `INSERT INTO role_permissions (role_id, resource, can_view, can_create, can_edit, can_delete, can_approve)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [id, resource, bits[0] || false, bits[1] || false, bits[2] || false, bits[3] || false, bits[4] || false]
        );
      }

      await client.query("COMMIT");

      const result = await pool.query(
        `SELECT resource, can_view, can_create, can_edit, can_delete, can_approve
         FROM role_permissions WHERE role_id = $1 ORDER BY resource`,
        [id]
      );

      const perms: Record<string, boolean[]> = {};
      for (const row of result.rows) {
        perms[row.resource] = [
          row.can_view, row.can_create, row.can_edit, row.can_delete, row.can_approve,
        ];
      }

      return NextResponse.json(perms);
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

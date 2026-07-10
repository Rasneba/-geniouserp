import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { withAuth, ok, created, err, notFound, badRequest, deleted, isAdmin } from "@/lib/api-utils";
import { requirePermission } from "@/lib/permissions";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(req, async (user) => {
    const { allowed, error } = await requirePermission(user, "view", "biometric_devices");
    if (!allowed) return NextResponse.json(error, { status: 403 });
    const { id } = await params;
    try {
      const result = await pool.query("SELECT * FROM biometric_devices WHERE id = $1", [id]);
      if (result.rows.length === 0) {
        return notFound("Device");
      }
      return ok(result.rows[0]);
    } catch (e: any) { return err(e.message); }
  });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(req, async (user) => {
    const { allowed, error } = await requirePermission(user, "edit", "biometric_devices");
    if (!allowed) return NextResponse.json(error, { status: 403 });
    const { id } = await params;
    try {
      const { name, ip_address, port, serial_number, model, location, timezone, is_active } = await req.json();

      const result = await pool.query(
        `UPDATE biometric_devices
         SET name = COALESCE($1, name),
             ip_address = COALESCE($2, ip_address),
             port = COALESCE($3, port),
             serial_number = COALESCE($4, serial_number),
             model = COALESCE($5, model),
             location = COALESCE($6, location),
             timezone = COALESCE($7, timezone),
             is_active = COALESCE($8, is_active),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $9 RETURNING *`,
        [name, ip_address, port, serial_number, model, location, timezone, is_active, id]
      );

      if (result.rows.length === 0) {
        return notFound("Device");
      }

      return ok(result.rows[0]);
    } catch (e: any) { return err(e.message); }
  });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(req, async (user) => {
    const { allowed, error } = await requirePermission(user, "delete", "biometric_devices");
    if (!allowed) return NextResponse.json(error, { status: 403 });
    const { id } = await params;
    try {
      const result = await pool.query(
        "DELETE FROM biometric_devices WHERE id = $1 RETURNING *",
        [id]
      );

      if (result.rows.length === 0) {
        return notFound("Device");
      }

      return deleted("Device");
    } catch (e: any) { return err(e.message); }
  });
}

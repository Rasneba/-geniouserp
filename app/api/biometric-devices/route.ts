import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { withAuth, ok, created, err, notFound, badRequest, deleted, isAdmin } from "@/lib/api-utils";
import { requirePermission } from "@/lib/permissions";

export async function GET(req: Request) {
  return withAuth(req, async (user) => {
    const { allowed, error } = await requirePermission(user, "view", "biometric_devices");
    if (!allowed) return NextResponse.json(error, { status: 403 });
    try {
      const result = await pool.query(
        "SELECT * FROM biometric_devices ORDER BY updated_at DESC"
      );
      return ok(result.rows);
    } catch (e: any) { return err(e.message); }
  });
}

export async function POST(req: Request) {
  return withAuth(req, async (user) => {
    const { allowed, error } = await requirePermission(user, "create", "biometric_devices");
    if (!allowed) return NextResponse.json(error, { status: 403 });
    try {
      const { name, ip_address, port, serial_number, model, location, timezone } = await req.json();

      if (!name || !ip_address) {
        return badRequest("Name and IP address are required");
      }

      const result = await pool.query(
        `INSERT INTO biometric_devices (name, ip_address, port, serial_number, model, location, timezone)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [name, ip_address, port || 4370, serial_number || null, model || null, location || null, timezone || "UTC"]
      );

      return created(result.rows[0]);
    } catch (e: any) { return err(e.message); }
  });
}

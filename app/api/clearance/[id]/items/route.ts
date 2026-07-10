import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getAuthUser, unauthorized } from "@/lib/auth";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  const { id } = await params;
  try {
    const { item_id, status, remarks } = await req.json();
    const result = await pool.query(
      `UPDATE clearance_item_status SET status=$1, remarks=COALESCE($2, remarks),
       completed_by=$3, completed_at=CURRENT_TIMESTAMP
       WHERE clearance_id=$4 AND item_id=$5 RETURNING *`,
      [status, remarks, user.id, id, item_id]
    );
    return NextResponse.json(result.rows[0] || { error: "Item not found" }, { status: result.rows[0] ? 200 : 404 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

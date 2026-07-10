import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getAuthUser, unauthorized } from "@/lib/auth";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string; hobbyId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();

  const { id, hobbyId } = await params;

  try {
    const result = await pool.query(
      "DELETE FROM employee_hobbies WHERE id = $1 AND employee_id = $2 RETURNING *",
      [hobbyId, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Hobby not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Hobby deleted" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

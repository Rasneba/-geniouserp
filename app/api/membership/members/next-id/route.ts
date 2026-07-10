import { NextResponse } from "next/server";
import { withAuth, ok } from "@/lib/api-utils";
import { requirePermission } from "@/lib/permissions";
import { generateSequentialId } from "@/lib/id-generator";

export async function GET(req: Request) {
  return withAuth(req, async (user) => {
    const { allowed } = await requirePermission(user, "view", "membership_members");
    if (!allowed) return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    try {
      const id = await generateSequentialId("membership_members", "customer_id", "MEM");
      return ok({ id });
    } catch {
      return ok({ id: "MEM-001" });
    }
  });
}

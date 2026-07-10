import pool from "@/lib/db";
import { withAuth, ok, err } from "@/lib/api-utils";

export async function GET(req: Request) {
  return withAuth(req, async () => {
    try {
      const result = await pool.query(
        "SELECT * FROM employment_stages WHERE is_active = true ORDER BY name"
      );
      return ok(result.rows);
    } catch (e: any) {
      return err(e.message);
    }
  });
}

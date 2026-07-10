import pool from "@/lib/db";
import { withAuth, ok, err, isAdmin } from "@/lib/api-utils";
import { requirePermission } from "@/lib/permissions";

export async function GET(req: Request) {
  return withAuth(req, async (user) => {
    requirePermission(user, "view", "dashboard");

    const admin = isAdmin(user);
    const companyClause = admin ? "" : " AND company_id = $1";
    const companyParam = admin ? [] : [user.company_id];
    try {
      const [totalItems, totalCategories, totalWarehouses, lowStock, recentMovements] = await Promise.all([
        pool.query(`SELECT COUNT(*) FROM items WHERE is_active = true${companyClause}`, companyParam),
        pool.query(`SELECT COUNT(*) FROM item_categories WHERE is_active = true${companyClause}`, companyParam),
        pool.query(`SELECT COUNT(*) FROM warehouses WHERE is_active = true${companyClause}`, companyParam),
        pool.query(`
          SELECT i.id, i.name, i.code, i.reorder_level,
            COALESCE((SELECT SUM(sb.quantity) FROM stock_balances sb WHERE sb.item_id = i.id), 0) as total_stock
          FROM items i
          WHERE i.is_active = true${companyClause}
          HAVING COALESCE((SELECT SUM(sb.quantity) FROM stock_balances sb WHERE sb.item_id = i.id), 0) <= i.reorder_level
            AND i.reorder_level > 0
        `, companyParam),
        pool.query(`
          SELECT sm.*, i.name as item_name, i.code as item_code, w.name as warehouse_name
          FROM stock_movements sm
          LEFT JOIN items i ON sm.item_id = i.id
          LEFT JOIN warehouses w ON sm.warehouse_id = w.id
          ${admin ? "" : "WHERE sm.company_id = $1"}
          ORDER BY sm.created_at DESC LIMIT 10
        `, companyParam),
      ]);

      return ok({
        totalItems: parseInt(totalItems.rows[0].count),
        totalCategories: parseInt(totalCategories.rows[0].count),
        totalWarehouses: parseInt(totalWarehouses.rows[0].count),
        lowStockItems: lowStock.rows,
        recentMovements: recentMovements.rows,
      });
    } catch (e: any) {
      return err(e.message);
    }
  });
}

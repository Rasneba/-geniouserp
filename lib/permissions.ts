import pool from "@/lib/db";
import type { AuthUser } from "@/lib/api-utils";

export type PermissionAction = "view" | "create" | "edit" | "delete" | "approve";

export const RESOURCE_GROUPS: Record<string, { label: string; resources: string[] }> = {
  "HR Core": {
    label: "HR Core",
    resources: [
      "employees", "departments", "positions", "branches",
      "placements", "employment_stages", "shifts", "employee_shifts",
    ],
  },
  "People": {
    label: "People",
    resources: [
      "attendance", "leave", "overtime", "performance", "clearance", "termination",
    ],
  },
  "Payroll": {
    label: "Payroll & Finance",
    resources: [
      "payroll", "payroll_periods", "payroll_items", "vouchers", "voucher_items",
      "finance_accounts", "finance_journal", "finance_ledger", "finance_budget", "finance_payments",
    ],
  },
  "Stock": {
    label: "Stock & Inventory",
    resources: [
      "items", "item_categories", "warehouses",
      "stock_movements", "stock_adjustments", "stock_transfers",
    ],
  },
  "Sales": {
    label: "Sales",
    resources: [
      "sales_customers", "sales_orders", "sales_invoices",
      "sales_quotations", "sales_pos",
    ],
  },
  "Procurement": {
    label: "Procurement",
    resources: ["suppliers", "purchase_orders", "rfq"],
  },
  "Production": {
    label: "Production",
    resources: ["work_orders", "bom", "routings"],
  },
  "Membership": {
    label: "Membership",
    resources: ["membership_plans", "membership_members", "membership_payments", "membership_attendance"],
  },
  "Parking": {
    label: "Parking",
    resources: [
      "parking_zones", "parking_slots", "parking_gates", "parking_cameras",
      "parking_vehicles", "parking_sessions", "parking_rates",
      "parking_qr_tickets", "parking_payments", "parking_subscriptions",
      "parking_customers", "parking_reports",
      "parking_rfid_cards",
    ],
  },
  "System": {
    label: "System",
    resources: [
      "users", "roles", "settings", "id_definitions", "notifications",
      "documents", "reports", "audit_logs",
      "companies", "modules", "demo_licenses", "biometric_devices",
    ],
  },
};

export function getAllResources(): string[] {
  return Object.values(RESOURCE_GROUPS).flatMap((g) => g.resources);
}

export function getDefaultPermissions(): Record<string, boolean[]> {
  const all: Record<string, boolean[]> = {};
  const defaultActions = [false, false, false, false, false];
  for (const res of getAllResources()) {
    all[res] = [...defaultActions];
  }
  return all;
}

export function actionsToBits(actions: PermissionAction[]): boolean[] {
  const all: PermissionAction[] = ["view", "create", "edit", "delete", "approve"];
  return all.map((a) => actions.includes(a));
}

export function bitsToActions(bits: boolean[]): PermissionAction[] {
  const all: PermissionAction[] = ["view", "create", "edit", "delete", "approve"];
  return all.filter((_, i) => bits[i]);
}

let permissionCache: Record<string, Record<string, boolean[]>> | null = null;
let permissionCacheTime = 0;
const CACHE_TTL = 30000;

async function fetchRolePermissions(): Promise<Record<string, Record<string, boolean[]>>> {
  if (permissionCache && Date.now() - permissionCacheTime < CACHE_TTL) {
    return permissionCache;
  }
  try {
    const result = await pool.query(`
      SELECT r.name as role_name, rp.resource,
        rp.can_view, rp.can_create, rp.can_edit, rp.can_delete, rp.can_approve
      FROM role_permissions rp
      JOIN roles r ON r.id = rp.role_id
    `);
    const map: Record<string, Record<string, boolean[]>> = {};
    for (const row of result.rows) {
      if (!map[row.role_name]) map[row.role_name] = {};
      map[row.role_name][row.resource] = [
        row.can_view, row.can_create, row.can_edit, row.can_delete, row.can_approve,
      ];
    }
    permissionCache = map;
    permissionCacheTime = Date.now();
    return map;
  } catch {
    return {};
  }
}

export function clearPermissionCache(): void {
  permissionCache = null;
  permissionCacheTime = 0;
}

export async function can(
  user: AuthUser,
  action: PermissionAction,
  resource: string
): Promise<boolean> {
  if (user.role === "super_admin") return true;

  const actionIndex: Record<PermissionAction, number> = {
    view: 0, create: 1, edit: 2, delete: 3, approve: 4,
  };

  const rolePerms = await fetchRolePermissions();
  const resourcePerms = rolePerms[user.role]?.[resource];

  if (!resourcePerms) {
    if (user.role === "admin") return true;
    if (user.role === "guest") return false;
    return false;
  }

  return resourcePerms[actionIndex[action]] === true;
}

export async function requirePermission(
  user: AuthUser,
  action: PermissionAction,
  resource: string
): Promise<{ allowed: boolean; error?: any }> {
  const allowed = await can(user, action, resource);
  if (!allowed) {
    return {
      allowed: false,
      error: { error: `Permission denied: ${action} ${resource}` },
    };
  }
  return { allowed: true };
}

export async function hasAny(
  user: AuthUser,
  resource: string
): Promise<boolean> {
  if (user.role === "super_admin" || user.role === "admin") return true;
  const rolePerms = await fetchRolePermissions();
  const perms = rolePerms[user.role]?.[resource];
  if (!perms) return false;
  return perms.some(Boolean);
}

export function isGuest(user: AuthUser): boolean {
  return user.role === "guest";
}

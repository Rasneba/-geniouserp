import pool from "@/lib/db";

export type AuditAction =
  | "CREATE" | "UPDATE" | "DELETE"
  | "LOGIN" | "LOGOUT"
  | "APPROVE" | "REJECT" | "SUBMIT"
  | "EXPORT" | "PRINT";

export interface AuditEntry {
  company_id: number;
  user_id: number;
  action: AuditAction;
  table_name: string;
  record_id: number | string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
}

export async function logAudit(entry: AuditEntry): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO audit_logs
       (company_id, user_id, action, table_name, record_id, old_values, new_values, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        entry.company_id,
        entry.user_id,
        entry.action,
        entry.table_name,
        entry.record_id,
        entry.old_values ? JSON.stringify(entry.old_values) : null,
        entry.new_values ? JSON.stringify(entry.new_values) : null,
        entry.ip_address || null,
        entry.user_agent || null,
      ]
    );
  } catch (err) {
    console.error("Audit log failed:", err);
  }
}

export function extractChanges(oldRow: any, newRow: any): {
  old_values: Record<string, any>;
  new_values: Record<string, any>;
} {
  const old_values: Record<string, any> = {};
  const new_values: Record<string, any> = {};

  for (const key of Object.keys(newRow)) {
    if (key === "updated_at" || key === "created_at") continue;
    if (JSON.stringify(oldRow?.[key]) !== JSON.stringify(newRow[key])) {
      if (oldRow?.[key] !== undefined) old_values[key] = oldRow[key];
      new_values[key] = newRow[key];
    }
  }

  return { old_values, new_values };
}

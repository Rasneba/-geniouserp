import pool from "@/lib/db";

export interface IdDefinition {
  id: number;
  company_id: number;
  branch_id: number | null;
  entity_type: string;
  prefix: string;
  suffix: string;
  separator: string;
  pad_length: number;
  start_from: number;
  reset_type: "never" | "yearly" | "monthly" | "daily";
  pattern: string;
  is_active: boolean;
}

function getPeriodKey(resetType: string, date: Date): string {
  switch (resetType) {
    case "yearly": return String(date.getFullYear());
    case "monthly": return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    case "daily": return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    default: return "all";
  }
}

function formatId(def: IdDefinition, seqNum: number, branchCode: string, date: Date): string {
  const seq = String(seqNum).padStart(def.pad_length, "0");
  const year = date.getFullYear();
  const yy = String(year).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return def.pattern
    .replace(/\{PREFIX\}/g, def.prefix)
    .replace(/\{SEP\}/g, def.separator)
    .replace(/\{SEQ\}/g, seq)
    .replace(/\{SUFFIX\}/g, def.suffix || "")
    .replace(/\{BRANCH_CODE\}/g, branchCode)
    .replace(/\{YYYY\}/g, String(year))
    .replace(/\{YY\}/g, yy)
    .replace(/\{MM\}/g, mm)
    .replace(/\{DD\}/g, dd);
}

export async function generateSequentialId(
  table: string,
  column: string,
  prefix: string,
  padLength: number = 3
): Promise<string> {
  const result = await pool.query(
    `SELECT MAX(CAST(SUBSTRING(${column} FROM '${prefix}-([0-9]+)$') AS INTEGER)) AS max_id FROM ${table} WHERE ${column} ~ $1`,
    [`^${prefix}-\\d+$`]
  );
  const nextNum = (result.rows[0]?.max_id || 0) + 1;
  return `${prefix}-${String(nextNum).padStart(padLength, '0')}`;
}

export async function getNextId(
  entityType: string,
  companyId: number,
  branchId?: number | null
): Promise<string> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    let defResult = await client.query(
      `SELECT * FROM id_definitions
       WHERE company_id = $1 AND entity_type = $2 AND branch_id = $3 AND is_active = true
       LIMIT 1`,
      [companyId, entityType, branchId || null]
    );

    if (defResult.rows.length === 0) {
      defResult = await client.query(
        `SELECT * FROM id_definitions
         WHERE company_id = $1 AND entity_type = $2 AND branch_id IS NULL AND is_active = true
         LIMIT 1`,
        [companyId, entityType]
      );
    }

    if (defResult.rows.length === 0) {
      throw new Error(`No active ID definition found for entity type '${entityType}' in company ${companyId}`);
    }

    const def: IdDefinition = defResult.rows[0];
    const now = new Date();
    const periodKey = getPeriodKey(def.reset_type, now);

    const branchCode = await getBranchCode(client, def.branch_id || branchId);

    let seqResult = await client.query(
      `SELECT current_value FROM id_sequences
       WHERE definition_id = $1 AND period_key = $2
       FOR UPDATE`,
      [def.id, periodKey]
    );

    let nextVal: number;
    if (seqResult.rows.length === 0) {
      nextVal = def.start_from;
      await client.query(
        `INSERT INTO id_sequences (definition_id, company_id, branch_id, period_key, current_value)
         VALUES ($1, $2, $3, $4, $5)`,
        [def.id, companyId, def.branch_id || branchId || null, periodKey, nextVal]
      );
    } else {
      nextVal = seqResult.rows[0].current_value + 1;
      await client.query(
        `UPDATE id_sequences SET current_value = $1, updated_at = CURRENT_TIMESTAMP
         WHERE definition_id = $2 AND period_key = $3`,
        [nextVal, def.id, periodKey]
      );
    }

    await client.query("COMMIT");

    return formatId(def, nextVal, branchCode, now);
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

async function getBranchCode(client: any, branchId: number | null | undefined): Promise<string> {
  if (!branchId) return "";
  try {
    const res = await client.query("SELECT code FROM branches WHERE id = $1", [branchId]);
    return res.rows[0]?.code || "";
  } catch {
    return "";
  }
}

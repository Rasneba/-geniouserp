import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getAuthUser, unauthorized } from "@/lib/auth";

export async function POST(req: Request) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();

  try {
    const { device_id } = await req.json();

    if (!device_id) {
      return NextResponse.json({ error: "Device ID is required" }, { status: 400 });
    }

    const deviceRes = await pool.query("SELECT * FROM biometric_devices WHERE id = $1 AND is_active = true", [device_id]);
    if (deviceRes.rows.length === 0) {
      return NextResponse.json({ error: "Active device not found" }, { status: 404 });
    }

    const device = deviceRes.rows[0];
    let imported = 0;
    let errors: string[] = [];

    const { ZKLib } = await import("node-zklib");

    const zkInstance = new ZKLib(device.ip_address, device.port, 10000, 4000);

    try {
      await zkInstance.connect();
      await zkInstance.disableDevice();

      const logs = await zkInstance.getAttendances();
      const employees = await zkInstance.getUsers();

      const empMap = new Map<number, string>();
      if (employees?.data) {
        for (const emp of employees.data) {
          const pin = parseInt(emp.userId || emp.id || "0", 10);
          empMap.set(pin, emp.name || "");
        }
      }

      if (logs?.data && Array.isArray(logs.data)) {
        for (const record of logs.data) {
          try {
            const devicePin = parseInt(record.deviceUserId || record.userId || record.id || "0", 10);
            const punchTime = record.punchTime || record.recordTime || record.time || "";
            const punchDate = new Date(punchTime);

            if (!punchTime || isNaN(punchDate.getTime())) continue;

            const dateStr = punchDate.toISOString().split("T")[0];
            const timeStr = punchDate.toTimeString().split(" ")[0].slice(0, 5);

            const empResult = await pool.query(
              `SELECT id FROM employees WHERE biold = $1 OR code = $2`,
              [String(devicePin), String(devicePin)]
            );

            if (empResult.rows.length === 0) continue;

            const employeeId = empResult.rows[0].id;

            const existing = await pool.query(
              `SELECT id, time_in FROM attendance WHERE employee_id = $1 AND date = $2`,
              [employeeId, dateStr]
            );

            if (existing.rows.length === 0) {
              await pool.query(
                `INSERT INTO attendance (employee_id, date, time_in, status)
                 VALUES ($1, $2, $3, 'present')`,
                [employeeId, dateStr, timeStr]
              );
            } else if (!existing.rows[0].time_in) {
              await pool.query(
                `UPDATE attendance SET time_in = $1 WHERE id = $2`,
                [timeStr, existing.rows[0].id]
              );
            } else {
              await pool.query(
                `UPDATE attendance SET time_out = $1 WHERE id = $2`,
                [timeStr, existing.rows[0].id]
              );
            }

            imported++;
          } catch {
            errors.push(`Failed to import record`);
          }
        }
      }

      await zkInstance.enableDevice();
      await zkInstance.disconnect();

      await pool.query(
        `UPDATE biometric_devices SET last_sync = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [device_id]
      );
    } catch (err: any) {
      try { await zkInstance.disconnect(); } catch {}
      return NextResponse.json({
        error: `Failed to connect to device at ${device.ip_address}:${device.port}`,
        detail: err.message,
      }, { status: 502 });
    }

    return NextResponse.json({
      message: "Sync completed",
      device: device.name,
      imported,
      errors: errors.length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

import { runtimeDb } from "../runtime-db";

export type AuditAction =
  | "PAYMENT_WEBHOOK_RECEIVED"
  | "PAYMENT_WEBHOOK_REJECTED"
  | "PAYMENT_WEBHOOK_DUPLICATE"
  | "PAYMENT_CAPTURED"
  | "UPI_RECONCILIATION_VERIFIED"
  | "UPI_RECONCILIATION_APPROVED"
  | "UPI_RECONCILIATION_REJECTED"
  | "REVENUE_SPLIT_CREATED"
  | "QA_FAILURE"
  | "SCRIPT_DRAFT_SUBMITTED"
  | "SCRIPT_PROOF_REVIEWED";

export type AuditLogEntry = {
  id: string;
  action: AuditAction;
  actorId: string | null;
  subjectId: string | null;
  severity: "INFO" | "WARN" | "ERROR";
  payload: Record<string, unknown> | null;
  createdAt: string;
};

let auditInitialized = false;

export async function ensureAuditDb() {
  if (auditInitialized) return;
  await runtimeDb.execute(`
    CREATE TABLE IF NOT EXISTS audit_log (
      id TEXT PRIMARY KEY,
      action TEXT NOT NULL,
      actor_id TEXT,
      subject_id TEXT,
      severity TEXT NOT NULL,
      payload_json TEXT,
      created_at TEXT NOT NULL
    )
  `);
  auditInitialized = true;
}

export async function recordAudit(input: {
  action: AuditAction;
  actorId?: string | null;
  subjectId?: string | null;
  severity?: "INFO" | "WARN" | "ERROR";
  payload?: Record<string, unknown> | null;
}) {
  await ensureAuditDb();
  const entry: AuditLogEntry = {
    id: crypto.randomUUID(),
    action: input.action,
    actorId: input.actorId ?? null,
    subjectId: input.subjectId ?? null,
    severity: input.severity ?? "INFO",
    payload: input.payload ?? null,
    createdAt: new Date().toISOString()
  };
  await runtimeDb.execute({
    sql: `
      INSERT INTO audit_log (id, action, actor_id, subject_id, severity, payload_json, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    args: [entry.id, entry.action, entry.actorId, entry.subjectId, entry.severity, JSON.stringify(entry.payload), entry.createdAt]
  });
  return entry;
}

export async function listAuditLogs(limit = 50, actionPrefix?: string): Promise<AuditLogEntry[]> {
  await ensureAuditDb();
  const result = await runtimeDb.execute({
    sql: `
      SELECT id, action, actor_id, subject_id, severity, payload_json, created_at
      FROM audit_log
      ${actionPrefix ? "WHERE action LIKE ?" : ""}
      ORDER BY created_at DESC
      LIMIT ?
    `,
    args: actionPrefix ? [`${actionPrefix}%`, limit] : [limit]
  });
  return result.rows.map((row) => ({
    id: String(row.id),
    action: String(row.action) as AuditAction,
    actorId: row.actor_id ? String(row.actor_id) : null,
    subjectId: row.subject_id ? String(row.subject_id) : null,
    severity: String(row.severity) as "INFO" | "WARN" | "ERROR",
    payload: row.payload_json ? JSON.parse(String(row.payload_json)) : null,
    createdAt: String(row.created_at)
  }));
}

export async function countAuditLogs(action: AuditAction) {
  await ensureAuditDb();
  const result = await runtimeDb.execute({ sql: "SELECT COUNT(*) AS count FROM audit_log WHERE action = ?", args: [action] });
  return Number(result.rows[0]?.count ?? 0);
}

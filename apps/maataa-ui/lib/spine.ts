import { runtimeDb } from "./runtime-db";

export type SpineEventType =
  | "SCRIPT_VERIFIED"
  | "SKU_GENERATED"
  | "SKU_SUBMITTED_FOR_REVIEW"
  | "SKU_APPROVED"
  | "SKU_PUBLISHED"
  | "ORDER_PAID"
  | "ACCESS_UNLOCKED"
  | "PAYMENT_FAILED"
  | "UPI_RECONCILIATION_VERIFIED"
  | "UPI_RECONCILIATION_APPROVED"
  | "UPI_RECONCILIATION_REJECTED"
  | "REVENUE_SPLIT_CREATED"
  | "FONT_QA_COMPLETED"
  | "GLYPH_REVIEW_REQUIRED"
  | "PARTNERSHIP_INQUIRY_RECEIVED";

export type SpineAuditEvent = {
  id: string;
  eventType: SpineEventType;
  actorId: string | null;
  subjectId: string | null;
  payload: Record<string, unknown> | null;
  createdAt: string;
};

let spineInitialized = false;

export async function ensureSpineDb() {
  if (spineInitialized) return;
  await runtimeDb.execute(`
    CREATE TABLE IF NOT EXISTS spine_audit_log (
      id TEXT PRIMARY KEY,
      event_type TEXT NOT NULL,
      actor_id TEXT,
      subject_id TEXT,
      payload_json TEXT,
      created_at TEXT NOT NULL
    )
  `);
  await runtimeDb.execute(`
    CREATE TABLE IF NOT EXISTS spine_jobs (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'PENDING',
      attempts INTEGER NOT NULL DEFAULT 0,
      payload_json TEXT,
      last_error TEXT,
      run_after TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);
  spineInitialized = true;
}

export async function recordSpineEvent(input: {
  eventType: SpineEventType;
  actorId?: string | null;
  subjectId?: string | null;
  payload?: Record<string, unknown> | null;
}) {
  await ensureSpineDb();
  const event: SpineAuditEvent = {
    id: crypto.randomUUID(),
    eventType: input.eventType,
    actorId: input.actorId ?? null,
    subjectId: input.subjectId ?? null,
    payload: input.payload ?? null,
    createdAt: new Date().toISOString()
  };
  await runtimeDb.execute({
    sql: `
      INSERT INTO spine_audit_log (id, event_type, actor_id, subject_id, payload_json, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    args: [event.id, event.eventType, event.actorId, event.subjectId, JSON.stringify(event.payload), event.createdAt]
  });
  return event;
}

export async function listSpineAuditEvents(limit = 50): Promise<SpineAuditEvent[]> {
  await ensureSpineDb();
  const result = await runtimeDb.execute({
    sql: `
      SELECT id, event_type, actor_id, subject_id, payload_json, created_at
      FROM spine_audit_log
      ORDER BY created_at DESC
      LIMIT ?
    `,
    args: [limit]
  });
  return result.rows.map((row) => ({
    id: String(row.id),
    eventType: String(row.event_type) as SpineEventType,
    actorId: row.actor_id ? String(row.actor_id) : null,
    subjectId: row.subject_id ? String(row.subject_id) : null,
    payload: row.payload_json ? JSON.parse(String(row.payload_json)) : null,
    createdAt: String(row.created_at)
  }));
}

export async function enqueueSpineJob(type: SpineEventType, payload: Record<string, unknown>) {
  await ensureSpineDb();
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  await runtimeDb.execute({
    sql: `
      INSERT INTO spine_jobs (id, type, status, attempts, payload_json, run_after, created_at, updated_at)
      VALUES (?, ?, 'PENDING', 0, ?, ?, ?, ?)
    `,
    args: [id, type, JSON.stringify(payload), now, now, now]
  });
  return { id, type, status: "PENDING" as const };
}

export async function runDueSpineJobs(limit = 10) {
  await ensureSpineDb();
  const due = await runtimeDb.execute({
    sql: `
      SELECT id, type, payload_json FROM spine_jobs
      WHERE status IN ('PENDING', 'FAILED') AND run_after <= ?
      ORDER BY created_at ASC
      LIMIT ?
    `,
    args: [new Date().toISOString(), limit]
  });

  for (const row of due.rows) {
    const id = String(row.id);
    try {
      await runtimeDb.execute({ sql: "UPDATE spine_jobs SET status = 'RUNNING', attempts = attempts + 1 WHERE id = ?", args: [id] });
      await recordSpineEvent({
        eventType: String(row.type) as SpineEventType,
        subjectId: id,
        payload: row.payload_json ? JSON.parse(String(row.payload_json)) : null
      });
      await runtimeDb.execute({ sql: "UPDATE spine_jobs SET status = 'COMPLETED', updated_at = ? WHERE id = ?", args: [new Date().toISOString(), id] });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown job failure";
      await runtimeDb.execute({
        sql: "UPDATE spine_jobs SET status = 'FAILED', last_error = ?, run_after = ?, updated_at = ? WHERE id = ?",
        args: [message, new Date(Date.now() + 60_000).toISOString(), new Date().toISOString(), id]
      });
    }
  }

  return due.rows.length;
}

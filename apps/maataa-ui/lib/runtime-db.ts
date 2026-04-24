import { createClient } from "@libsql/client/node";

const databaseUrl = process.env.RUNTIME_DATABASE_URL ?? process.env.DATABASE_URL ?? "file:./.maataa-data/runtime.db";
const authToken = process.env.RUNTIME_DATABASE_AUTH_TOKEN ?? process.env.TURSO_AUTH_TOKEN;

export const runtimeDb = createClient({
  url: databaseUrl,
  authToken
});

let initialized = false;

export async function ensureRuntimeDb() {
  if (initialized) return;

  await runtimeDb.execute(`
    CREATE TABLE IF NOT EXISTS runtime_events (
      id TEXT PRIMARY KEY,
      source TEXT NOT NULL,
      type TEXT NOT NULL,
      state TEXT NOT NULL,
      time TEXT NOT NULL,
      payload_json TEXT
    )
  `);

  initialized = true;
}

export async function persistRuntimeEvent(event: Record<string, unknown>) {
  await ensureRuntimeDb();

  const id = String(event.id ?? crypto.randomUUID());
  const source = String(event.source ?? "runtime");
  const type = String(event.type ?? "runtime.event");
  const state = String(event.state ?? "ok");
  const time = String(event.time ?? new Date().toISOString());
  const payload_json = JSON.stringify(event);

  await runtimeDb.execute({
    sql: `
      INSERT OR REPLACE INTO runtime_events (id, source, type, state, time, payload_json)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    args: [id, source, type, state, time, payload_json]
  });

  return { id, source, type, state, time, payload_json };
}

export async function listRuntimeEvents(limit = 100) {
  await ensureRuntimeDb();

  const result = await runtimeDb.execute({
    sql: `
      SELECT id, source, type, state, time, payload_json
      FROM runtime_events
      ORDER BY time DESC
      LIMIT ?
    `,
    args: [limit]
  });

  return result.rows.map((row) => ({
    id: String((row as Record<string, unknown>).id),
    source: String((row as Record<string, unknown>).source),
    type: String((row as Record<string, unknown>).type),
    state: String((row as Record<string, unknown>).state),
    time: String((row as Record<string, unknown>).time),
    payload: (row as Record<string, unknown>).payload_json
      ? JSON.parse(String((row as Record<string, unknown>).payload_json))
      : null
  }));
}

import { appendFile, mkdir, readFile } from "fs/promises";
import { dirname, resolve } from "path";
import { randomUUID } from "crypto";

const databasePath = resolve(
  process.cwd(),
  process.env.RUNTIME_EVENTS_FILE ?? ".maataa-data/runtime-events.jsonl"
);

async function ensureRuntimeDb() {
  await mkdir(dirname(databasePath), { recursive: true });
}

export async function persistRuntimeEvent(event) {
  await ensureRuntimeDb();

  const normalized = {
    id: String(event.id ?? randomUUID()),
    correlationId: event.correlationId ?? null,
    parentEventId: event.parentEventId ?? null,
    source: String(event.source ?? "runtime"),
    type: String(event.type ?? "runtime.event"),
    state: String(event.state ?? "ok"),
    time: String(event.time ?? new Date().toISOString()),
    payload: event
  };

  await appendFile(databasePath, `${JSON.stringify(normalized)}\n`, "utf8");
  return normalized;
}

export async function listRuntimeEvents(limit = 100) {
  await ensureRuntimeDb();

  let content = "";
  try {
    content = await readFile(databasePath, "utf8");
  } catch {
    return [];
  }

  return content
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .sort((a, b) => Date.parse(b.time) - Date.parse(a.time))
    .slice(0, limit);
}

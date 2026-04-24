import { appendFile, mkdir, readFile, rename, writeFile } from "fs/promises";
import { dirname, resolve } from "path";
import { randomUUID } from "crypto";

const databasePath = resolve(
  process.cwd(),
  process.env.RUNTIME_EVENTS_FILE ?? ".maataa-data/runtime-events.jsonl"
);
const runtimeStatePath = resolve(
  process.cwd(),
  process.env.RUNTIME_STATE_FILE ?? ".maataa-data/runtime-state.json"
);
let runtimeStateWriteChain = Promise.resolve();

async function ensureRuntimeDb() {
  await mkdir(dirname(databasePath), { recursive: true });
}

async function ensureRuntimeStateDb() {
  await mkdir(dirname(runtimeStatePath), { recursive: true });
}

async function readRuntimeStateFile() {
  await ensureRuntimeStateDb();

  try {
    const content = await readFile(runtimeStatePath, "utf8");
    const parsed = JSON.parse(content);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

async function writeRuntimeStateFile(state) {
  await ensureRuntimeStateDb();

  const tempPath = `${runtimeStatePath}.tmp`;
  await writeFile(tempPath, JSON.stringify(state, null, 2), "utf8");
  await rename(tempPath, runtimeStatePath);
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

export async function persistRuntimeState(key, value) {
  const writeTask = runtimeStateWriteChain.then(async () => {
    const state = await readRuntimeStateFile();
    state[key] = value;
    await writeRuntimeStateFile(state);
  });

  runtimeStateWriteChain = writeTask.catch(() => {});
  return writeTask;
}

export async function getRuntimeState(key, fallback) {
  const state = await readRuntimeStateFile();
  return Object.prototype.hasOwnProperty.call(state, key) ? state[key] : fallback;
}

export async function listRuntimeState() {
  return readRuntimeStateFile();
}

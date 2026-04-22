import { promises as fs } from "node:fs";
import path from "node:path";
import type { ProofAnchorRecord } from "@/lib/anchor";

const STORE_DIR = path.join(process.cwd(), ".maataa-data");
const STORE_FILE = path.join(STORE_DIR, "anchors.json");

export type StoredAnchorRecord = ProofAnchorRecord & {
  id: string;
  createdAt: string;
};

async function ensureStore() {
  await fs.mkdir(STORE_DIR, { recursive: true });
  try {
    await fs.access(STORE_FILE);
  } catch {
    await fs.writeFile(STORE_FILE, "[]", "utf-8");
  }
}

export async function readAnchorStore(): Promise<StoredAnchorRecord[]> {
  await ensureStore();
  const raw = await fs.readFile(STORE_FILE, "utf-8");
  return JSON.parse(raw) as StoredAnchorRecord[];
}

export async function writeAnchorStore(records: StoredAnchorRecord[]): Promise<void> {
  await ensureStore();
  await fs.writeFile(STORE_FILE, JSON.stringify(records, null, 2), "utf-8");
}

export async function persistAnchorRecord(record: ProofAnchorRecord): Promise<StoredAnchorRecord> {
  const records = await readAnchorStore();
  const stored: StoredAnchorRecord = {
    ...record,
    id: `${Date.now()}-${record.merkleRoot.slice(0, 10)}`,
    createdAt: new Date().toISOString()
  };
  records.unshift(stored);
  await writeAnchorStore(records);
  return stored;
}

export async function findAnchorRecord(id: string): Promise<StoredAnchorRecord | null> {
  const records = await readAnchorStore();
  return records.find((record) => record.id === id) ?? null;
}

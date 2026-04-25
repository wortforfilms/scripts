import { ensureRuntimeDb, runtimeDb } from "./runtime-db";
import { recordSpineEvent } from "./spine";

export type PartnershipType = "INVESTOR" | "SPONSOR" | "CREATOR" | "AFFILIATE" | "PARTNER";

export type PartnershipInquiry = {
  id: string;
  type: PartnershipType;
  name: string;
  email: string;
  organization: string | null;
  intent: string;
  status: "NEW" | "REVIEW" | "APPROVED" | "DECLINED";
  createdAt: string;
};

let partnershipsInitialized = false;

export async function ensurePartnershipDb() {
  if (partnershipsInitialized) return;
  await ensureRuntimeDb();
  await runtimeDb.execute(`
    CREATE TABLE IF NOT EXISTS partnership_inquiries (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      organization TEXT,
      intent TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'NEW',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
  partnershipsInitialized = true;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function createPartnershipInquiry(input: {
  type: PartnershipType;
  name: string;
  email: string;
  organization?: string;
  intent: string;
}) {
  await ensurePartnershipDb();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await runtimeDb.execute({
    sql: `
      INSERT INTO partnership_inquiries (id, type, name, email, organization, intent, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'NEW', ?)
    `,
    args: [id, input.type, input.name.trim(), normalizeEmail(input.email), input.organization?.trim() || null, input.intent.trim(), now]
  });
  await recordSpineEvent({
    eventType: "PARTNERSHIP_INQUIRY_RECEIVED",
    subjectId: id,
    payload: { source: "partnership_inquiry", type: input.type, status: "NEW" }
  });
  return { id, status: "NEW" as const };
}

export async function listPartnershipInquiries(): Promise<PartnershipInquiry[]> {
  await ensurePartnershipDb();
  const result = await runtimeDb.execute(`
    SELECT id, type, name, email, organization, intent, status, created_at
    FROM partnership_inquiries
    ORDER BY created_at DESC
    LIMIT 100
  `);
  return result.rows.map((row) => ({
    id: String(row.id),
    type: String(row.type) as PartnershipType,
    name: String(row.name),
    email: String(row.email),
    organization: row.organization ? String(row.organization) : null,
    intent: String(row.intent),
    status: String(row.status) as PartnershipInquiry["status"],
    createdAt: String(row.created_at)
  }));
}

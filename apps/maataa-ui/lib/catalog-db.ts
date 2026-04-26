import { runtimeDb } from "./runtime-db";
import {
  approveSku,
  archiveSku,
  createDraftSkuState,
  publishSku,
  submitSkuForReview,
  type PublishStatus,
  type SkuState
} from "./catalog-policy";
import { createRevenueSplitLedger, ensureRevenueDb } from "./revenue/create-ledger";
import { recordSpineEvent } from "./spine";
import { recordAudit } from "./logging/audit";
import type { ScriptDirection, ScriptSystemType, VerificationStatus } from "./script-data";

export type CatalogSku = {
  id: string;
  code: string;
  productId: string;
  title: string;
  amountInPaise: number;
  currency: string;
  publishStatus: PublishStatus;
  isActive: boolean;
};

export type PaymentProvider = "razorpay" | "upi_manual";

export type ScriptProofStatus = "DRAFT" | "REVIEW" | "APPROVED" | "REJECTED";

export type ScriptProofSubmission = {
  id: string;
  slug: string;
  name: string;
  nativeName: string;
  direction: ScriptDirection;
  systemType: ScriptSystemType;
  verificationStatus: VerificationStatus;
  unicodeSupported: boolean;
  unicodeRanges: string[];
  fallbackGlyphAsset: string;
  sources: string[];
  evidenceNote: string;
  proofUrl: string | null;
  status: ScriptProofStatus;
  submittedBy: string;
  reviewedBy: string | null;
  reviewNote: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function quoteSkus(skuIds: string[]) {
  const publicSkus = await listSkus(true);
  const selected = publicSkus.filter((sku) => skuIds.includes(sku.id));
  if (selected.length !== skuIds.length) throw new Error("Cart contains unpublished or inactive SKUs");
  return {
    amountInPaise: selected.reduce((sum, sku) => sum + sku.amountInPaise, 0),
    currency: selected[0]?.currency ?? "INR",
    items: selected
  };
}

let catalogInitialized = false;

async function hasColumn(tableName: string, columnName: string) {
  const result = await runtimeDb.execute(`PRAGMA table_info(${tableName})`);
  return result.rows.some((row) => String(row.name) === columnName);
}

async function addColumnIfMissing(tableName: string, columnName: string, definition: string) {
  if (await hasColumn(tableName, columnName)) return;
  await runtimeDb.execute(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
}

export async function ensureCatalogDb() {
  if (catalogInitialized) return;
  await runtimeDb.execute(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      product_type TEXT NOT NULL,
      publish_status TEXT NOT NULL DEFAULT 'DRAFT',
      is_paid INTEGER NOT NULL DEFAULT 1,
      price_in_paise INTEGER NOT NULL,
      currency TEXT NOT NULL DEFAULT 'INR',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);
  await runtimeDb.execute(`
    CREATE TABLE IF NOT EXISTS skus (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      product_id TEXT NOT NULL,
      publish_status TEXT NOT NULL DEFAULT 'DRAFT',
      is_active INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);
  await runtimeDb.execute(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      status TEXT NOT NULL,
      amount_in_paise INTEGER NOT NULL,
      currency TEXT NOT NULL,
      payment_provider TEXT NOT NULL DEFAULT 'razorpay',
      provider_order_id TEXT UNIQUE,
      payment_reference TEXT,
      razorpay_order_id TEXT UNIQUE,
      items_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);
  await addColumnIfMissing("orders", "payment_provider", "TEXT NOT NULL DEFAULT 'razorpay'");
  await addColumnIfMissing("orders", "provider_order_id", "TEXT");
  await addColumnIfMissing("orders", "payment_reference", "TEXT");
  await runtimeDb.execute("CREATE UNIQUE INDEX IF NOT EXISTS orders_provider_order_id_unique ON orders(provider_order_id)");
  await runtimeDb.execute(`
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      provider TEXT NOT NULL,
      provider_payment_id TEXT,
      provider_order_id TEXT,
      status TEXT NOT NULL,
      signature_verified INTEGER NOT NULL DEFAULT 0,
      raw_event_json TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);
  await runtimeDb.execute(`
    CREATE TABLE IF NOT EXISTS user_access (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      order_id TEXT NOT NULL,
      granted_at TEXT NOT NULL,
      UNIQUE(user_id, product_id)
    )
  `);
  await runtimeDb.execute(`
    CREATE TABLE IF NOT EXISTS webhook_events (
      id TEXT PRIMARY KEY,
      provider TEXT NOT NULL,
      event_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      processed_at TEXT NOT NULL,
      UNIQUE(provider, event_id)
    )
  `);
  await runtimeDb.execute(`
    CREATE TABLE IF NOT EXISTS font_qa_runs (
      id TEXT PRIMARY KEY,
      status TEXT NOT NULL,
      checked_count INTEGER NOT NULL,
      failed_count INTEGER NOT NULL,
      errors_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `);
  await runtimeDb.execute(`
    CREATE TABLE IF NOT EXISTS upi_reconciliations (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      verified_by TEXT NOT NULL,
      reference TEXT NOT NULL,
      proof_url TEXT,
      note TEXT,
      status TEXT NOT NULL,
      approved_by TEXT,
      approved_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);
  await runtimeDb.execute(`
    CREATE TABLE IF NOT EXISTS script_proof_submissions (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL,
      name TEXT NOT NULL,
      native_name TEXT NOT NULL,
      direction TEXT NOT NULL,
      system_type TEXT NOT NULL,
      verification_status TEXT NOT NULL,
      unicode_supported INTEGER NOT NULL DEFAULT 0,
      unicode_ranges_json TEXT NOT NULL,
      fallback_glyph_asset TEXT NOT NULL,
      sources_json TEXT NOT NULL,
      evidence_note TEXT NOT NULL,
      proof_url TEXT,
      status TEXT NOT NULL DEFAULT 'DRAFT',
      submitted_by TEXT NOT NULL,
      reviewed_by TEXT,
      review_note TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);
  await ensureRevenueDb();
  catalogInitialized = true;
}

function parseLines(value: string) {
  return value.split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean);
}

function normalizeSlug(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function assertEnum<T extends string>(value: string, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

function rowToScriptProof(row: Record<string, unknown>): ScriptProofSubmission {
  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    nativeName: String(row.native_name),
    direction: String(row.direction) as ScriptDirection,
    systemType: String(row.system_type) as ScriptSystemType,
    verificationStatus: String(row.verification_status) as VerificationStatus,
    unicodeSupported: Boolean(Number(row.unicode_supported)),
    unicodeRanges: JSON.parse(String(row.unicode_ranges_json)) as string[],
    fallbackGlyphAsset: String(row.fallback_glyph_asset),
    sources: JSON.parse(String(row.sources_json)) as string[],
    evidenceNote: String(row.evidence_note),
    proofUrl: row.proof_url ? String(row.proof_url) : null,
    status: String(row.status) as ScriptProofStatus,
    submittedBy: String(row.submitted_by),
    reviewedBy: row.reviewed_by ? String(row.reviewed_by) : null,
    reviewNote: row.review_note ? String(row.review_note) : null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at)
  };
}

export async function createScriptProofSubmission(input: {
  slug: string;
  name: string;
  nativeName: string;
  direction: string;
  systemType: string;
  verificationStatus: string;
  unicodeSupported: boolean;
  unicodeRanges: string;
  fallbackGlyphAsset: string;
  sources: string;
  evidenceNote: string;
  proofUrl?: string | null;
  actorId: string;
}) {
  await ensureCatalogDb();
  const slug = normalizeSlug(input.slug);
  const name = input.name.trim();
  const nativeName = input.nativeName.trim();
  const fallbackGlyphAsset = input.fallbackGlyphAsset.trim();
  const evidenceNote = input.evidenceNote.trim();
  const sources = parseLines(input.sources);
  const unicodeRanges = parseLines(input.unicodeRanges);
  const verificationStatus = assertEnum(input.verificationStatus, ["UNVERIFIED", "PARTIAL"] as const, "UNVERIFIED");
  const direction = assertEnum(input.direction, ["LTR", "RTL", "TTB", "BTT", "MIXED"] as const, "LTR");
  const systemType = assertEnum(input.systemType, ["UNICODE_SCRIPT", "SPECIAL", "MANUSCRIPT_CHAIN", "TRANSMISSION"] as const, "UNICODE_SCRIPT");

  if (!slug) throw new Error("Script slug is required");
  if (!name) throw new Error("Script name is required");
  if (!nativeName) throw new Error("Native name is required");
  if (!fallbackGlyphAsset) throw new Error("Fallback glyph asset is required");
  if (sources.length === 0) throw new Error("At least one source is required");
  if (!evidenceNote) throw new Error("Evidence note is required");
  if (input.unicodeSupported && unicodeRanges.length === 0) throw new Error("Unicode ranges are required when Unicode support is claimed");
  if (unicodeRanges.some((range) => !/^U\+[0-9A-F]{4,6}(?:-U\+[0-9A-F]{4,6})?$/.test(range))) {
    throw new Error("Unicode ranges must use U+XXXX or U+XXXX-U+XXXX format");
  }

  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  await runtimeDb.execute({
    sql: `
      INSERT INTO script_proof_submissions (
        id, slug, name, native_name, direction, system_type, verification_status, unicode_supported,
        unicode_ranges_json, fallback_glyph_asset, sources_json, evidence_note, proof_url, status,
        submitted_by, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'DRAFT', ?, ?, ?)
    `,
    args: [
      id,
      slug,
      name,
      nativeName,
      direction,
      systemType,
      verificationStatus,
      input.unicodeSupported ? 1 : 0,
      JSON.stringify(unicodeRanges),
      fallbackGlyphAsset,
      JSON.stringify(sources),
      evidenceNote,
      input.proofUrl?.trim() || null,
      input.actorId,
      now,
      now
    ]
  });
  await recordAudit({
    action: "SCRIPT_DRAFT_SUBMITTED",
    actorId: input.actorId,
    subjectId: id,
    payload: { slug, verificationStatus, sources: sources.length, unicodeRanges: unicodeRanges.length }
  });
  await recordSpineEvent({ eventType: "SCRIPT_DRAFT_SUBMITTED", actorId: input.actorId, subjectId: id, payload: { slug, verificationStatus } });
  return { id, status: "DRAFT" as const };
}

export async function listScriptProofSubmissions(limit = 80) {
  await ensureCatalogDb();
  const result = await runtimeDb.execute({
    sql: `
      SELECT id, slug, name, native_name, direction, system_type, verification_status, unicode_supported,
        unicode_ranges_json, fallback_glyph_asset, sources_json, evidence_note, proof_url, status,
        submitted_by, reviewed_by, review_note, created_at, updated_at
      FROM script_proof_submissions
      ORDER BY created_at DESC
      LIMIT ?
    `,
    args: [limit]
  });
  return result.rows.map((row) => rowToScriptProof(row));
}

export async function reviewScriptProofSubmission(input: {
  id: string;
  action: "submit-review" | "approve" | "reject";
  actorId: string;
  reviewNote?: string;
}) {
  await ensureCatalogDb();
  const existing = await runtimeDb.execute({ sql: "SELECT id, status, slug, verification_status FROM script_proof_submissions WHERE id = ?", args: [input.id] });
  const row = existing.rows[0];
  if (!row) throw new Error("Script proof submission not found");
  const current = String(row.status) as ScriptProofStatus;
  const next =
    input.action === "submit-review"
      ? "REVIEW"
      : input.action === "approve"
        ? "APPROVED"
        : "REJECTED";
  if (input.action === "submit-review" && current !== "DRAFT") throw new Error("Only DRAFT submissions can enter review");
  if ((input.action === "approve" || input.action === "reject") && current !== "REVIEW") throw new Error("Only REVIEW submissions can be approved or rejected");
  if (input.action === "approve" && String(row.verification_status) === "VERIFIED") {
    throw new Error("Verified status is not assigned from draft proof submissions");
  }
  const now = new Date().toISOString();
  await runtimeDb.execute({
    sql: "UPDATE script_proof_submissions SET status = ?, reviewed_by = ?, review_note = COALESCE(?, review_note), updated_at = ? WHERE id = ?",
    args: [next, input.actorId, input.reviewNote?.trim() || null, now, input.id]
  });
  await recordAudit({
    action: "SCRIPT_PROOF_REVIEWED",
    actorId: input.actorId,
    subjectId: input.id,
    payload: { action: input.action, next, slug: String(row.slug) }
  });
  await recordSpineEvent({ eventType: "SCRIPT_PROOF_REVIEWED", actorId: input.actorId, subjectId: input.id, payload: { action: input.action, next } });
  return { id: input.id, status: next };
}

function rowToSku(row: Record<string, unknown>): CatalogSku {
  return {
    id: String(row.id),
    code: String(row.code),
    productId: String(row.product_id),
    title: String(row.title),
    amountInPaise: Number(row.price_in_paise),
    currency: String(row.currency),
    publishStatus: String(row.publish_status) as PublishStatus,
    isActive: Boolean(Number(row.is_active))
  };
}

export async function generateDraftSku(input: {
  productId?: string;
  title: string;
  description?: string;
  amountInPaise: number;
  actorId: string;
}) {
  await ensureCatalogDb();
  const now = new Date().toISOString();
  const productId = input.productId ?? crypto.randomUUID();
  const slug = input.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  await runtimeDb.execute({
    sql: `
      INSERT OR IGNORE INTO products (id, slug, title, description, product_type, publish_status, is_paid, price_in_paise, currency, created_at, updated_at)
      VALUES (?, ?, ?, ?, 'digital', 'DRAFT', 1, ?, 'INR', ?, ?)
    `,
    args: [productId, `${slug || "product"}-${productId.slice(0, 8)}`, input.title, input.description ?? "Draft digital product pending approval.", input.amountInPaise, now, now]
  });
  const sku = createDraftSkuState();
  const id = crypto.randomUUID();
  const code = `DRAFT-${Date.now()}-${id.slice(0, 8).toUpperCase()}`;
  await runtimeDb.execute({
    sql: `
      INSERT INTO skus (id, code, product_id, publish_status, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    args: [id, code, productId, sku.publishStatus, sku.isActive ? 1 : 0, now, now]
  });
  await recordSpineEvent({ eventType: "SKU_GENERATED", actorId: input.actorId, subjectId: id, payload: { code } });
  return { id, code, productId, ...sku };
}

export async function listSkus(publicOnly = false): Promise<CatalogSku[]> {
  await ensureCatalogDb();
  const where = publicOnly ? "WHERE s.publish_status = 'PUBLISHED' AND s.is_active = 1" : "";
  const result = await runtimeDb.execute(`
    SELECT s.id, s.code, s.product_id, s.publish_status, s.is_active, p.title, p.price_in_paise, p.currency
    FROM skus s
    JOIN products p ON p.id = s.product_id
    ${where}
    ORDER BY s.created_at DESC
  `);
  return result.rows.map((row) => rowToSku(row));
}

async function getSkuState(id: string): Promise<SkuState> {
  await ensureCatalogDb();
  const result = await runtimeDb.execute({ sql: "SELECT publish_status, is_active FROM skus WHERE id = ?", args: [id] });
  const row = result.rows[0];
  if (!row) throw new Error("SKU not found");
  return { publishStatus: String(row.publish_status) as PublishStatus, isActive: Boolean(Number(row.is_active)) };
}

async function updateSkuState(id: string, state: SkuState) {
  await runtimeDb.execute({
    sql: "UPDATE skus SET publish_status = ?, is_active = ?, updated_at = ? WHERE id = ?",
    args: [state.publishStatus, state.isActive ? 1 : 0, new Date().toISOString(), id]
  });
  return { id, ...state };
}

export async function transitionSku(id: string, action: "submit-review" | "approve" | "publish" | "archive", actorId: string) {
  const current = await getSkuState(id);
  const next =
    action === "submit-review"
      ? submitSkuForReview(current)
      : action === "approve"
        ? approveSku(current)
        : action === "publish"
          ? publishSku(current)
          : archiveSku(current);
  const updated = await updateSkuState(id, next);
  const eventType =
    action === "submit-review"
      ? "SKU_SUBMITTED_FOR_REVIEW"
      : action === "approve"
        ? "SKU_APPROVED"
        : action === "publish"
          ? "SKU_PUBLISHED"
          : "SKU_GENERATED";
  await recordSpineEvent({ eventType, actorId, subjectId: id, payload: { publishStatus: next.publishStatus, isActive: next.isActive } });
  return updated;
}

export async function createPendingOrder(input: {
  userId: string;
  skuIds: string[];
  provider?: PaymentProvider;
  providerOrderId?: string;
  paymentReference?: string | null;
  razorpayOrderId?: string;
}) {
  await ensureCatalogDb();
  const quote = await quoteSkus(input.skuIds);
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const provider = input.provider ?? "razorpay";
  const providerOrderId = input.providerOrderId ?? input.razorpayOrderId ?? `${provider}_${id.replaceAll("-", "").slice(0, 18)}`;
  const razorpayOrderId = provider === "razorpay" ? providerOrderId : null;
  await runtimeDb.execute({
    sql: `
      INSERT INTO orders (id, user_id, status, amount_in_paise, currency, payment_provider, provider_order_id, payment_reference, razorpay_order_id, items_json, created_at, updated_at)
      VALUES (?, ?, 'PENDING_PAYMENT', ?, 'INR', ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [id, input.userId, quote.amountInPaise, provider, providerOrderId, input.paymentReference ?? null, razorpayOrderId, JSON.stringify(quote.items), now, now]
  });
  return { id, provider, providerOrderId, paymentReference: input.paymentReference ?? null, razorpayOrderId, amountInPaise: quote.amountInPaise, currency: quote.currency, items: quote.items };
}

export async function markOrderPaidFromWebhook(input: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  eventId: string;
  rawEvent: unknown;
}) {
  await ensureCatalogDb();
  const eventType = (input.rawEvent as { event?: unknown }).event;
  const eventResult = await runtimeDb.execute({
    sql: `
      INSERT OR IGNORE INTO webhook_events (id, provider, event_id, event_type, processed_at)
      VALUES (?, 'razorpay', ?, ?, ?)
    `,
    args: [crypto.randomUUID(), input.eventId, typeof eventType === "string" ? eventType : "unknown", new Date().toISOString()]
  });
  if (eventResult.rowsAffected === 0) {
    await recordAudit({
      action: "PAYMENT_WEBHOOK_DUPLICATE",
      subjectId: input.razorpayOrderId,
      severity: "WARN",
      payload: { provider: "razorpay", eventId: input.eventId }
    });
    return { duplicate: true, orderId: null, unlocked: 0, ledgerEntries: 0 };
  }

  const orderResult = await runtimeDb.execute({
    sql: "SELECT id, user_id, status, amount_in_paise, currency, items_json FROM orders WHERE razorpay_order_id = ?",
    args: [input.razorpayOrderId]
  });
  const order = orderResult.rows[0];
  if (!order) throw new Error("Order not found");
  if (String(order.status) === "PAID") return { duplicate: true, orderId: String(order.id), unlocked: 0, ledgerEntries: 0 };
  const now = new Date().toISOString();
  await runtimeDb.execute({ sql: "UPDATE orders SET status = 'PAID', updated_at = ? WHERE id = ?", args: [now, String(order.id)] });
  const paymentId = crypto.randomUUID();
  await runtimeDb.execute({
    sql: `
      INSERT INTO payments (id, order_id, provider, provider_payment_id, provider_order_id, status, signature_verified, raw_event_json, created_at, updated_at)
      VALUES (?, ?, 'razorpay', ?, ?, 'CAPTURED', 1, ?, ?, ?)
    `,
    args: [paymentId, String(order.id), input.razorpayPaymentId, input.razorpayOrderId, JSON.stringify(input.rawEvent), now, now]
  });
  await recordSpineEvent({ eventType: "ORDER_PAID", subjectId: String(order.id), payload: { provider: "razorpay" } });
  await recordAudit({
    action: "PAYMENT_CAPTURED",
    subjectId: String(order.id),
    payload: { provider: "razorpay", eventId: input.eventId, paymentId: input.razorpayPaymentId }
  });
  const items = JSON.parse(String(order.items_json)) as CatalogSku[];
  for (const item of items) {
    await runtimeDb.execute({
      sql: "INSERT OR IGNORE INTO user_access (id, user_id, product_id, order_id, granted_at) VALUES (?, ?, ?, ?, ?)",
      args: [crypto.randomUUID(), String(order.user_id), item.productId, String(order.id), now]
    });
    await recordSpineEvent({ eventType: "ACCESS_UNLOCKED", subjectId: item.productId, payload: { orderId: String(order.id) } });
  }
  const ledger = await createRevenueSplitLedger({
    orderId: String(order.id),
    paymentId,
    amountInPaise: Number(order.amount_in_paise),
    currency: String(order.currency),
    productIds: items.map((item) => item.productId)
  });
  return { duplicate: false, orderId: String(order.id), unlocked: items.length, ledgerEntries: ledger.length };
}

export async function verifyUpiReconciliation(input: {
  orderId: string;
  reference: string;
  proofUrl?: string | null;
  actorId: string;
  note?: string;
}) {
  await ensureCatalogDb();
  const reference = input.reference.trim();
  const proofUrl = input.proofUrl?.trim() ?? "";
  if (!reference) throw new Error("UPI reference is required");
  if (!proofUrl) throw new Error("UPI proof URL is required");
  const orderResult = await runtimeDb.execute({
    sql: "SELECT id, status, payment_provider FROM orders WHERE id = ?",
    args: [input.orderId]
  });
  const order = orderResult.rows[0];
  if (!order) throw new Error("Order not found");
  if (String(order.payment_provider) !== "upi_manual") throw new Error("Order is not a manual UPI order");
  if (String(order.status) !== "PENDING_PAYMENT") throw new Error("Only pending UPI orders can be verified");

  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  await runtimeDb.execute({
    sql: `
      INSERT INTO upi_reconciliations (id, order_id, verified_by, reference, proof_url, note, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, 'VERIFIED', ?, ?)
    `,
    args: [id, input.orderId, input.actorId, reference, proofUrl, input.note ?? null, now, now]
  });
  await recordAudit({
    action: "UPI_RECONCILIATION_VERIFIED",
    actorId: input.actorId,
    subjectId: input.orderId,
    payload: { reconciliationId: id, reference, proofUrl }
  });
  await recordSpineEvent({ eventType: "UPI_RECONCILIATION_VERIFIED", actorId: input.actorId, subjectId: input.orderId, payload: { reconciliationId: id } });
  return { id, orderId: input.orderId, status: "VERIFIED" as const };
}

export async function approveUpiReconciliation(input: { reconciliationId: string; actorId: string; note?: string }) {
  await ensureCatalogDb();
  const reconciliationResult = await runtimeDb.execute({
    sql: "SELECT id, order_id, reference, status FROM upi_reconciliations WHERE id = ?",
    args: [input.reconciliationId]
  });
  const reconciliation = reconciliationResult.rows[0];
  if (!reconciliation) throw new Error("UPI reconciliation not found");
  if (String(reconciliation.status) !== "VERIFIED") throw new Error("UPI reconciliation must be VERIFIED before approval");
  const orderResult = await runtimeDb.execute({
    sql: "SELECT id, user_id, status, amount_in_paise, currency, items_json, payment_provider, provider_order_id, payment_reference FROM orders WHERE id = ?",
    args: [String(reconciliation.order_id)]
  });
  const order = orderResult.rows[0];
  if (!order) throw new Error("Order not found");
  if (String(order.payment_provider) !== "upi_manual") throw new Error("Order is not a manual UPI order");
  if (String(order.status) === "PAID") return { duplicate: true, orderId: String(order.id), unlocked: 0, ledgerEntries: 0 };

  const now = new Date().toISOString();
  await runtimeDb.execute({
    sql: "UPDATE upi_reconciliations SET status = 'APPROVED', approved_by = ?, approved_at = ?, note = COALESCE(?, note), updated_at = ? WHERE id = ?",
    args: [input.actorId, now, input.note ?? null, now, input.reconciliationId]
  });
  await runtimeDb.execute({ sql: "UPDATE orders SET status = 'PAID', updated_at = ? WHERE id = ?", args: [now, String(order.id)] });
  const paymentId = crypto.randomUUID();
  await runtimeDb.execute({
    sql: `
      INSERT INTO payments (id, order_id, provider, provider_payment_id, provider_order_id, status, signature_verified, raw_event_json, created_at, updated_at)
      VALUES (?, ?, 'upi_manual', ?, ?, 'CAPTURED', 1, ?, ?, ?)
    `,
    args: [
      paymentId,
      String(order.id),
      String(reconciliation.reference),
      String(order.provider_order_id),
      JSON.stringify({
        approvedBy: input.actorId,
        provider: "upi_manual",
        reconciliationId: input.reconciliationId,
        reference: order.payment_reference ? String(order.payment_reference) : null,
        note: input.note ?? null
      }),
      now,
      now
    ]
  });
  await recordSpineEvent({ eventType: "ORDER_PAID", actorId: input.actorId, subjectId: String(order.id), payload: { provider: "upi_manual" } });
  await recordAudit({
    action: "UPI_RECONCILIATION_APPROVED",
    actorId: input.actorId,
    subjectId: String(order.id),
    payload: { reconciliationId: input.reconciliationId, reference: reconciliation.reference ? String(reconciliation.reference) : null }
  });
  await recordSpineEvent({ eventType: "UPI_RECONCILIATION_APPROVED", actorId: input.actorId, subjectId: String(order.id), payload: { reconciliationId: input.reconciliationId } });
  const items = JSON.parse(String(order.items_json)) as CatalogSku[];
  for (const item of items) {
    await runtimeDb.execute({
      sql: "INSERT OR IGNORE INTO user_access (id, user_id, product_id, order_id, granted_at) VALUES (?, ?, ?, ?, ?)",
      args: [crypto.randomUUID(), String(order.user_id), item.productId, String(order.id), now]
    });
    await recordSpineEvent({ eventType: "ACCESS_UNLOCKED", actorId: input.actorId, subjectId: item.productId, payload: { orderId: String(order.id), provider: "upi_manual" } });
  }
  const ledger = await createRevenueSplitLedger({
    orderId: String(order.id),
    paymentId,
    amountInPaise: Number(order.amount_in_paise),
    currency: String(order.currency),
    productIds: items.map((item) => item.productId)
  });
  return { duplicate: false, orderId: String(order.id), unlocked: items.length, ledgerEntries: ledger.length };
}

export async function rejectUpiReconciliation(input: { reconciliationId: string; actorId: string; note: string }) {
  await ensureCatalogDb();
  if (!input.note.trim()) throw new Error("Rejection note is required");
  const result = await runtimeDb.execute({
    sql: "UPDATE upi_reconciliations SET status = 'REJECTED', note = ?, updated_at = ? WHERE id = ? AND status = 'VERIFIED'",
    args: [input.note.trim(), new Date().toISOString(), input.reconciliationId]
  });
  if (result.rowsAffected === 0) throw new Error("Only VERIFIED UPI reconciliations can be rejected");
  await recordAudit({
    action: "UPI_RECONCILIATION_REJECTED",
    actorId: input.actorId,
    subjectId: input.reconciliationId,
    severity: "WARN",
    payload: { note: input.note.trim() }
  });
  await recordSpineEvent({ eventType: "UPI_RECONCILIATION_REJECTED", actorId: input.actorId, subjectId: input.reconciliationId, payload: { note: input.note.trim() } });
  return { id: input.reconciliationId, status: "REJECTED" as const };
}

export async function listUpiReconciliations(limit = 50) {
  await ensureCatalogDb();
  const result = await runtimeDb.execute({
    sql: `
      SELECT id, order_id, verified_by, reference, proof_url, note, status, approved_by, approved_at, created_at, updated_at
      FROM upi_reconciliations
      ORDER BY created_at DESC
      LIMIT ?
    `,
    args: [limit]
  });
  return result.rows.map((row) => ({
    id: String(row.id),
    orderId: String(row.order_id),
    verifiedBy: String(row.verified_by),
    reference: String(row.reference),
    proofUrl: row.proof_url ? String(row.proof_url) : null,
    note: row.note ? String(row.note) : null,
    status: String(row.status),
    approvedBy: row.approved_by ? String(row.approved_by) : null,
    approvedAt: row.approved_at ? String(row.approved_at) : null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at)
  }));
}

export async function recordFontQaRun(input: { ok: boolean; checkedCount: number; errors: string[] }) {
  await ensureCatalogDb();
  const id = crypto.randomUUID();
  await runtimeDb.execute({
    sql: `
      INSERT INTO font_qa_runs (id, status, checked_count, failed_count, errors_json, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    args: [
      id,
      input.ok ? "PASSED" : "FAILED",
      input.checkedCount,
      input.errors.length,
      JSON.stringify(input.errors),
      new Date().toISOString()
    ]
  });
  await recordSpineEvent({
    eventType: "FONT_QA_COMPLETED",
    subjectId: id,
    payload: { status: input.ok ? "PASSED" : "FAILED", failedCount: input.errors.length }
  });
  if (!input.ok) {
    await recordSpineEvent({
      eventType: "GLYPH_REVIEW_REQUIRED",
      subjectId: id,
      payload: { failedCount: input.errors.length }
    });
  }
  return { id, status: input.ok ? "PASSED" : "FAILED" };
}

export async function listUserAccess(userId: string) {
  await ensureCatalogDb();
  const result = await runtimeDb.execute({
    sql: "SELECT product_id, order_id, granted_at FROM user_access WHERE user_id = ? ORDER BY granted_at DESC",
    args: [userId]
  });
  return result.rows.map((row) => ({
    productId: String(row.product_id),
    orderId: String(row.order_id),
    grantedAt: String(row.granted_at)
  }));
}

export async function listFinanceSummary() {
  await ensureCatalogDb();
  const orders = await runtimeDb.execute(`
    SELECT id, user_id, status, amount_in_paise, currency, payment_provider, provider_order_id, payment_reference, razorpay_order_id, created_at, updated_at
    FROM orders
    ORDER BY created_at DESC
    LIMIT 50
  `);
  const payments = await runtimeDb.execute(`
    SELECT order_id, provider, provider_payment_id, provider_order_id, status, signature_verified, created_at
    FROM payments
    ORDER BY created_at DESC
    LIMIT 50
  `);
  const webhooks = await runtimeDb.execute(`
    SELECT provider, event_id, event_type, processed_at
    FROM webhook_events
    ORDER BY processed_at DESC
    LIMIT 50
  `);
  const access = await runtimeDb.execute(`
    SELECT user_id, product_id, order_id, granted_at
    FROM user_access
    ORDER BY granted_at DESC
    LIMIT 50
  `);
  const upiReconciliations = await listUpiReconciliations();
  return {
    orders: orders.rows.map((row) => ({
      id: String(row.id),
      userId: String(row.user_id),
      status: String(row.status),
      amountInPaise: Number(row.amount_in_paise),
      currency: String(row.currency),
      paymentProvider: row.payment_provider ? String(row.payment_provider) : "razorpay",
      providerOrderId: row.provider_order_id ? String(row.provider_order_id) : null,
      paymentReference: row.payment_reference ? String(row.payment_reference) : null,
      razorpayOrderId: row.razorpay_order_id ? String(row.razorpay_order_id) : null,
      createdAt: String(row.created_at),
      updatedAt: String(row.updated_at)
    })),
    payments: payments.rows.map((row) => ({
      orderId: String(row.order_id),
      provider: String(row.provider),
      providerPaymentId: row.provider_payment_id ? String(row.provider_payment_id) : null,
      providerOrderId: row.provider_order_id ? String(row.provider_order_id) : null,
      status: String(row.status),
      signatureVerified: Boolean(Number(row.signature_verified)),
      createdAt: String(row.created_at)
    })),
    webhooks: webhooks.rows.map((row) => ({
      provider: String(row.provider),
      eventId: String(row.event_id),
      eventType: String(row.event_type),
      processedAt: String(row.processed_at)
    })),
    access: access.rows.map((row) => ({
      userId: String(row.user_id),
      productId: String(row.product_id),
      orderId: String(row.order_id),
      grantedAt: String(row.granted_at)
    })),
    upiReconciliations
  };
}

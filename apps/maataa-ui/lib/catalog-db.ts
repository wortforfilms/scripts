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
import { recordSpineEvent } from "./spine";

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
      razorpay_order_id TEXT UNIQUE,
      items_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);
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
  catalogInitialized = true;
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

export async function createPendingOrder(input: { userId: string; skuIds: string[]; razorpayOrderId?: string }) {
  await ensureCatalogDb();
  const quote = await quoteSkus(input.skuIds);
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const razorpayOrderId = input.razorpayOrderId ?? `order_test_${id.replaceAll("-", "").slice(0, 18)}`;
  await runtimeDb.execute({
    sql: `
      INSERT INTO orders (id, user_id, status, amount_in_paise, currency, razorpay_order_id, items_json, created_at, updated_at)
      VALUES (?, ?, 'PENDING_PAYMENT', ?, 'INR', ?, ?, ?, ?)
    `,
    args: [id, input.userId, quote.amountInPaise, razorpayOrderId, JSON.stringify(quote.items), now, now]
  });
  return { id, razorpayOrderId, amountInPaise: quote.amountInPaise, currency: quote.currency, items: quote.items };
}

export async function markOrderPaidFromWebhook(input: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  rawEvent: unknown;
}) {
  await ensureCatalogDb();
  const orderResult = await runtimeDb.execute({
    sql: "SELECT id, user_id, items_json FROM orders WHERE razorpay_order_id = ?",
    args: [input.razorpayOrderId]
  });
  const order = orderResult.rows[0];
  if (!order) throw new Error("Order not found");
  const now = new Date().toISOString();
  await runtimeDb.execute({ sql: "UPDATE orders SET status = 'PAID', updated_at = ? WHERE id = ?", args: [now, String(order.id)] });
  await runtimeDb.execute({
    sql: `
      INSERT INTO payments (id, order_id, provider, provider_payment_id, provider_order_id, status, signature_verified, raw_event_json, created_at, updated_at)
      VALUES (?, ?, 'razorpay', ?, ?, 'CAPTURED', 1, ?, ?, ?)
    `,
    args: [crypto.randomUUID(), String(order.id), input.razorpayPaymentId, input.razorpayOrderId, JSON.stringify(input.rawEvent), now, now]
  });
  await recordSpineEvent({ eventType: "ORDER_PAID", subjectId: String(order.id), payload: { provider: "razorpay" } });
  const items = JSON.parse(String(order.items_json)) as CatalogSku[];
  for (const item of items) {
    await runtimeDb.execute({
      sql: "INSERT OR IGNORE INTO user_access (id, user_id, product_id, order_id, granted_at) VALUES (?, ?, ?, ?, ?)",
      args: [crypto.randomUUID(), String(order.user_id), item.productId, String(order.id), now]
    });
    await recordSpineEvent({ eventType: "ACCESS_UNLOCKED", subjectId: item.productId, payload: { orderId: String(order.id) } });
  }
  return { orderId: String(order.id), unlocked: items.length };
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

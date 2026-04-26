import { runtimeDb } from "../runtime-db";
import { recordSpineEvent } from "../spine";
import { recordAudit } from "../logging/audit";
import { calculateSplits, type RevenueSplitRule } from "./calculate-splits";

let revenueInitialized = false;

export async function ensureRevenueDb() {
  if (revenueInitialized) return;
  await runtimeDb.execute(`
    CREATE TABLE IF NOT EXISTS revenue_split_rules (
      id TEXT PRIMARY KEY,
      scope_type TEXT NOT NULL,
      scope_id TEXT NOT NULL,
      party TEXT NOT NULL,
      account_id TEXT,
      basis_points INTEGER NOT NULL,
      requires_admin_approval INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await runtimeDb.execute(`
    CREATE TABLE IF NOT EXISTS revenue_split_ledger (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      payment_id TEXT NOT NULL,
      party TEXT NOT NULL,
      account_id TEXT,
      basis_points INTEGER NOT NULL,
      amount_in_paise INTEGER NOT NULL,
      currency TEXT NOT NULL,
      transfer_status TEXT NOT NULL DEFAULT 'PENDING_ADMIN_APPROVAL',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
  revenueInitialized = true;
}

export async function getRevenueSplitRules(productIds: string[]): Promise<RevenueSplitRule[]> {
  await ensureRevenueDb();
  if (productIds.length === 0) return [{ party: "PLATFORM", accountId: null, basisPoints: 10_000 }];
  const result = await runtimeDb.execute({
    sql: `
      SELECT party, account_id, basis_points
      FROM revenue_split_rules
      WHERE scope_type = 'PRODUCT' AND scope_id IN (${productIds.map(() => "?").join(",")})
      ORDER BY created_at ASC
    `,
    args: productIds
  });
  if (result.rows.length === 0) return [{ party: "PLATFORM", accountId: null, basisPoints: 10_000 }];
  return result.rows.map((row) => ({
    party: String(row.party) as RevenueSplitRule["party"],
    accountId: row.account_id ? String(row.account_id) : null,
    basisPoints: Number(row.basis_points)
  }));
}

export async function createRevenueSplitLedger(input: {
  orderId: string;
  paymentId: string;
  amountInPaise: number;
  currency: string;
  productIds: string[];
}) {
  await ensureRevenueDb();
  const rules = await getRevenueSplitRules(input.productIds);
  const splits = calculateSplits(input.amountInPaise, rules);
  const now = new Date().toISOString();
  for (const split of splits) {
    await runtimeDb.execute({
      sql: `
        INSERT INTO revenue_split_ledger
          (id, order_id, payment_id, party, account_id, basis_points, amount_in_paise, currency, transfer_status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDING_ADMIN_APPROVAL', ?)
      `,
      args: [
        crypto.randomUUID(),
        input.orderId,
        input.paymentId,
        split.party,
        split.accountId,
        split.basisPoints,
        split.amountInPaise,
        input.currency,
        now
      ]
    });
  }
  await recordSpineEvent({
    eventType: "REVENUE_SPLIT_CREATED",
    subjectId: input.orderId,
    payload: { splitCount: splits.length, transferStatus: "PENDING_ADMIN_APPROVAL" }
  });
  await recordAudit({
    action: "REVENUE_SPLIT_CREATED",
    subjectId: input.orderId,
    payload: { splitCount: splits.length, transferStatus: "PENDING_ADMIN_APPROVAL", amountInPaise: input.amountInPaise, currency: input.currency }
  });
  return splits;
}

export async function listRevenueLedger(orderId?: string) {
  await ensureRevenueDb();
  const result = await runtimeDb.execute({
    sql: `
      SELECT order_id, payment_id, party, account_id, basis_points, amount_in_paise, currency, transfer_status, created_at
      FROM revenue_split_ledger
      ${orderId ? "WHERE order_id = ?" : ""}
      ORDER BY created_at DESC
    `,
    args: orderId ? [orderId] : []
  });
  return result.rows.map((row) => ({
    orderId: String(row.order_id),
    paymentId: String(row.payment_id),
    party: String(row.party),
    accountId: row.account_id ? String(row.account_id) : null,
    basisPoints: Number(row.basis_points),
    amountInPaise: Number(row.amount_in_paise),
    currency: String(row.currency),
    transferStatus: String(row.transfer_status),
    createdAt: String(row.created_at)
  }));
}

ALTER TABLE OrderRecord ADD COLUMN paymentProvider TEXT NOT NULL DEFAULT 'razorpay';
ALTER TABLE OrderRecord ADD COLUMN providerOrderId TEXT;
ALTER TABLE OrderRecord ADD COLUMN paymentReference TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS OrderRecord_providerOrderId_key ON OrderRecord(providerOrderId);

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
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  actor_id TEXT,
  subject_id TEXT,
  severity TEXT NOT NULL,
  payload_json TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

import type { AccessViewer, AccountRole, AccountType, UserPlan, UserRole } from "../access/types";
import { ensureRuntimeDb, runtimeDb } from "../runtime-db";
import { hashPassword, verifyPassword } from "./password";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  plan: UserPlan;
  permissions: string[];
  accountId: string;
  accountType: AccountType;
  accountRole: AccountRole;
};

type AuthUserRow = {
  id: unknown;
  email: unknown;
  name: unknown;
  password_hash: unknown;
  password_salt: unknown;
  role: unknown;
  plan: unknown;
  permissions_json: unknown;
  account_id: unknown;
  account_type: unknown;
  account_role: unknown;
};

let authInitialized = false;

export async function ensureAuthDb() {
  if (authInitialized) return;
  await ensureRuntimeDb();
  await runtimeDb.execute(`
    CREATE TABLE IF NOT EXISTS auth_users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      password_salt TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'USER',
      plan TEXT NOT NULL DEFAULT 'FREE',
      permissions_json TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await runtimeDb.execute(`
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      plan TEXT NOT NULL DEFAULT 'FREE',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await runtimeDb.execute(`
    CREATE TABLE IF NOT EXISTS user_accounts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      account_id TEXT NOT NULL,
      account_role TEXT NOT NULL,
      is_default INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, account_id)
    )
  `);
  authInitialized = true;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function parsePermissions(value: unknown) {
  if (typeof value !== "string") return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) && parsed.every((item) => typeof item === "string") ? parsed : [];
  } catch {
    return [];
  }
}

function rowToAuthUser(row: AuthUserRow): AuthUser {
  return {
    id: String(row.id),
    email: String(row.email),
    name: String(row.name),
    role: String(row.role) as UserRole,
    plan: String(row.plan) as UserPlan,
    permissions: parsePermissions(row.permissions_json),
    accountId: String(row.account_id),
    accountType: String(row.account_type) as AccountType,
    accountRole: String(row.account_role) as AccountRole
  };
}

function viewerFromAuthUser(user: AuthUser): AccessViewer {
  return {
    id: user.id,
    userId: user.id,
    accountId: user.accountId,
    accountType: user.accountType,
    accountRole: user.accountRole,
    role: user.role,
    plan: user.plan,
    permissions: user.permissions,
    isLoggedIn: true
  };
}

function bootstrapAccessFor(email: string): Pick<AuthUser, "role" | "plan" | "permissions"> {
  const bootstrapEmail = process.env.AUTH_BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
  if (bootstrapEmail && normalizeEmail(email) === bootstrapEmail) {
    return { role: "SUPER_ADMIN", plan: "ENTERPRISE", permissions: ["catalog-admin", "catalog-review"] };
  }
  return { role: "USER", plan: "FREE", permissions: [] };
}

export async function createAuthUser(input: { email: string; name: string; password: string }) {
  await ensureAuthDb();
  const email = normalizeEmail(input.email);
  const id = `user_${crypto.randomUUID()}`;
  const accountId = `acct_${crypto.randomUUID()}`;
  const password = await hashPassword(input.password);
  const access = bootstrapAccessFor(email);

  try {
    await runtimeDb.execute({
      sql: `
        INSERT INTO auth_users (id, email, name, password_hash, password_salt, role, plan, permissions_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [id, email, input.name.trim(), password.passwordHash, password.salt, access.role, access.plan, JSON.stringify(access.permissions)]
    });
    await runtimeDb.execute({
      sql: "INSERT INTO accounts (id, name, type, plan) VALUES (?, ?, 'INDIVIDUAL', ?)",
      args: [accountId, input.name.trim(), access.plan]
    });
    await runtimeDb.execute({
      sql: "INSERT INTO user_accounts (id, user_id, account_id, account_role, is_default) VALUES (?, ?, ?, 'OWNER', 1)",
      args: [crypto.randomUUID(), id, accountId]
    });
  } catch {
    throw new Error("An account already exists for this email");
  }

  return {
    user: {
      id,
      email,
      name: input.name.trim(),
      role: access.role,
      plan: access.plan,
      permissions: access.permissions,
      accountId,
      accountType: "INDIVIDUAL",
      accountRole: "OWNER"
    },
    viewer: viewerFromAuthUser({
      id,
      email,
      name: input.name.trim(),
      role: access.role,
      plan: access.plan,
      permissions: access.permissions,
      accountId,
      accountType: "INDIVIDUAL",
      accountRole: "OWNER"
    })
  };
}

export async function authenticateWithPassword(input: { email: string; password: string }) {
  await ensureAuthDb();
  const result = await runtimeDb.execute({
    sql: `
      SELECT u.id, u.email, u.name, u.password_hash, u.password_salt, u.role, u.plan, u.permissions_json,
             a.id AS account_id, a.type AS account_type, ua.account_role
      FROM auth_users u
      JOIN user_accounts ua ON ua.user_id = u.id AND ua.is_default = 1
      JOIN accounts a ON a.id = ua.account_id
      WHERE u.email = ?
      LIMIT 1
    `,
    args: [normalizeEmail(input.email)]
  });
  const row = result.rows[0] as unknown as AuthUserRow | undefined;
  if (!row) return null;
  const ok = await verifyPassword(input.password, String(row.password_salt), String(row.password_hash));
  if (!ok) return null;
  const user = rowToAuthUser(row);
  return { user, viewer: viewerFromAuthUser(user) };
}

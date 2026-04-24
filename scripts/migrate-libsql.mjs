import { createClient } from "@libsql/client";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const databaseUrl = process.env.DATABASE_URL ?? process.env.RUNTIME_DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL or RUNTIME_DATABASE_URL is required");

const db = createClient({
  url: databaseUrl,
  authToken: process.env.TURSO_AUTH_TOKEN ?? process.env.RUNTIME_DATABASE_AUTH_TOKEN
});

await db.execute(`
  CREATE TABLE IF NOT EXISTS _maataa_migrations (
    id TEXT PRIMARY KEY,
    applied_at TEXT NOT NULL
  )
`);

const migrationsRoot = join(process.cwd(), "prisma", "migrations");
const migrations = (await readdir(migrationsRoot, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

for (const migration of migrations) {
  const applied = await db.execute({ sql: "SELECT id FROM _maataa_migrations WHERE id = ?", args: [migration] });
  if (applied.rows.length > 0) continue;
  const sql = await readFile(join(migrationsRoot, migration, "migration.sql"), "utf8");
  for (const statement of sql.split(/;\s*$/m).map((part) => part.trim()).filter(Boolean)) {
    await db.execute(statement);
  }
  await db.execute({ sql: "INSERT INTO _maataa_migrations (id, applied_at) VALUES (?, ?)", args: [migration, new Date().toISOString()] });
  console.log(`applied ${migration}`);
}

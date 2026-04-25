import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createRequire } from "node:module";

const requireFromApp = createRequire(new URL("../apps/maataa-ui/package.json", import.meta.url));
const { createClient } = requireFromApp("@libsql/client");

const databaseUrl = process.env.DATABASE_URL ?? process.env.RUNTIME_DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL or RUNTIME_DATABASE_URL is required");

const buildDir = mkdtempSync(join(tmpdir(), "maataa-scripts-seed-"));
const tsconfigPath = join(buildDir, "tsconfig.json");
writeFileSync(
  tsconfigPath,
  JSON.stringify({
    compilerOptions: {
      target: "ES2022",
      module: "CommonJS",
      moduleResolution: "Node",
      resolveJsonModule: true,
      esModuleInterop: true,
      strict: true,
      skipLibCheck: true,
      outDir: join(buildDir, "dist")
    },
    include: [join(process.cwd(), "packages", "scripts-data", "src", "**", "*.ts")]
  })
);
execFileSync("pnpm", ["--dir", "apps/maataa-ui", "exec", "tsc", "-p", tsconfigPath], { stdio: "inherit" });
const require = createRequire(import.meta.url);
const { validateScriptsSeed } = require(join(buildDir, "dist", "validate-scripts.js"));
const { verifiedScriptsSeed } = require(join(buildDir, "dist", "verified-scripts.seed.js"));

validateScriptsSeed();

const db = createClient({
  url: databaseUrl,
  authToken: process.env.TURSO_AUTH_TOKEN ?? process.env.RUNTIME_DATABASE_AUTH_TOKEN
});

for (const script of verifiedScriptsSeed) {
  await db.execute({
    sql: `
      INSERT INTO Script (id, slug, name, nativeName, verifiedUnicodeSample, fallbackGlyphAsset, family, parentId, region, eraStart, eraEnd, direction, verificationStatus, publishStatus, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'DRAFT', ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        slug = excluded.slug,
        name = excluded.name,
        nativeName = excluded.nativeName,
        verifiedUnicodeSample = excluded.verifiedUnicodeSample,
        fallbackGlyphAsset = excluded.fallbackGlyphAsset,
        family = excluded.family,
        parentId = excluded.parentId,
        region = excluded.region,
        eraStart = excluded.eraStart,
        eraEnd = excluded.eraEnd,
        direction = excluded.direction,
        verificationStatus = excluded.verificationStatus,
        updatedAt = excluded.updatedAt
    `,
    args: [
      script.id,
      script.slug,
      script.name,
      script.nativeName,
      script.verifiedUnicodeSample,
      script.fallbackGlyphAsset,
      script.family,
      script.parentId,
      script.region,
      script.eraStart,
      script.eraEnd,
      script.direction,
      script.verificationStatus,
      new Date().toISOString(),
      new Date().toISOString()
    ]
  });

  for (const source of script.sources) {
    await db.execute({
      sql: "INSERT OR IGNORE INTO ScriptSource (id, scriptId, label, createdAt) VALUES (?, ?, ?, ?)",
      args: [`${script.id}:${source}`, script.id, source, new Date().toISOString()]
    });
  }
}

console.log(`seeded ${verifiedScriptsSeed.length} verified/partial script records`);

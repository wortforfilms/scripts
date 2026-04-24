import { execFileSync } from "node:child_process";

const steps = [
  ["dataset/glyph/release tests", "pnpm", ["--filter", "@maataa/maataa-ui", "test", "--", "tests/launch-validation.test.ts"]],
  ["typecheck", "pnpm", ["--filter", "@maataa/maataa-ui", "exec", "tsc", "--noEmit", "--incremental", "false"]]
];

for (const [label, command, args] of steps) {
  console.log(`release-check: ${label}`);
  execFileSync(command, args, { stdio: "inherit" });
}

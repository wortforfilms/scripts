import { resolve } from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "."),
      "@maataa/runtime-db": resolve(__dirname, "../../packages/runtime-db/index.js")
    }
  },
  test: {
    environment: "node",
    globals: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json-summary"],
      reportsDirectory: resolve(__dirname, "coverage"),
      include: [
        "app/api/**/*.ts",
        "lib/**/*.ts"
      ],
      exclude: [
        "**/*.d.ts",
        "app/api/health/route.ts"
      ]
    }
  }
});

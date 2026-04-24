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
    globals: true
  }
});

import path from "node:path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./vitest.setup.ts"],
    testTimeout: 20_000,
    pool: "forks",
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
});

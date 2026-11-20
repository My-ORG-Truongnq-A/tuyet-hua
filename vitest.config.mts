import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
      // `server-only` ném lỗi khi import ngoài React Server; trong unit test thay bằng module rỗng.
      "server-only": fileURLToPath(new URL("./tests/stubs/server-only.ts", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["**/*.test.ts", "**/*.test.tsx"],
    exclude: ["node_modules/**", ".next/**", "e2e/**", ".digiauto/**"],
    setupFiles: ["./vitest.setup.ts"],
    // Unit test KHÔNG được chạm Sanity hay mạng ngoài (Sanity gói Free — KT-01).
    env: { SANITY_SOURCE: "seed" },
  },
});

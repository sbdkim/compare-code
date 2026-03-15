import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

declare const process: {
  env: Record<string, string | undefined>;
};

export default defineConfig({
  base: process.env.PAGES_BASE ?? "/compare-code/",
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
  },
});

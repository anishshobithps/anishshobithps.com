import { fileURLToPath } from "node:url";
import { createVitestConfig } from "@repo/vitest-config";

export default createVitestConfig({
  resolve: {
    alias: {
      "varlock/env": fileURLToPath(
        new URL("./tests/support/varlock-env.ts", import.meta.url),
      ),
    },
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "node",
          include: ["tests/**/*.test.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "dom",
          include: ["tests/**/*.test.tsx"],
          exclude: ["**/node_modules/**", "tests/**/*.test.ts"],
          environment: "jsdom",
          setupFiles: ["./tests/support/dom-setup.ts"],
          css: false,
        },
      },
    ],
  },
});

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
});

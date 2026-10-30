import { defineConfig, mergeConfig, type ViteUserConfig } from "vitest/config";

export function createVitestConfig(overrides: ViteUserConfig = {}) {
  return mergeConfig(
    defineConfig({
      resolve: {
        tsconfigPaths: true,
      },
      test: {
        environment: "node",
        include: ["tests/**/*.test.ts"],
      },
    }),
    overrides,
  );
}

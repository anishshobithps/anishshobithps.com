import { createNextConfig } from "@repo/eslint-config/next";

export default createNextConfig({
  uiGlob: "src/**",
  vendoredFiles: [
    "src/components/media-player.tsx",
    "src/lib/compose-refs.ts",
    "src/hooks/use-lazy-ref.ts",
  ],
  extra: [
    {
      files: ["src/components/sonner.tsx"],
      rules: {
        "shadcn/no-unknown-classes": "off",
      },
    },
  ],
});

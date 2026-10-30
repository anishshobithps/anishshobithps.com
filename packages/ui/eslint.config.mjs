import { createNextConfig } from "@repo/eslint-config/next";

export default createNextConfig({
  uiGlob: "src/**",
  vendoredFiles: [],
  extra: [
    {
      files: ["src/components/sonner.tsx"],
      rules: {
        "shadcn/no-unknown-classes": "off",
      },
    },
  ],
});

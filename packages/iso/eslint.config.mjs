import { createNextConfig } from "@repo/eslint-config/next";

export default createNextConfig({
  extra: [
    {
      files: ["src/components/git-chaos.tsx"],
      rules: {
        "shadcn/no-inline-styles": "off",
      },
    },
  ],
});

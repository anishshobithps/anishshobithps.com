import { createNextConfig } from "@repo/eslint-config/next";

export default createNextConfig({
  uiGlob: "src/{components,hooks,lib,styles}/**",
  noTailwindFiles: ["src/cards/**/*.tsx"],
  extra: [
    {
      files: ["src/components/sonner.tsx"],
      rules: {
        "shadcn/no-unknown-classes": "off",
      },
    },
    {
      files: ["src/art/git-chaos.tsx"],
      rules: {
        "shadcn/no-inline-styles": "off",
      },
    },
  ],
});

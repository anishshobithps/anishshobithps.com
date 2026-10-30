import { createNextConfig } from "@repo/eslint-config/next";

export default createNextConfig({
  uiGlob: "src/**",
  vendoredFiles: ["src/**"],
});

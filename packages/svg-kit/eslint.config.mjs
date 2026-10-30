import { createNextConfig } from "@repo/eslint-config/next";

export default createNextConfig({
  noTailwindFiles: ["src/**/*.tsx"],
});

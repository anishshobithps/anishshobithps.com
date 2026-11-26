const config = {
  tags: ["-lintignore"],
  workspaces: {
    ".": {
      ignore: ["tools/**", "unlighthouse.config.ts"],
      ignoreDependencies: ["next", "varlock"],
      ignoreBinaries: ["measure"],
    },
    "apps/web": {
      ignore: ["src/lib/source.ts"],
      entry: ["c15t.config.ts"],
      ignoreDependencies: ["sharp", "simple-icons"],
    },
    "packages/*": {},
  },
};

export default config;

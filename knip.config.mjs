/** @type {import('knip').KnipConfig} */
const config = {
  tags: ["-lintignore"],
  workspaces: {
    ".": {
      ignoreDependencies: ["next"],
    },
    "apps/web": {
      ignore: [
        "source.config.ts",
        "src/lib/source.ts",
        "src/lib/remarkReadingTime.ts",
        "scripts/get-spotify-refresh-token.ts",
      ],
      ignoreDependencies: [
        "mdast",
        "reading-time",
        "unist-util-visit",
        "vfile",
      ],
    },
    "packages/media-player": {
      ignore: ["src/compose-refs.ts"],
    },
    "packages/site-config": {
      ignore: ["env.ts"],
    },
    "packages/db": {
      ignore: ["env.ts"],
    },
    "packages/*": {},
  },
};

export default config;

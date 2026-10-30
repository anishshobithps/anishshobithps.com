/** @type {import('knip').KnipConfig} */
const config = {
  tags: ["-lintignore"],
  workspaces: {
    "apps/web": {
      ignore: [
        "source.config.ts",
        "src/lib/source.ts",
        "src/lib/remarkReadingTime.ts",
        "src/lib/iso/iso-kit.ts",
        "src/lib/iso/lathe.ts",
        "src/lib/iso/tube.ts",
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
    "packages/*": {},
  },
};

export default config;

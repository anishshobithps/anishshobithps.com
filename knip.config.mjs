/** @type {import('knip').KnipConfig} */
const config = {
  tags: ["-lintignore"],
  workspaces: {
    "apps/web": {
      ignore: [
        "source.config.ts",
        "src/lib/source.ts",
        "src/lib/remarkReadingTime.ts",
        "src/components/ui/media-player.tsx",
        "src/components/ui/dropdown-menu.tsx",
        "src/hooks/use-lazy-ref.ts",
        "src/lib/compose-refs.ts",
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
        "media-chrome",
      ],
    },
    "packages/*": {},
  },
};

export default config;

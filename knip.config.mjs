/** @type {import('knip').KnipConfig} */
export default {
  ignore: [
    // fumadocs config — loaded by the fumadocs CLI at build time
    "source.config.ts",
    // fumadocs virtual-module source — imports a runtime-generated module
    "src/lib/source.ts",
    // Remark plugin consumed by source.config.ts
    "src/lib/remarkReadingTime.ts",
    // media-player and its helpers are imported from MDX blog content.
    // Knip doesn't parse MDX files, so these appear unused.
    "src/components/ui/media-player.tsx",
    "src/components/ui/dropdown-menu.tsx",
    "src/hooks/use-lazy-ref.ts",
    "src/lib/compose-refs.ts",
    // Utility script — run on-demand, not part of the app
    "scripts/get-spotify-refresh-token.ts",
  ],
  ignoreDependencies: [
    // Consumed by fumadocs remark pipeline, not via direct TS imports
    "mdast",
    "reading-time",
    "unist-util-visit",
    "vfile",
    // Powers media-player.tsx (used in MDX blog content)
    "media-chrome",
  ],
};

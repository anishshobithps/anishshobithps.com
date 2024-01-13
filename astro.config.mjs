import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import tailwind from "@astrojs/tailwind";
import compressor from "astro-compressor";
import sitemap from "@astrojs/sitemap";
import robotsTxt from "astro-robots-txt";
import react from "@astrojs/react";
import icon from "astro-icon";

// https://astro.build/config
export default defineConfig({
  site: "http://localhost:4321/",
  image: {
    service: {
      entrypoint: "./src/lib/imageService.ts",
    },
  },
  markdown: {
    drafts: true,
    shikiConfig: {
      theme: "github-dark",
      wrap: true,
    },
  },
  integrations: [
    mdx({
      syntaxHighlight: "shiki",
      shikiConfig: {
        theme: "material-theme-palenight",
        wrap: true,
      },
      drafts: true,
    }),
    sitemap(),
    tailwind({
      applyBaseStyles: false,
    }),
    ,
    robotsTxt(),
    react(),
    icon({
      include: {
        mdi: ["*"], // (Default) Loads entire Material Design Icon set
      },
    }),
    compressor({
      gzip: true,
      brotli: true,
    }),
  ],
});

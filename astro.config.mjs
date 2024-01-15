import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import tailwind from "@astrojs/tailwind";
import compressor from "astro-compressor";
import sitemap from "@astrojs/sitemap";
import robotsTxt from "astro-robots-txt";
import react from "@astrojs/react";
import icon from "astro-icon";
import path from "node:path";
import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
  output: "server",
  site: "http://localhost:4321/",
  adapter: vercel({
    webAnalytics: {
      enabled: true
    }
  }),
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
      iconDir: "src/assets/icons",
      include: {
        mdi: ["*"], // (Default) Loads entire Material Design Icon set
        devicon: ["*"],
      },
    }),
    compressor({
      gzip: true,
      brotli: true,
    }),
  ],
  vite: {
    resolve: {
      alias: {
        "@src": path.resolve("./src"),
        "@layouts": path.resolve("./src/layouts"),
        "@components": path.resolve("./src/components"),
        "@config": path.resolve("./src/config"),
        "@content": path.resolve("./src/content"),
        "@styles": path.resolve("./src/styles"),
        "@utils": path.resolve("./src/utils"),
        "@icons": path.resolve("./src/components/icons"),
      },
    },
  },
});

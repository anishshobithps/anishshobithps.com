import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import tailwind from "@astrojs/tailwind";
import compressor from "astro-compressor";
import sitemap from "@astrojs/sitemap";
import robotsTxt from "astro-robots-txt";
import { VitePWA } from "vite-plugin-pwa";
import { manifest } from "./src/lib/manifest";
import react from "@astrojs/react";
import { dirname, resolve } from "path";
import { fileURLToPath } from 'url';
import icon from "astro-icon";

// Use import.meta.url to get the URL of the current module
const __filename = fileURLToPath(import.meta.url);
// Use dirname to get the directory name
const __dirname = dirname(__filename);

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
  vite: {
    resolve: {
      alias: {
        "@": resolve(__dirname, "./src"),
        "@layouts": resolve("./src/layouts"),
        "@components": resolve("./src/components"),
        "@config": resolve("./src/config"),
        "@content": resolve("./src/content"),
        "@styles": resolve("./src/styles"),
        "@icons": resolve("./src/components/icons"),
      },
    },
    plugins: [
      VitePWA({
        registerType: "autoUpdate",
        manifest,
        workbox: {
          globDirectory: "dist",
          globPatterns: [
            "**/*.{js,css,svg,png,jpg,jpeg,gif,webp,woff,woff2,ttf,eot,ico}",
          ],
          navigateFallback: null,
        },
      }),
    ],
  },
});

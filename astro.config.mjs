import { defineConfig, passthroughImageService } from "astro/config";
import mdx from "@astrojs/mdx";
import tailwind from "@astrojs/tailwind";
import compressor from "astro-compressor";
import sitemap from "@astrojs/sitemap";
import robotsTxt from "astro-robots-txt";
import react from "@astrojs/react";
import icon from "astro-icon";
import path from "node:path";
import vercel from "@astrojs/vercel/serverless";
import spotlightjs from "@spotlightjs/astro";
import fontPicker from "astro-font-picker";

const isDev = import.meta.env.DEV;

export default defineConfig({
  output: "server",
  site: isDev ? "http://localhost:4321" : "https://anishshobithps.com",
  adapter: vercel({
    webAnalytics: {
      enabled: !isDev,
    },
    imagesConfig: {
      domains: ["anishshobithps.com"],
      sizes: [320, 640, 1280],
    },
    ...(isDev && {
      devImageService: passthroughImageService(),
    }),
    imageService: true,
  }),

  markdown: {
    drafts: isDev,
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
      drafts: isDev,
    }),
    sitemap(),
    tailwind({ applyBaseStyles: false }),
    robotsTxt(),
    react(),
    icon({
      iconDir: "src/assets/icons",
      include: {
        mdi: ["github", "arrow-right", "instagram", "twitter", "linkedin"],
        devicon: [
          "git",
          "vscode",
          "docker",
          "linux",
          "javascript",
          "python",
          "java",
          "typescript",
          "c",
          "cplusplus",
          "css3",
          "html5",
          "react",
          "mongodb",
          "prisma",
          "tailwindcss",
        ],
      },
    }),
    !isDev &&
      compressor({
        gzip: true,
        brotli: true,
      }),
    isDev && spotlightjs(),
    isDev && fontPicker(),
  ].filter(Boolean),

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

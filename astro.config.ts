import preact from "@astrojs/preact";
import tailwind from "@astrojs/tailwind";
import compress from "astro-compress";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  site: "https://anishshobithps.tech",
  integrations: [
    preact(),
    compress({
      css: true,
      html: true,
      js: true,
      img: true,
      svg: false
    }),
    tailwind({
      config: {
        applyBaseStyles: false,
      },
    }),
  ],
  vite: {
    build: {
      assetsInlineLimit: 0,
    },
  },
});

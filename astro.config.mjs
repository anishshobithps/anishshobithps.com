import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import preact from '@astrojs/preact';
import image from '@astrojs/image';
import compress from 'astro-compress';
import { SITE } from './src/ts/config';
import { babel } from '@rollup/plugin-babel';
import react from "@astrojs/react";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://astro.build/config

// https://astro.build/config

// https://astro.build/config
export default defineConfig({
  site: SITE.origin,
  base: SITE.basePathname,
  trailingSlash: SITE.trailingSlash ? 'always' : 'never',
  output: 'static',
  integrations: [tailwind({
    config: {
      applyBaseStyles: false
    }
  }), image({
    serviceEntryPoint: '@astrojs/image/sharp'
  }), compress({
    css: true,
    html: {
      removeAttributeQuotes: false
    },
    img: true,
    js: true,
    svg: true
  }), preact({
    compact: true
  }), react()],
  vite: {
    ssr: {
      external: ['svgo']
    },
    resolve: {
      alias: {
        '~': path.resolve(__dirname, './src')
      }
    }
  }
});
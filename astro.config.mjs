import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import preact from '@astrojs/preact';
import vercel from '@astrojs/vercel/serverless';
import compress from 'astro-compress';
import { SITE } from './src/ts/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://astro.build/config
export default defineConfig({
  site: SITE.origin,
  base: SITE.basePathname,
  trailingSlash: SITE.trailingSlash ? 'always' : 'never',
  output: 'server',
  integrations: [
    tailwind({
      config: {
        applyBaseStyles: false,
      },
    }),
    preact({ compact: true }),
    compress({
      css: true,
      html: {
        removeAttributeQuotes: false,
      },
      img: true,
      js: true,
      svg: true,
    }),
    vercel({
      webAnalytics: {
        enabled: true
      }
    }),
  ],
  vite: {
    ssr: {
      external: ['svgo'],
    },
    resolve: {
      alias: {
        '~': path.resolve(__dirname, './src'),
      },
    },
  },
});

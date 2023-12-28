import { defineConfig, passthroughImageService } from 'astro/config';
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";

import partytown from "@astrojs/partytown";

// https://astro.build/config
export default defineConfig({
  image: {
    service: passthroughImageService()
  },
  integrations: [react(), tailwind({
    applyBaseStyles: false
  }), partytown()]
});
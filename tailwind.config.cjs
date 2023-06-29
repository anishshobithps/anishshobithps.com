const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  presets: [require('tailwindcss/defaultConfig')],
  content: ['./src/**/*.{astro,html,js,jsx,md,svelte,ts,tsx,vue}', './node_modules/xtendui/src/*.mjs'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--aw-color-primary)',
        secondary: 'var(--aw-color-secondary)',
        accent: 'var(--aw-color-accent)',
      },
      fontFamily: {
        sans: ['var(--aw-font-sans)', ...defaultTheme.fontFamily.sans],
        serif: ['var(--aw-font-serif)', ...defaultTheme.fontFamily.serif],
        heading: ['var(--aw-font-heading)', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  
  plugins: [require('@tailwindcss/typography'), require("daisyui")],
  darkMode: 'class',
};

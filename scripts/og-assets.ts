/**
 * generate-og-assets.ts
 *
 * Generates static PNG assets that mirror OGPreview.tsx dark theme effects.
 *
 * Run:
 *   npx tsx scripts/generate-og-assets.ts
 *
 * Output:
 *   public/og-assets/
 */

import sharp from 'sharp'
import fs from 'fs'
import path from 'path'

const OUT_DIR = path.join(process.cwd(), 'public/og-assets')
fs.mkdirSync(OUT_DIR, { recursive: true })

const WIDTH = 1200
const HEIGHT = 630
const FEATHER = 150
const SHADOW_OPACITY = 0.05

const COLORS = {
    primary: { r: 240, g: 240, b: 255 },
    foreground: '#ffffff',
    background: '#141418',
    accent: '#52525b',
}

async function createFromSVG(
    filename: string,
    svg: string,
    width?: number,
    height?: number
) {
    const outputPath = path.join(OUT_DIR, filename)

    if (width && height) {
        await sharp({
            create: {
                width,
                height,
                channels: 4,
                background: { r: 0, g: 0, b: 0, alpha: 0 },
            },
        })
            .composite([{ input: Buffer.from(svg) }])
            .png()
            .toFile(outputPath)
    } else {
        await sharp(Buffer.from(svg))
            .png()
            .toFile(outputPath)
    }

    console.log(`✓ ${filename}`)
}

await createFromSVG(
    'noise.png',
    `
  <svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
    <filter id="noise">
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.8"
        numOctaves="3"
        stitchTiles="stitch"
      />
      <feColorMatrix type="saturate" values="0"/>
    </filter>
    <rect width="100%" height="100%" filter="url(#noise)"/>
  </svg>
`,
    WIDTH,
    HEIGHT
)

await createFromSVG(
    'watermark.png',
    `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="650" height="650">
    <polygon
      points="32,4 48,60 40.5,60 32,14 23.5,60 16,60"
      fill="${COLORS.foreground}"
    />
    <rect x="18" y="36" width="11" height="5" rx="2.5" fill="${COLORS.foreground}"/>
    <rect x="35" y="36" width="11" height="5" rx="2.5" fill="${COLORS.foreground}"/>
  </svg>
`
)

await createFromSVG(
    'logo.png',
    `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="96" height="96">
    <rect width="64" height="64" rx="14" fill="${COLORS.foreground}"/>

    <polygon
      points="32,9 46,55 39.5,55 32,20 24.5,55 18,55"
      fill="${COLORS.background}"
    />

    <rect x="18.5" y="34" width="10" height="4.5" rx="2.25" fill="${COLORS.background}"/>
    <rect x="35.5" y="34" width="10" height="4.5" rx="2.25" fill="${COLORS.background}"/>
  </svg>
`
)

await createFromSVG(
    'shadow.png',
    `
  <svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
    <defs>
      <linearGradient id="top" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="black" stop-opacity="${SHADOW_OPACITY}"/>
        <stop offset="100%" stop-color="black" stop-opacity="0"/>
      </linearGradient>

      <linearGradient id="bottom" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="black" stop-opacity="0"/>
        <stop offset="100%" stop-color="black" stop-opacity="${SHADOW_OPACITY}"/>
      </linearGradient>

      <linearGradient id="left" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="black" stop-opacity="${SHADOW_OPACITY}"/>
        <stop offset="100%" stop-color="black" stop-opacity="0"/>
      </linearGradient>

      <linearGradient id="right" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="black" stop-opacity="0"/>
        <stop offset="100%" stop-color="black" stop-opacity="${SHADOW_OPACITY}"/>
      </linearGradient>
    </defs>

    <rect x="0" y="0" width="${WIDTH}" height="${FEATHER}" fill="url(#top)"/>
    <rect x="0" y="${HEIGHT - FEATHER}" width="${WIDTH}" height="${FEATHER}" fill="url(#bottom)"/>
    <rect x="0" y="0" width="${FEATHER}" height="${HEIGHT}" fill="url(#left)"/>
    <rect x="${WIDTH - FEATHER}" y="0" width="${FEATHER}" height="${HEIGHT}" fill="url(#right)"/>
  </svg>
`,
    WIDTH,
    HEIGHT
)

console.log('\n✅ All OG assets generated successfully.\n')

import type { FontDetails } from "takumi-js";

export const FONTS = {
  display: {
    name: "Bricolage Grotesque",
    weight: 700,
    googleFamily: "Bricolage+Grotesque:opsz,wght@60,700",
  },
  body: { name: "Manrope", weight: 500, googleFamily: "Manrope:wght@500" },
  pixel: {
    name: "Geist Pixel",
    weight: 400,
    googleFamily: "Geist+Pixel:ELSH@0..100",
  },
  mono: { name: "Fira Code", weight: 500, googleFamily: "Fira+Code:wght@500" },
} as const;

export const FONT_STACK = {
  display: `'${FONTS.display.name}', Geist, sans-serif`,
  body: `'${FONTS.body.name}', Geist, sans-serif`,
  pixel: `'${FONTS.pixel.name}', 'Geist Mono', monospace`,
  mono: `'${FONTS.mono.name}', 'Geist Mono', monospace`,
};

export const PIXEL_SHAPE = "'ELSH' 25";

const WOFF2_USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";

const LATIN_WOFF2_SOURCE =
  /\/\* latin \*\/\s*@font-face\s*\{[^}]*?src: url\((.+?)\) format\('woff2'\)/;

async function fetchGoogleFont(family: string) {
  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=${family}`,
    { headers: { "User-Agent": WOFF2_USER_AGENT } },
  ).then((res) => res.text());
  const source = css.match(LATIN_WOFF2_SOURCE)?.[1];
  if (!source) throw new Error(`No latin woff2 source for ${family}`);

  const res = await fetch(source);
  if (!res.ok) throw new Error(`Failed to fetch ${family}: ${res.status}`);
  return res.arrayBuffer();
}

let fontsPromise: Promise<FontDetails[]> | undefined;

export function loadFonts() {
  fontsPromise ??= Promise.all(
    Object.values(FONTS).map(async ({ name, weight, googleFamily }) => ({
      name,
      weight,
      data: await fetchGoogleFont(googleFamily),
    })),
  ).catch((err) => {
    console.error("[fonts] Falling back to default fonts:", err);
    fontsPromise = undefined;
    return [];
  });
  return fontsPromise;
}

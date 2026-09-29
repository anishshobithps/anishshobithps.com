import { OG_FONTS, OG_SIZE, OGImage } from "@/components/shared/OG";
import { ImageResponse } from "@takumi-rs/image-response";
import type { NextRequest } from "next/server";

type LoadedFont = { name: string; weight: number; data: ArrayBuffer };

const CACHE_CONTROL =
  "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800, immutable";

const truncate = (str: string, max: number) =>
  str.length > max ? str.slice(0, max - 1).trimEnd() + "…" : str;

function getParam(
  params: URLSearchParams,
  key: string,
  fallback: string,
  max: number,
) {
  return truncate(params.get(key) ?? fallback, max);
}

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

let fontsPromise: Promise<LoadedFont[]> | undefined;

function loadFonts() {
  fontsPromise ??= Promise.all(
    Object.values(OG_FONTS).map(async ({ name, weight, googleFamily }) => ({
      name,
      weight,
      data: await fetchGoogleFont(googleFamily),
    })),
  ).catch((err) => {
    console.error("[OG] Falling back to default fonts:", err);
    fontsPromise = undefined;
    return [];
  });
  return fontsPromise;
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const title = getParam(
    searchParams,
    "title",
    "Designing scalable frontend systems",
    100,
  );
  const description = getParam(
    searchParams,
    "description",
    "Exploring the intersection of performance, architecture, and UX.",
    180,
  );
  const name = getParam(searchParams, "name", "Anish Shobith P S", 40);
  const domain = getParam(searchParams, "domain", "anishshobithps.com", 50);
  const path = getParam(searchParams, "path", "home / blog", 60);
  const role = getParam(searchParams, "role", "Software Developer", 50);
  const availableForHire = searchParams.get("available") !== "false";
  const tags = (searchParams.get("tags")?.split(",") ?? [])
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 4)
    .map((tag) => truncate(tag, 20));

  return new ImageResponse(
    <OGImage
      title={title}
      description={description}
      name={name}
      domain={domain}
      path={path}
      role={role}
      tags={tags}
      availableForHire={availableForHire}
    />,
    {
      ...OG_SIZE,
      format: "png",
      fonts: await loadFonts(),
      loadDefaultFonts: true,
      headers: { "Cache-Control": CACHE_CONTROL },
    },
  );
}

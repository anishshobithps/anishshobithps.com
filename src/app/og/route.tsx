import { OGImage } from "@/components/shared/OG";
import { ImageResponse } from "@takumi-rs/image-response";
import { NextRequest } from "next/server";

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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

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
      130,
    );
    const name = getParam(searchParams, "name", "Anish Shobith P S", 40);
    const domain = getParam(searchParams, "domain", "anishshobithps.com", 50);
    const path = getParam(searchParams, "path", "home / blog", 60);
    const role = getParam(searchParams, "role", "Software Developer", 50);

    const availableForHire = searchParams.get("available") !== "false";

    const tags = (searchParams.get("tags")?.split(",").filter(Boolean) ?? [])
      .slice(0, 4)
      .map((t) => truncate(decodeURIComponent(t.trim()), 20));

    const image = new ImageResponse(
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
        width: 1200,
        height: 630,
      },
    );

    return new Response(image.body, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control":
          "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800, immutable",
      },
    });
  } catch (err) {
    console.error("[OG] Failed to generate image:", err);

    return new Response("Failed to generate OG image", {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
}

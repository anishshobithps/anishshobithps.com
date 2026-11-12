import { extractPageMeta } from "@repo/core/html-meta";
import { displayHost, fetchHtmlHead, isPublicHttpsUrl } from "../http";
import type { LinkPreview } from "../types";

export async function resolveGeneric(url: string): Promise<LinkPreview | null> {
  if (!isPublicHttpsUrl(url)) return null;
  const page = await fetchHtmlHead(url);
  if (!page) return null;

  const meta = extractPageMeta(page.html, page.finalUrl);
  if (!meta.title && !meta.description) return null;

  return {
    kind: "generic",
    url,
    host: displayHost(page.finalUrl),
    title: meta.title,
    description: meta.description,
    siteName: meta.siteName,
    image: meta.image,
    favicon: meta.favicon,
  };
}

import { fetchJson, httpsOrNull, str } from "../http";
import type { LinkPreview } from "../types";

export async function resolveWikipedia(
  lang: string,
  title: string,
  url: string,
): Promise<LinkPreview | null> {
  const data = await fetchJson(
    `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
  );
  const resolvedTitle = str(data?.title);
  if (!data || !resolvedTitle || data.type === "disambiguation") return null;

  const thumbnail =
    data.thumbnail && typeof data.thumbnail === "object"
      ? httpsOrNull((data.thumbnail as Record<string, unknown>).source)
      : null;

  return {
    kind: "wikipedia",
    url,
    title: resolvedTitle,
    description: str(data.description),
    extract: str(data.extract),
    thumbnail,
  };
}

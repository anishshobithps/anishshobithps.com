import { fetchJson, str } from "../http";
import type { LinkPreview } from "../types";

export async function resolveYoutube(id: string, url: string): Promise<LinkPreview | null> {
  const watch = `https://www.youtube.com/watch?v=${id}`;
  const data = await fetchJson(
    `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(watch)}`,
  );
  const title = str(data?.title);
  if (!data || !title) return null;

  return {
    kind: "youtube",
    url,
    title,
    author: str(data.author_name),
    thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
  };
}

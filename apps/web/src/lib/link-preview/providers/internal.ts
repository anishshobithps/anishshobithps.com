import { siteConfig } from "@repo/site-config";
import { source } from "@/lib/source";
import type { LinkPreview } from "@/lib/link-preview/types";

interface ReadingTimeExports {
  _exports?: { readingTime?: { text?: string } };
}

export function resolveInternal(path: string): LinkPreview {
  const segments = path.split("/").filter(Boolean);

  if (segments[0] === "blog" && segments.length > 1) {
    const page = source.getPage(segments.slice(1));
    if (page) {
      return {
        kind: "internal",
        url: page.url,
        title: page.data.title,
        description: page.data.description ?? null,
        date: page.data.date ? page.data.date.toISOString() : null,
        readingTime:
          (page.data as unknown as ReadingTimeExports)._exports?.readingTime?.text ?? null,
      };
    }
  }

  const nav = siteConfig.nav.find((item) => item.href === (path === "/blog" ? "/blogs" : path));
  return {
    kind: "internal",
    url: path,
    title: nav?.label ?? (path === "/" ? siteConfig.name : path),
    description: null,
    date: null,
    readingTime: null,
  };
}

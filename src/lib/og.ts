const BASE = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

interface OGParams {
    title?: string;
    description?: string;
    name?: string;
    domain?: string;
    path?: string;
    tags?: string[];
}

export function buildOGUrl({
    title = "Anish Shobith P S",
    description = "",
    name = "Anish Shobith P S",
    domain = "anishshobithps.com",
    path = "home",
    tags = [],
}: OGParams = {}): string {
    const url = new URL(`${BASE}/og`);
    url.searchParams.set("title", title);
    if (description) url.searchParams.set("description", description);
    url.searchParams.set("name", name);
    url.searchParams.set("domain", domain);
    url.searchParams.set("path", path);
    if (tags.length > 0) url.searchParams.set("tags", tags.join(","));
    return url.toString();
}

export function buildOGMeta(params: OGParams) {
    const imageUrl = buildOGUrl(params);
    return {
        openGraph: {
            images: [{ url: imageUrl, width: 1200, height: 630 }],
        },
        twitter: {
            card: "summary_large_image" as const,
            images: [imageUrl],
        },
    };
}

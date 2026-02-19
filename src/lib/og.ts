import type { Metadata } from "next";
import { siteConfig } from "@/lib/config";

interface OGParams {
    title?: string;
    description?: string;
    name?: string;
    domain?: string;
    path?: string;
    tags?: string[];
    role?: string;
    available?: boolean;
}

export function buildOGUrl({
    title = siteConfig.name,
    description = "",
    name = siteConfig.name,
    domain = siteConfig.domain,
    path = "home",
    tags = [],
    role = siteConfig.role,
    available = siteConfig.availableForHire,
}: OGParams = {}): string {
    const url = new URL(`${siteConfig.baseUrl}/og`);
    url.searchParams.set("title", title);
    if (description) url.searchParams.set("description", description);
    url.searchParams.set("name", name);
    url.searchParams.set("domain", domain);
    url.searchParams.set("path", path);
    if (tags.length > 0) url.searchParams.set("tags", tags.join(","));
    url.searchParams.set("role", role);
    url.searchParams.set("available", String(available));
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

export function buildMeta(params: OGParams & { pageTitle?: string }): Metadata {
    const imageUrl = buildOGUrl(params);
    const title = params.pageTitle ?? params.title ?? siteConfig.name;
    const description = params.description ?? siteConfig.description;
    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: [{ url: imageUrl, width: 1200, height: 630 }],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [imageUrl],
        },
    };
}

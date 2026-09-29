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

export function buildOGPath({
    title = siteConfig.name,
    description = "",
    name = siteConfig.name,
    domain = siteConfig.domain,
    path = "home",
    tags = [],
    role = siteConfig.role,
    available = siteConfig.availableForHire,
}: OGParams = {}): string {
    const params = new URLSearchParams();
    params.set("title", title);
    if (description) params.set("description", description);
    params.set("name", name);
    params.set("domain", domain);
    params.set("path", path);
    if (tags.length > 0) params.set("tags", tags.join(","));
    params.set("role", role);
    params.set("available", String(available));
    return `/og?${params}`;
}

export function buildOGUrl(params: OGParams = {}): string {
    return new URL(buildOGPath(params), siteConfig.baseUrl).toString();
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

export function buildMeta(
    params: OGParams & {
        pageTitle?: string;
        canonicalPath?: string;
        noIndex?: boolean;
        publishedAt?: string;
        updatedAt?: string;
        type?: "website" | "article" | "profile";
    },
): Metadata {
    const imageUrl = buildOGUrl(params);
    const title = params.pageTitle ?? params.title ?? siteConfig.name;
    const description = params.description ?? siteConfig.description;
    const canonical = params.canonicalPath
        ? `${siteConfig.baseUrl}${params.canonicalPath}`
        : siteConfig.baseUrl;
    const type = params.type ?? "website";
    const keywords = [
        ...(params.tags ?? []),
        params.role ?? siteConfig.role,
        siteConfig.name,
    ].filter(Boolean);

    return {
        title,
        description,
        keywords,
        authors: [{ name: siteConfig.name, url: siteConfig.baseUrl }],
        creator: siteConfig.name,
        publisher: siteConfig.name,

        metadataBase: new URL(siteConfig.baseUrl),
        alternates: {
            canonical,
            types: {
                "application/rss+xml": [
                    {
                        url: `${siteConfig.baseUrl}/feed.xml`,
                        title: `Blog by ${siteConfig.name}`,
                    },
                ],
            },
        },

        ...(params.noIndex && {
            robots: {
                index: false,
                follow: false,
                googleBot: {
                    index: false,
                    follow: false,
                },
            },
        }),

        openGraph: {
            title,
            description,
            url: canonical,
            siteName: siteConfig.name,
            locale: "en_US",
            type,
            images: [
                {
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
            ...(type === "article" && {
                publishedTime: params.publishedAt,
                modifiedTime: params.updatedAt,
                authors: [siteConfig.baseUrl],
                tags: params.tags,
            }),
        },

        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [
                {
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
            creator: siteConfig.twitterHandle,
            site: siteConfig.twitterHandle,
        },
    };
}

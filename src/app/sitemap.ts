import { siteConfig } from "@/lib/config";
import { source } from "@/lib/source";
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
    const blogPages = source.getPages().map((page) => ({
        url: `${siteConfig.baseUrl}${page.url}`,
        lastModified: page.data.lastModified
            ? new Date(page.data.lastModified)
            : page.data.date
                ? new Date(page.data.date)
                : new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.7,
    }));

    return [
        {
            url: siteConfig.baseUrl,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 1,
        },
        {
            url: `${siteConfig.baseUrl}/blogs`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.8,
        },
        {
            url: `${siteConfig.baseUrl}/resume`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.6,
        },
        {
            url: `${siteConfig.baseUrl}/privacy-policy`,
            lastModified: new Date(),
            changeFrequency: "yearly",
            priority: 0.3,
        },
        ...blogPages,
    ];
}

import { siteConfig } from "@/lib/config";
import { source } from "@/lib/source";
import type { MetadataRoute } from "next";
import { toISOString } from "@/lib/date";

export default function sitemap(): MetadataRoute.Sitemap {
    const now = new Date();

    const blogPages = source.getPages().map((page) => ({
        url: `${siteConfig.baseUrl}${page.url}`,
        lastModified: page.data.lastModified
            ? toISOString(page.data.lastModified)
            : page.data.date
                ? toISOString(page.data.date)
                : now,
        changeFrequency: "monthly" as const,
        priority: 0.7,
    }));

    return [
        { url: siteConfig.baseUrl, lastModified: now, changeFrequency: "monthly", priority: 1 },
        { url: `${siteConfig.baseUrl}/blogs`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
        { url: `${siteConfig.baseUrl}/projects`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
        { url: `${siteConfig.baseUrl}/resume`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
        { url: `${siteConfig.baseUrl}/guestbook`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
        { url: `${siteConfig.baseUrl}/privacy-policy`, lastModified: now, changeFrequency: "yearly", priority: 0.1 },
        ...blogPages,
    ];
}

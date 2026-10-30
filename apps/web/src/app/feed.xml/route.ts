import { siteConfig } from "@/lib/config";
import { toRFC822, toTimestamp } from "@/lib/date";
import { source } from "@/lib/source";
import { escapeXml } from "@/lib/xml";

export const revalidate = false;

export function GET() {
    const pages = source.getPages().sort((a, b) => {
        return toTimestamp(b.data.date) - toTimestamp(a.data.date);
    });

    const items = pages
        .map((page) => {
            const url = `${siteConfig.baseUrl}${page.url}`;
            const parts = [
                `            <title>${escapeXml(page.data.title)}</title>`,
                `            <link>${escapeXml(url)}</link>`,
                `            <guid isPermaLink="true">${escapeXml(url)}</guid>`,
            ];

            if (page.data.date) {
                parts.push(
                    `            <pubDate>${escapeXml(toRFC822(page.data.date))}</pubDate>`,
                );
            }

            if (page.data.description) {
                parts.push(
                    `            <description>${escapeXml(page.data.description)}</description>`,
                );
            }

            return `        <item>
${parts.join("\n")}
        </item>`;
        })
        .join("\n");

    const feedUrl = `${siteConfig.baseUrl}/feed.xml`;

    const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
        <title>${escapeXml(siteConfig.name)}</title>
        <link>${escapeXml(siteConfig.baseUrl)}</link>
        <description>${escapeXml(siteConfig.description)}</description>
        <language>en-US</language>
        <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml"/>
${items}
    </channel>
</rss>
`;

    return new Response(body, {
        headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
    });
}

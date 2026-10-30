import { siteConfig } from "@/lib/config";
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: { userAgent: "*", allow: "/", disallow: ["/branding", "/admin"] },
        sitemap: `${siteConfig.baseUrl}/sitemap.xml`,
    };
}


import { siteConfig } from "@/lib/config";
import { formatFileDate } from "./date";

export async function fetchResume() {
    const res = await fetch(siteConfig.resumeURL, {
        next: { revalidate: 3600 },
    });

    if (!res.ok || !res.body) {
        throw new Error(
            `Failed to fetch resume: ${res.status} ${res.statusText}`
        );
    }

    return res;
}

export function getResumeFilename(download: boolean = false) {
    const formattedName = siteConfig.name.replace(/\s+/g, "_");
    const formattedDate = formatFileDate();
    return download ? `${formattedName}-Resume-${formattedDate}.pdf` : `${siteConfig.name}'s Resume.pdf`;
}

export function forwardResumeHeaders(res: Response, extra: Record<string, string>): Headers {
    const headers = new Headers({
        "Content-Type": "application/pdf",
        "Cache-Control": "public, max-age=3600",
        ...extra,
    });
    const contentLength = res.headers.get("content-length");
    const etag = res.headers.get("etag");
    const lastModified = res.headers.get("last-modified");
    if (contentLength) headers.set("Content-Length", contentLength);
    if (etag) headers.set("ETag", etag);
    if (lastModified) headers.set("Last-Modified", lastModified);
    return headers;
}

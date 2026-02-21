import { NextResponse } from "next/server";
import { fetchResume } from "@/lib/resume";
import { siteConfig } from "@/lib/config";
import { getResumeFilename } from "@/lib/resume";

export async function GET() {
    try {
        const res = await fetchResume();

        if (!res.body) {
            throw new Error("No resume body found");
        }

        const filename = getResumeFilename(true);

        const contentLength = res.headers.get("content-length");
        const etag = res.headers.get("etag");
        const lastModified = res.headers.get("last-modified");

        return new NextResponse(res.body, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="${filename}"; filename*=UTF-8''${filename}`,
                "Cache-Control": "public, max-age=3600",
                ...(contentLength && { "Content-Length": contentLength }),
                ...(etag && { ETag: etag }),
                ...(lastModified && { "Last-Modified": lastModified }),
            },
        });
    } catch {
        return NextResponse.json(
            { error: "Failed to fetch resume" },
            { status: 500 }
        );
    }
}

import { after, NextResponse, type NextRequest } from "next/server";
import { fetchResume, forwardResumeHeaders } from "@/lib/resume";
import { getResumeFilename } from "@/lib/resume";
import { captureServerEvent, referrerHost } from "@/lib/analytics/server";

export async function GET(request: NextRequest) {
    const referrer = referrerHost(request.headers.get("referer"));
    after(() =>
        captureServerEvent("resume_downloaded", { referrer_host: referrer }),
    );
    try {
        const res = await fetchResume();

        if (!res.body) {
            throw new Error("No resume body found");
        }

        const filename = getResumeFilename(true);
        return new NextResponse(res.body, {
            headers: forwardResumeHeaders(res, {
                "Content-Disposition": `attachment; filename="${filename}"; filename*=UTF-8''${filename}`,
            }),
        });
    } catch {
        return NextResponse.json(
            { error: "Failed to fetch resume" },
            { status: 500 }
        );
    }
}

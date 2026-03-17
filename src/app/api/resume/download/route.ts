import { NextResponse } from "next/server";
import { fetchResume, forwardResumeHeaders } from "@/lib/resume";
import { getResumeFilename } from "@/lib/resume";

export async function GET() {
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

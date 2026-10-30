import { NextResponse } from "next/server";
import { fetchResume, forwardResumeHeaders } from "@/lib/resume";

export async function GET() {
    try {
        const res = await fetchResume();

        if (!res.body) {
            throw new Error("No resume body found");
        }
        return new NextResponse(res.body, {
            headers: forwardResumeHeaders(res, { "Content-Disposition": "inline" }),
        });
    } catch {
        return NextResponse.json(
            { error: "Failed to fetch resume" },
            { status: 500 }
        );
    }
}

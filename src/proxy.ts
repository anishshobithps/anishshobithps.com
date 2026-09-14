import { clerkMiddleware } from "@clerk/nextjs/server";
import {
    NextResponse,
    type NextFetchEvent,
    type NextRequest,
} from "next/server";
import { siteConfig } from "@/lib/config";
import { RESERVED_SEGMENTS } from "@/lib/reserved-segments";

const withClerk = clerkMiddleware();

function isShortLinkHost(request: NextRequest): boolean {
    const configured = siteConfig.shortLinkDomain?.toLowerCase();
    if (!configured) return false;
    const host = request.headers.get("host")?.split(":")[0]?.toLowerCase();
    return host === configured || host === `www.${configured}`;
}

function belongsToMainSite(pathname: string): boolean {
    const [first] = pathname.split("/").filter(Boolean);
    return !first || RESERVED_SEGMENTS.has(first.toLowerCase());
}

export default function proxy(request: NextRequest, event: NextFetchEvent) {
    if (isShortLinkHost(request)) {
        if (belongsToMainSite(request.nextUrl.pathname)) {
            const target = new URL(
                `${request.nextUrl.pathname}${request.nextUrl.search}`,
                siteConfig.baseUrl,
            );
            return NextResponse.redirect(target, 308);
        }
        return NextResponse.next();
    }

    return withClerk(request, event);
}

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
}

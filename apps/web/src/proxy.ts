import { clerkMiddleware } from "@clerk/nextjs/server";
import {
    NextResponse,
    type NextFetchEvent,
    type NextRequest,
} from "next/server";
import { siteConfig } from "@/lib/config";
import { RESERVED_SEGMENTS } from "@/lib/reserved-segments";

const withClerk = clerkMiddleware();

function configuredShortLinkHost(): string | null {
    const raw =
        process.env.SHORTLINK_DOMAIN ?? process.env.NEXT_PUBLIC_SHORTLINK_DOMAIN;
    if (!raw) return null;
    const host = raw
        .trim()
        .toLowerCase()
        .replace(/^[a-z]+:\/\//, "")
        .replace(/\/.*$/, "")
        .split(":")[0]
        ?.replace(/^www\./, "");
    return host || null;
}

function isShortLinkHost(request: NextRequest): boolean {
    const configured = configuredShortLinkHost();
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
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        '/(api|trpc)(.*)',
    ],
}

// A fixed time zone keeps the rendered calendar day identical on the server
// (UTC) and in the browser (the visitor's local zone). Without it, a date
// stored as UTC midnight renders one day earlier for viewers west of UTC,
// which trips React hydration text mismatches (error #418) in the client
// components that render these (blog list, guestbook rotator, admin panels).
export function formatLongDate(date: Date | string): string {
    return new Date(date).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
    });
};

export function formatShortDate(date: Date | string): string {
    return new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
    });
}

export function toISOString(date: Date | string): string {
    return new Date(date).toISOString();
}

export function toTimestamp(date: Date | string | undefined): number {
    return date ? new Date(date).getTime() : 0;
}

export function formatFileDate(date: Date = new Date()): string {
    return new Intl.DateTimeFormat("en-GB")
        .format(date)
        .replace(/\//g, "-");
}

export function currentYear(): number {
    return new Date().getFullYear();
}

export function nowISO(): string {
    return new Date().toISOString();
}

export function timeAgo(date: string): string {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    const units: [Intl.RelativeTimeFormatUnit, number][] = [
        ["year", 31536000],
        ["month", 2592000],
        ["week", 604800],
        ["day", 86400],
        ["hour", 3600],
        ["minute", 60],
        ["second", 1],
    ];
    const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
    for (const [unit, secs] of units) {
        if (seconds >= secs) return rtf.format(-Math.floor(seconds / secs), unit);
    }
    return "just now";
}

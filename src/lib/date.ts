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

export function formatTimeInZone(timezone: string, date: Date = new Date()): string {
    return new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: timezone,
    }).format(date);
}

export function getZoneOffsetHours(timezone: string, from: Date = new Date()): number {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    }).formatToParts(from);

    const get = (type: string) =>
        parseInt(parts.find((p) => p.type === type)?.value ?? "0");
    const zoneAsUTC = Date.UTC(
        get("year"),
        get("month") - 1,
        get("day"),
        get("hour"),
        get("minute"),
        get("second"),
    );
    const zoneOffsetMins = Math.round((zoneAsUTC - from.getTime()) / 60000);
    const localOffsetMins = -from.getTimezoneOffset();
    return Math.round((zoneOffsetMins - localOffsetMins) / 60);
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

export function formatRelativeDate(iso: string): string {
    const date = new Date(iso);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / 86_400_000);

    if (diffDays === 0) return "today";
    if (diffDays === 1) return "yesterday";
    if (diffDays < 30) return `${diffDays}d ago`;
    const months = Math.floor(diffDays / 30);
    if (months < 12) return `${months}mo ago`;
    const years = Math.floor(diffDays / 365);
    return `${years}y ago`;
}

export function formatLongDate(date: Date | string): string {
    return new Date(date).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });
};

export function formatShortDate(date: Date | string): string {
    return new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
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

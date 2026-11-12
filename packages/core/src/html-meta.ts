export interface PageMeta {
    title: string | null;
    description: string | null;
    siteName: string | null;
    image: string | null;
    favicon: string | null;
}

const MAX_HTML_LENGTH = 262_144;
const MAX_TITLE_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 400;

const HEAD_END = /<\/head\s*>/i;
const SCRIPT_END = /<\/script[\s>]/i;
const STYLE_END = /<\/style[\s>]/i;
const TITLE_END = /<\/title[\s>]/i;

const NAMED_ENTITIES: Record<string, string> = {
    amp: "&",
    lt: "<",
    gt: ">",
    quot: '"',
    apos: "'",
    nbsp: " ",
};

function isSpace(code: number): boolean {
    return code === 32 || code === 9 || code === 10 || code === 13 || code === 12;
}

function isNameChar(code: number): boolean {
    return (
        (code >= 48 && code <= 58) ||
        (code >= 65 && code <= 90) ||
        (code >= 97 && code <= 122) ||
        code === 45 ||
        code === 95
    );
}

function decodeEntities(value: string): string {
    return value.replace(/&(#x[0-9a-f]{1,6}|#\d{1,7}|[a-z]{2,6});/gi, (match, body: string) => {
        if (body.startsWith("#")) {
            const code =
                body[1] === "x" || body[1] === "X"
                    ? Number.parseInt(body.slice(2), 16)
                    : Number.parseInt(body.slice(1), 10);
            if (!Number.isFinite(code) || code <= 0 || code > 0x10ffff) return match;
            try {
                return String.fromCodePoint(code);
            } catch {
                return match;
            }
        }
        return NAMED_ENTITIES[body.toLowerCase()] ?? match;
    });
}

function clean(value: string | undefined | null, max: number): string | null {
    if (!value) return null;
    const text = decodeEntities(value).replace(/\s+/g, " ").trim();
    if (text === "") return null;
    return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

interface Tag {
    name: string;
    attrs: Map<string, string>;
    end: number;
}

function readTag(html: string, from: number): Tag | null {
    const length = html.length;
    let i = from + 1;
    const nameStart = i;
    while (i < length && isNameChar(html.charCodeAt(i))) i++;
    const name = html.slice(nameStart, i).toLowerCase();
    const attrs = new Map<string, string>();

    while (i < length) {
        while (i < length && isSpace(html.charCodeAt(i))) i++;
        if (i >= length) return null;
        const char = html[i];
        if (char === ">") return { name, attrs, end: i + 1 };
        if (char === "/") {
            i++;
            continue;
        }

        const keyStart = i;
        while (i < length) {
            const code = html.charCodeAt(i);
            if (isSpace(code) || code === 61 || code === 62 || code === 47) break;
            i++;
        }
        if (i === keyStart) {
            i++;
            continue;
        }
        const key = html.slice(keyStart, i).toLowerCase();

        while (i < length && isSpace(html.charCodeAt(i))) i++;
        let value = "";
        if (html[i] === "=") {
            i++;
            while (i < length && isSpace(html.charCodeAt(i))) i++;
            const quote = html[i];
            if (quote === '"' || quote === "'") {
                const close = html.indexOf(quote, i + 1);
                if (close === -1) return null;
                value = html.slice(i + 1, close);
                i = close + 1;
            } else {
                const valueStart = i;
                while (i < length) {
                    const code = html.charCodeAt(i);
                    if (isSpace(code) || code === 62) break;
                    i++;
                }
                value = html.slice(valueStart, i);
            }
        }
        if (!attrs.has(key)) attrs.set(key, value);
    }
    return null;
}

function findFrom(
    pattern: RegExp,
    text: string,
    from: number,
): { index: number; end: number } | null {
    const matcher = new RegExp(pattern.source, "gi");
    matcher.lastIndex = from;
    const found = matcher.exec(text);
    return found ? { index: found.index, end: found.index + found[0].length } : null;
}

function resolveHttps(value: string | undefined, base: string): string | null {
    if (!value) return null;
    try {
        const url = new URL(value.trim(), base);
        return url.protocol === "https:" ? url.href : null;
    } catch {
        return null;
    }
}

export function extractPageMeta(html: string, baseUrl: string): PageMeta {
    const doc = html.length > MAX_HTML_LENGTH ? html.slice(0, MAX_HTML_LENGTH) : html;
    const headEnd = HEAD_END.exec(doc)?.index ?? doc.length;
    const region = doc.slice(0, headEnd);

    const meta = new Map<string, string>();
    let title: string | undefined;
    let favicon: string | undefined;
    let faviconRank = 0;

    let i = 0;
    while (i < region.length) {
        const lt = region.indexOf("<", i);
        if (lt === -1) break;
        if (region.startsWith("<!--", lt)) {
            const close = region.indexOf("-->", lt + 4);
            if (close === -1) break;
            i = close + 3;
            continue;
        }

        const tag = readTag(region, lt);
        if (!tag) break;
        if (tag.name === "") {
            i = lt + 1;
            continue;
        }

        if (tag.name === "script" || tag.name === "style") {
            const close = findFrom(
                tag.name === "script" ? SCRIPT_END : STYLE_END,
                region,
                tag.end,
            );
            if (!close) break;
            i = close.end;
            continue;
        }

        if (tag.name === "title") {
            const close = findFrom(TITLE_END, region, tag.end);
            const stop = close ? close.index : region.length;
            if (title === undefined) title = region.slice(tag.end, stop);
            i = stop;
            continue;
        }

        if (tag.name === "meta") {
            const key = (
                tag.attrs.get("property") ??
                tag.attrs.get("name") ??
                tag.attrs.get("itemprop")
            )?.toLowerCase();
            const content = tag.attrs.get("content");
            if (key && content !== undefined && !meta.has(key)) {
                meta.set(key, content);
            }
        } else if (tag.name === "link") {
            const rel = tag.attrs.get("rel")?.toLowerCase().split(/\s+/) ?? [];
            const href = tag.attrs.get("href");
            const rank = rel.includes("icon") ? 2 : rel.includes("apple-touch-icon") ? 1 : 0;
            if (href && rank > faviconRank) {
                favicon = href;
                faviconRank = rank;
            }
        }
        i = tag.end;
    }

    const pick = (...keys: string[]) => {
        for (const key of keys) {
            const value = meta.get(key);
            if (value !== undefined && value.trim() !== "") return value;
        }
        return undefined;
    };

    return {
        title: clean(pick("og:title", "twitter:title") ?? title, MAX_TITLE_LENGTH),
        description: clean(
            pick("og:description", "twitter:description", "description"),
            MAX_DESCRIPTION_LENGTH,
        ),
        siteName: clean(pick("og:site_name", "application-name"), MAX_TITLE_LENGTH),
        image: resolveHttps(
            pick("og:image", "og:image:secure_url", "og:image:url", "twitter:image", "twitter:image:src"),
            baseUrl,
        ),
        favicon:
            resolveHttps(favicon, baseUrl) ?? resolveHttps("/favicon.ico", baseUrl),
    };
}

export const PREVIEW_USER_AGENT = "Mozilla/5.0 (compatible; LinkCardBot/1.0)";
export const PREVIEW_TIMEOUT_MS = 4000;
export const PREVIEW_MAX_BYTES = 262_144;

const IPV4_LITERAL = /^\d{1,3}(?:\.\d{1,3}){3}$/;
const INTERNAL_SUFFIXES = [".local", ".localhost", ".internal", ".lan", ".home.arpa"];
const HEAD_CLOSE = /<\/head/i;

export function displayHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function isPublicHttpsUrl(value: string): boolean {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  if (url.protocol !== "https:") return false;
  const host = url.hostname.toLowerCase();
  if (host === "localhost" || !host.includes(".")) return false;
  if (host.includes(":") || IPV4_LITERAL.test(host)) return false;
  return !INTERNAL_SUFFIXES.some((suffix) => host.endsWith(suffix));
}

export async function fetchJson(
  url: string,
  headers?: Record<string, string>,
): Promise<Record<string, unknown> | null> {
  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": PREVIEW_USER_AGENT,
        ...headers,
      },
      signal: AbortSignal.timeout(PREVIEW_TIMEOUT_MS),
    });
    if (!response.ok) return null;
    const data: unknown = await response.json();
    return data && typeof data === "object" ? (data as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export async function fetchHtmlHead(url: string): Promise<{ html: string; finalUrl: string } | null> {
  try {
    const response = await fetch(url, {
      redirect: "follow",
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en",
        "User-Agent": PREVIEW_USER_AGENT,
      },
      signal: AbortSignal.timeout(PREVIEW_TIMEOUT_MS),
    });
    const finalUrl = response.url || url;
    if (!response.ok || !isPublicHttpsUrl(finalUrl)) return null;
    if (!(response.headers.get("content-type") ?? "").toLowerCase().includes("html")) {
      return null;
    }

    const reader = response.body?.getReader();
    if (!reader) return null;
    const decoder = new TextDecoder("utf-8", { fatal: false });
    let html = "";
    let bytes = 0;
    try {
      while (bytes < PREVIEW_MAX_BYTES) {
        const { done, value } = await reader.read();
        if (done) break;
        bytes += value.byteLength;
        const previousLength = html.length;
        html += decoder.decode(value, { stream: true });
        if (HEAD_CLOSE.test(html.slice(Math.max(0, previousLength - 8)))) break;
      }
    } finally {
      await reader.cancel().catch(() => undefined);
    }
    return { html, finalUrl };
  } catch {
    return null;
  }
}

export function str(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value : null;
}

export function num(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function httpsOrNull(value: unknown): string | null {
  const text = str(value);
  if (!text) return null;
  try {
    return new URL(text).protocol === "https:" ? text : null;
  } catch {
    return null;
  }
}

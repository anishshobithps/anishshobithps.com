const TIMEOUT_MS = 5000;
const MAX_BYTES = 120 * 1024;

/**
 * Fetches an image into a data URI, so the cached card data carries the bytes
 * and the SVG never points at another host. Returns null rather than failing
 * the card: a missing cover or avatar falls back to a placeholder.
 */
export async function toDataUri(url: string | null | undefined) {
  if (!url) return null;
  try {
    const res = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { Accept: "image/jpeg,image/png;q=0.9" },
    });
    const type = res.headers.get("content-type")?.split(";")[0] ?? "";
    if (!res.ok || !type.startsWith("image/")) return null;
    const bytes = Buffer.from(await res.arrayBuffer());
    if (bytes.byteLength > MAX_BYTES) return null;
    return `data:${type};base64,${bytes.toString("base64")}`;
  } catch {
    return null;
  }
}

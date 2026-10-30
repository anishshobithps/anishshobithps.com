export async function hashIp(ip: string): Promise<string> {
    const salt = process.env.IP_HASH_SALT;
    if (!salt) {
        throw new Error(
            "IP_HASH_SALT is not set. It is required to hash IP addresses; without a secret salt, stored hashes are trivially reversible.",
        );
    }
    const data = new TextEncoder().encode(`${ip}:${salt}`);
    const buf = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}

const IPV4_PATTERN = /^(?:\d{1,3}\.){3}\d{1,3}$/;
const IPV6_PATTERN = /^[0-9a-f:.]+$/i;

export const UNKNOWN_CLIENT_IP = "127.0.0.1";

const TRUSTED_IP_HEADERS = [
    "x-vercel-forwarded-for",
    "x-forwarded-for",
    "x-real-ip",
] as const;

export function isIpAddress(value: string): boolean {
    if (IPV4_PATTERN.test(value)) {
        return value.split(".").every((part) => Number(part) <= 255);
    }
    return value.includes(":") && IPV6_PATTERN.test(value);
}

export function getClientIp(hdrs: Headers): string {
    for (const header of TRUSTED_IP_HEADERS) {
        const value = hdrs.get(header);
        if (!value) continue;
        const candidate = value.split(",")[0]?.trim();
        if (candidate && isIpAddress(candidate)) return candidate;
    }
    return UNKNOWN_CLIENT_IP;
}

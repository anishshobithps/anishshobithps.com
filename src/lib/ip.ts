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

export function getClientIp(hdrs: Headers): string {
    const forwarded = hdrs.get("x-forwarded-for");
    return (
        forwarded?.split(",")[0]?.trim() ??
        hdrs.get("x-real-ip") ??
        "127.0.0.1"
    );
}

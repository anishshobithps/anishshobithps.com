import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getClientIp, hashIp, isIpAddress, UNKNOWN_CLIENT_IP } from "@/lib/ip";

describe("hashIp", () => {
    const original = process.env.IP_HASH_SALT;

    beforeEach(() => {
        delete process.env.IP_HASH_SALT;
    });

    afterEach(() => {
        if (original === undefined) {
            delete process.env.IP_HASH_SALT;
        } else {
            process.env.IP_HASH_SALT = original;
        }
    });

    it("throws when IP_HASH_SALT is unset", async () => {
        await expect(hashIp("127.0.0.1")).rejects.toThrow(
            "IP_HASH_SALT is not set.",
        );
    });

    it("throws when IP_HASH_SALT is the empty string", async () => {
        process.env.IP_HASH_SALT = "";
        await expect(hashIp("127.0.0.1")).rejects.toThrow(
            "IP_HASH_SALT is not set.",
        );
    });

    it("does not leak the salt in the error message", async () => {
        await expect(hashIp("127.0.0.1")).rejects.toThrow(
            /^IP_HASH_SALT is not set\./,
        );
    });

    it("returns a 64-character lowercase hex string when the salt is set", async () => {
        process.env.IP_HASH_SALT = "a-secret-salt";
        const hash = await hashIp("127.0.0.1");
        expect(hash).toMatch(/^[0-9a-f]{64}$/);
    });

    it("is deterministic for the same ip and salt", async () => {
        process.env.IP_HASH_SALT = "a-secret-salt";
        const [first, second] = await Promise.all([
            hashIp("203.0.113.7"),
            hashIp("203.0.113.7"),
        ]);
        expect(first).toBe(second);
    });

    it("produces different hashes for different ips under the same salt", async () => {
        process.env.IP_HASH_SALT = "a-secret-salt";
        const a = await hashIp("203.0.113.7");
        const b = await hashIp("203.0.113.8");
        expect(a).not.toBe(b);
    });

    it("produces different hashes for the same ip under different salts", async () => {
        process.env.IP_HASH_SALT = "salt-one";
        const withFirstSalt = await hashIp("203.0.113.7");
        process.env.IP_HASH_SALT = "salt-two";
        const withSecondSalt = await hashIp("203.0.113.7");
        expect(withFirstSalt).not.toBe(withSecondSalt);
    });
});

describe("isIpAddress", () => {
    it.each([
        ["127.0.0.1", true],
        ["203.0.113.7", true],
        ["255.255.255.255", true],
        ["0.0.0.0", true],
        ["256.1.1.1", false],
        ["999.999.999.999", false],
        ["1.2.3", false],
        ["1.2.3.4.5", false],
        ["", false],
        ["not-an-ip", false],
        ["<script>alert(1)</script>", false],
        ["2001:db8::1", true],
        ["::1", true],
        ["::ffff:203.0.113.7", true],
        ["zzzz::1", false],
    ])("maps %o to %o", (input, expected) => {
        expect(isIpAddress(input)).toBe(expected);
    });
});

describe("getClientIp", () => {
    const headers = (init: Record<string, string>) => new Headers(init);

    it("prefers x-vercel-forwarded-for over x-forwarded-for", () => {
        expect(
            getClientIp(
                headers({
                    "x-vercel-forwarded-for": "203.0.113.1",
                    "x-forwarded-for": "203.0.113.2",
                    "x-real-ip": "203.0.113.3",
                }),
            ),
        ).toBe("203.0.113.1");
    });

    it("falls back to x-forwarded-for when the vercel header is absent", () => {
        expect(
            getClientIp(
                headers({
                    "x-forwarded-for": "203.0.113.2",
                    "x-real-ip": "203.0.113.3",
                }),
            ),
        ).toBe("203.0.113.2");
    });

    it("falls back to x-real-ip when no forwarded header is present", () => {
        expect(getClientIp(headers({ "x-real-ip": "203.0.113.3" }))).toBe(
            "203.0.113.3",
        );
    });

    it("takes the first entry of a forwarded chain", () => {
        expect(
            getClientIp(headers({ "x-forwarded-for": "203.0.113.7, 70.41.3.18" })),
        ).toBe("203.0.113.7");
    });

    it("returns the fallback when no headers are present", () => {
        expect(getClientIp(headers({}))).toBe(UNKNOWN_CLIENT_IP);
    });

    it("returns the fallback for an empty x-forwarded-for", () => {
        expect(getClientIp(headers({ "x-forwarded-for": "" }))).toBe(
            UNKNOWN_CLIENT_IP,
        );
    });

    it("skips a non-ip value and uses the next valid header", () => {
        expect(
            getClientIp(
                headers({
                    "x-forwarded-for": "not-an-ip",
                    "x-real-ip": "203.0.113.3",
                }),
            ),
        ).toBe("203.0.113.3");
    });

    it("rejects a garbage value rather than treating it as a distinct client", () => {
        expect(
            getClientIp(headers({ "x-forwarded-for": "'; DROP TABLE users; --" })),
        ).toBe(UNKNOWN_CLIENT_IP);
    });

    it("does not let an attacker mint unlimited buckets with junk values", () => {
        const a = getClientIp(headers({ "x-forwarded-for": "junk-value-one" }));
        const b = getClientIp(headers({ "x-forwarded-for": "junk-value-two" }));
        expect(a).toBe(b);
        expect(a).toBe(UNKNOWN_CLIENT_IP);
    });
});

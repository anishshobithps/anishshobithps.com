import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { hashIp } from "@/lib/ip";

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

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const schema = readFileSync(
    new URL("../.env.schema", import.meta.url),
    "utf8",
);

const turbo = JSON.parse(
    readFileSync(new URL("../../../turbo.json", import.meta.url), "utf8"),
) as { tasks: { build: { env: string[]; passThroughEnv: string[] } } };

const items = [...schema.matchAll(/^([A-Z][A-Z0-9_]*)=(.*)$/gm)].map(
    ([, name, value]) => ({ name: name as string, value: (value as string).trim() }),
);

const SENSITIVE_NAME = /SECRET|_KEY$|TOKEN|^DATABASE_URL$|^IP_HASH_SALT$/;

describe(".env.schema", () => {
    it("declares at least one item", () => {
        expect(items.length).toBeGreaterThan(0);
    });

    it("lists every item in the turbo build env or passThroughEnv", () => {
        const declared = new Set([
            ...turbo.tasks.build.env,
            ...turbo.tasks.build.passThroughEnv,
        ]);
        const missing = items
            .map((item) => item.name)
            .filter((name) => !declared.has(name));
        expect(missing).toEqual([]);
    });

    it("never commits a value for a sensitive item", () => {
        const leaked = items
            .filter((item) => SENSITIVE_NAME.test(item.name) && item.value !== "")
            .map((item) => item.name);
        expect(leaked).toEqual([]);
    });
});

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function readSchemas(url: URL, seen = new Set<string>()): string[] {
    if (seen.has(url.href)) return [];
    seen.add(url.href);
    const text = readFileSync(url, "utf8");
    const imported = [...text.matchAll(/^#\s*@import\(([^,)]+)/gm)]
        .map(([, path]) => (path as string).trim())
        .filter((path) => path.endsWith(".env.schema"))
        .map((path) => new URL(path, url));
    return [text, ...imported.flatMap((next) => readSchemas(next, seen))];
}

const schema = readSchemas(new URL("../.env.schema", import.meta.url)).join(
    "\n",
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

    it("includes the items of every imported package schema", () => {
        const names = items.map((item) => item.name);
        expect(names).toContain("NEXT_PUBLIC_BASE_URL");
        expect(names).toContain("NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL");
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

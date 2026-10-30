import { afterEach, describe, expect, it, vi } from "vitest";

const defaults = { staleTime: 60_000, refetchOnWindowFocus: false, retry: 1 };

async function load(isServer: boolean) {
    vi.resetModules();
    vi.doMock("@tanstack/react-query", async (importOriginal) => ({
        ...(await importOriginal<typeof import("@tanstack/react-query")>()),
        isServer,
    }));
    return import("../src/client");
}

afterEach(() => {
    vi.doUnmock("@tanstack/react-query");
});

describe("getQueryClient on the server", () => {
    it("returns a new client for every call", async () => {
        const { getQueryClient } = await load(true);
        expect(getQueryClient()).not.toBe(getQueryClient());
    });

    it("applies the shared query defaults", async () => {
        const { getQueryClient } = await load(true);
        expect(getQueryClient().getDefaultOptions().queries).toEqual(defaults);
    });
});

describe("getQueryClient in the browser", () => {
    it("shares one client across calls", async () => {
        const { getQueryClient } = await load(false);
        expect(getQueryClient()).toBe(getQueryClient());
    });

    it("applies the same defaults", async () => {
        const { getQueryClient } = await load(false);
        expect(getQueryClient().getDefaultOptions().queries).toEqual(defaults);
    });
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createStore, createStoredValue } from "@repo/core/store";

function fakeWindow() {
  const data = new Map<string, string>();
  const target = new EventTarget();
  return {
    data,
    target,
    window: {
      localStorage: {
        getItem: (key: string) => data.get(key) ?? null,
        setItem: (key: string, value: string) => void data.set(key, value),
        removeItem: (key: string) => void data.delete(key),
      },
      addEventListener: target.addEventListener.bind(target),
      removeEventListener: target.removeEventListener.bind(target),
    },
  };
}

function storageEvent(key: string | null, newValue: string | null) {
  return Object.assign(new Event("storage"), { key, newValue });
}

describe("createStore", () => {
  it("notifies on change and skips equal values", () => {
    const store = createStore(1);
    const listener = vi.fn();
    const stop = store.subscribe(listener);

    store.set(1);
    expect(listener).not.toHaveBeenCalled();
    store.set(2);
    expect(store.get()).toBe(2);
    expect(store.getServer()).toBe(1);
    expect(listener).toHaveBeenCalledTimes(1);

    stop();
    store.set(3);
    expect(listener).toHaveBeenCalledTimes(1);
  });
});

describe("createStoredValue", () => {
  let fake: ReturnType<typeof fakeWindow>;

  beforeEach(() => {
    fake = fakeWindow();
    vi.stubGlobal("window", fake.window);
  });

  afterEach(() => vi.unstubAllGlobals());

  const previews = (onChange?: (value: boolean) => void) =>
    createStoredValue({
      key: "link-previews",
      fallback: true,
      parse: (raw) => raw !== "off",
      serialize: (on) => (on ? null : "off"),
      onChange,
    });

  it("reads storage lazily and keeps the server value", () => {
    fake.data.set("link-previews", "off");
    const store = previews();
    expect(store.getServer()).toBe(true);
    expect(store.get()).toBe(false);
  });

  it("writes, removes, and reports changes", () => {
    const onChange = vi.fn();
    const store = previews(onChange);
    const listener = vi.fn();
    store.subscribe(listener);

    store.set(false);
    expect(fake.data.get("link-previews")).toBe("off");
    store.set(true);
    expect(fake.data.has("link-previews")).toBe(false);
    expect(onChange.mock.calls).toEqual([[false], [true]]);
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it("follows other tabs only while someone listens", () => {
    const store = previews();
    const listener = vi.fn();
    const stop = store.subscribe(listener);

    fake.target.dispatchEvent(storageEvent("other", "off"));
    expect(listener).not.toHaveBeenCalled();
    fake.target.dispatchEvent(storageEvent("link-previews", "off"));
    expect(store.get()).toBe(false);
    expect(listener).toHaveBeenCalledTimes(1);

    stop();
    fake.target.dispatchEvent(storageEvent("link-previews", null));
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("reads storage again once nobody listens", () => {
    const store = previews();
    const stop = store.subscribe(() => {});
    expect(store.get()).toBe(true);
    stop();

    fake.data.set("link-previews", "off");
    expect(store.get()).toBe(false);
  });
});

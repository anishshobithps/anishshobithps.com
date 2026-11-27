import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { useDebouncedValue } from "@repo/ui/hooks/use-debounced-value";
import { useResizeObserver } from "@repo/ui/hooks/use-resize-observer";

describe("useDebouncedValue", () => {
  afterEach(() => vi.useRealTimers());

  test("only takes the latest value after the delay", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 300), {
      initialProps: { value: "a" },
    });

    rerender({ value: "ab" });
    rerender({ value: "abc" });
    expect(result.current).toBe("a");

    act(() => vi.advanceTimersByTime(300));
    expect(result.current).toBe("abc");
  });
});

describe("useResizeObserver", () => {
  test("observes the element and disconnects on unmount", () => {
    const observe = vi.fn();
    const disconnect = vi.fn();
    let callback: ResizeObserverCallback = () => {};
    vi.stubGlobal(
      "ResizeObserver",
      class {
        constructor(cb: ResizeObserverCallback) {
          callback = cb;
        }
        observe = observe;
        disconnect = disconnect;
        unobserve() {}
      },
    );

    const onResize = vi.fn();
    const element = document.createElement("div");
    const { unmount } = renderHook(() => useResizeObserver(element, onResize));

    expect(observe).toHaveBeenCalledWith(element);
    callback([], {} as ResizeObserver);
    expect(onResize).toHaveBeenCalledTimes(1);

    unmount();
    expect(disconnect).toHaveBeenCalledTimes(1);
    vi.unstubAllGlobals();
  });
});

import { useEffect, type RefObject } from "react";

/**
 * Grow a textarea to fit its content, up to `maxHeight` (px). Re-runs whenever
 * `value` changes so the height tracks typing.
 */
export function useAutoResizeTextarea(
    ref: RefObject<HTMLTextAreaElement | null>,
    value: string,
    maxHeight = 200,
): void {
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        el.style.height = "auto";
        el.style.height = Math.min(el.scrollHeight, maxHeight) + "px";
    }, [ref, value, maxHeight]);
}

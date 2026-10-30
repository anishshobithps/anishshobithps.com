import { useEffect, type RefObject } from "react";

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

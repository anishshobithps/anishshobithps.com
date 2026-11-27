import { useEffect, useEffectEvent } from "react";

export function useResizeObserver(
  element: Element | null,
  onResize: ResizeObserverCallback,
) {
  const handleResize = useEffectEvent(onResize);

  useEffect(() => {
    if (!element) return;
    const observer = new ResizeObserver((entries, self) => handleResize(entries, self));
    observer.observe(element);
    return () => observer.disconnect();
  }, [element]);
}

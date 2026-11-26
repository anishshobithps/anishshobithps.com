import { useVirtualizer, type VirtualItem } from "@tanstack/react-virtual";
import { type CSSProperties, useRef } from "react";

export function useVirtualList({
  count,
  estimateSize,
  overscan,
}: {
  count: number;
  estimateSize: number;
  overscan: number;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count,
    getScrollElement: () => viewportRef.current,
    estimateSize: () => estimateSize,
    overscan,
  });

  return {
    viewportRef,
    virtualizer,
    items: virtualizer.getVirtualItems(),
    totalSize: virtualizer.getTotalSize(),
    itemProps: (row: VirtualItem) => {
      const style: CSSProperties = {
        position: "absolute",
        insetInline: 0,
        top: 0,
        transform: `translateY(${row.start}px)`,
      };
      return {
        ref: virtualizer.measureElement,
        "data-index": row.index,
        style,
      };
    },
  };
}

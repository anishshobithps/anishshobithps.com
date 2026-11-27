"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@repo/ui/components/button";
import { Text } from "@repo/ui/components/typography";
import { cn } from "@repo/ui/lib/cn";

export function ExpandableText({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const id = useId();
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || expanded) return;
    const measure = () =>
      setOverflowing(node.scrollHeight > node.clientHeight + 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [children, expanded]);

  return (
    <div className="flex min-w-0 flex-col items-start gap-1">
      <Text
        ref={ref}
        id={id}
        variant="none"
        className={cn(
          "w-full text-sm leading-relaxed whitespace-pre-wrap wrap-anywhere",
          !expanded && "line-clamp-4",
          className,
        )}
      >
        {children}
      </Text>
      {(overflowing || expanded) && (
        <Button
          type="button"
          variant="link"
          size="sm"
          aria-expanded={expanded}
          aria-controls={id}
          onClick={() => setExpanded((value) => !value)}
          className="h-auto p-0 text-xs"
        >
          {expanded ? "Show less" : "Show more"}
        </Button>
      )}
    </div>
  );
}

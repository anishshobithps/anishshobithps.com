"use client";

import { useEffect, useRef, useState } from "react";

export function ScaledOG({ children }: { children: React.ReactNode }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const update = () => setScale(el.clientWidth / 1200);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="w-full overflow-hidden"
      aria-label="Open Graph image preview"
      role="img"
      style={{ height: 630 * scale }}
    >
      <div
        aria-hidden="true"
        style={{
          width: 1200,
          height: 630,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {children}
      </div>
    </div>
  );
}

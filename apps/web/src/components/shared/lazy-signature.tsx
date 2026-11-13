"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { signatureWidth } from "@/lib/signature-size";

const SignatureIsland = dynamic(
  () => import("@/components/shared/signature-island"),
  { ssr: false },
);

const HEIGHT = 100;

export function LazySignature() {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: "400px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ width: signatureWidth, height: HEIGHT }}
      className="max-w-full"
    >
      {near && <SignatureIsland />}
    </div>
  );
}

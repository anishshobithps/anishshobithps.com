"use client";

import { useEffect, useRef, useState } from "react";

interface Point {
  x: number;
  y: number;
}

const GLOW_SIZE = 100;
const GLOW_COLOR = "var(--glow)";

function getTouchPoint(event: TouchEvent): Point | null {
  const touch = event.touches[0];
  if (!touch) return null;
  return { x: touch.clientX, y: touch.clientY };
}

export function MouseGlow() {
  const glowRef = useRef<HTMLDivElement | null>(null);
  const positionRef = useRef<Point | null>(null);
  const rafRef = useRef<number | null>(null);
  const visibleRef = useRef(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    function scheduleFrame() {
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        if (glowRef.current && positionRef.current) {
          const { x, y } = positionRef.current;
          glowRef.current.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
        }
        rafRef.current = null;
      });
    }

    function updatePointer(x: number, y: number) {
      positionRef.current = { x, y };
      scheduleFrame();
    }

    function updateVisibility(next: boolean) {
      if (visibleRef.current === next) return;
      visibleRef.current = next;
      setIsVisible(next);
    }

    function handlePointerMove(event: PointerEvent) {
      updatePointer(event.clientX, event.clientY);
      updateVisibility(true);
    }

    function handlePointerLeave() {
      updateVisibility(false);
    }
    function handlePointerEnter() {
      updateVisibility(true);
    }

    function handleTouchStart(event: TouchEvent) {
      const point = getTouchPoint(event);
      if (!point) return;
      updatePointer(point.x, point.y);
      updateVisibility(true);
    }

    function handleTouchMove(event: TouchEvent) {
      const point = getTouchPoint(event);
      if (!point) return;
      updatePointer(point.x, point.y);
    }

    function handleTouchEnd() {
      updateVisibility(false);
    }

    document.addEventListener("pointermove", handlePointerMove, { signal });
    document.addEventListener("pointerenter", handlePointerEnter, { signal });
    document.addEventListener("pointerleave", handlePointerLeave, { signal });
    document.addEventListener("touchstart", handleTouchStart, { signal, passive: true });
    document.addEventListener("touchmove", handleTouchMove, { signal, passive: true });
    document.addEventListener("touchend", handleTouchEnd, { signal, passive: true });
    document.addEventListener("touchcancel", handleTouchEnd, { signal });

    return () => {
      controller.abort();
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      ref={glowRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 blur-3xl will-change-transform"
      style={{
        width: GLOW_SIZE,
        height: GLOW_SIZE,
        backgroundColor: GLOW_COLOR,
        borderRadius: "50%",
        transform: "translate(-9999px, -9999px)",
        opacity: isVisible ? 1 : 0,
      }}
    />
  );
}

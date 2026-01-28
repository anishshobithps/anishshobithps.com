import { useEffect, useRef, useState } from "react";
interface Point {
  x: number;
  y: number;
}

const GLOW_SIZE = 175;
const GLOW_COLOR = "hsla(23, 68%, 37%, 0.5)";

function getTouchPoint(event: TouchEvent): Point | null {
  const touch = event.touches[0];
  if (!touch) return null;

  return { x: touch.clientX, y: touch.clientY };
}

export function MouseGlow() {
  const [position, setPosition] = useState<Point | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    function updatePosition(x: number, y: number) {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }

      rafIdRef.current = requestAnimationFrame(() => {
        setPosition({ x, y });
        setIsVisible(true);
      });
    }

    function handlePointerMove(event: PointerEvent) {
      updatePosition(event.clientX, event.clientY);
    }

    function handlePointerEnter() {
      setIsVisible(true);
    }

    function handlePointerLeave() {
      setIsVisible(false);
    }

    function handleTouchStart(event: TouchEvent) {
      const point = getTouchPoint(event);
      if (!point) return;

      updatePosition(point.x, point.y);
    }

    function handleTouchMove(event: TouchEvent) {
      const point = getTouchPoint(event);
      if (!point) return;

      updatePosition(point.x, point.y);
    }

    function handleTouchEnd() {
      setIsVisible(false);
    }

    document.addEventListener("pointermove", handlePointerMove, { signal });
    document.addEventListener("pointerenter", handlePointerEnter, { signal });
    document.addEventListener("pointerleave", handlePointerLeave, { signal });

    document.addEventListener("touchstart", handleTouchStart, { signal });
    document.addEventListener("touchmove", handleTouchMove, { signal });
    document.addEventListener("touchend", handleTouchEnd, { signal });
    document.addEventListener("touchcancel", handleTouchEnd, { signal });

    return () => {
      controller.abort();

      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  if (!position) return null;

  return (
    <div
      className="pointer-events-none fixed -z-30 blur-3xl transition-opacity duration-200"
      style={{
        top: position.y,
        left: position.x,
        width: GLOW_SIZE,
        height: GLOW_SIZE,
        backgroundColor: GLOW_COLOR,
        borderRadius: "50%",
        transform: "translate(-50%, -50%)",
        opacity: isVisible ? 1 : 0,
      }}
    />
  );
}

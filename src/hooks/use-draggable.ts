"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Point = { x: number; y: number };

const MARGIN = 16;
const DRAG_THRESHOLD = 6;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function clampToViewport(point: Point, size: number): Point {
  const maxX = Math.max(MARGIN, window.innerWidth - size - MARGIN);
  const maxY = Math.max(MARGIN, window.innerHeight - size - MARGIN);
  return { x: clamp(point.x, MARGIN, maxX), y: clamp(point.y, MARGIN, maxY) };
}

export function useDraggable(storageKey: string, size: number) {
  const [position, setPosition] = useState<Point | null>(null);
  const [dragging, setDragging] = useState(false);
  const moved = useRef(false);
  const gesture = useRef({
    pointerId: -1,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
  });

  useEffect(() => {
    let stored: Point | null = null;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Point>;
        if (typeof parsed.x === "number" && typeof parsed.y === "number") {
          stored = { x: parsed.x, y: parsed.y };
        }
      }
    } catch {
      stored = null;
    }

    const fallback: Point = {
      x: window.innerWidth - size - MARGIN,
      y: window.innerHeight - size - MARGIN,
    };

    setPosition(clampToViewport(stored ?? fallback, size));

    const onResize = () =>
      setPosition((prev) => (prev ? clampToViewport(prev, size) : prev));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [storageKey, size]);

  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (event.button !== 0) return;
      event.currentTarget.setPointerCapture(event.pointerId);
      moved.current = false;
      gesture.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        originX: position?.x ?? 0,
        originY: position?.y ?? 0,
      };
    },
    [position],
  );

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      const state = gesture.current;
      if (state.pointerId !== event.pointerId) return;

      const dx = event.clientX - state.startX;
      const dy = event.clientY - state.startY;

      if (!moved.current && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;

      moved.current = true;
      setDragging(true);
      setPosition(
        clampToViewport({ x: state.originX + dx, y: state.originY + dy }, size),
      );
    },
    [size],
  );

  const endGesture = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      const state = gesture.current;
      if (state.pointerId !== event.pointerId) return;
      gesture.current.pointerId = -1;
      setDragging(false);
      setPosition((prev) => {
        if (prev) {
          try {
            localStorage.setItem(storageKey, JSON.stringify(prev));
          } catch {
            void 0;
          }
        }
        return prev;
      });
    },
    [storageKey],
  );

  return {
    position,
    dragging,
    moved,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endGesture,
      onPointerCancel: endGesture,
    },
  };
}

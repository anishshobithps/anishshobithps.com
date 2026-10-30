"use client";

import { Logo } from "@/components/shared/logo";
import { useEffect, useRef } from "react";

const LOGO_SIZE = 40;
const LOGO_W = Math.round(((64 - 14) / 64) * LOGO_SIZE);

type Instance = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  vr: number;
};

function makeInstances(count: number): Instance[] {
  return Array.from({ length: count }).map(() => ({
    x: Math.random() * (window.innerWidth - LOGO_W),
    y: Math.random() * (window.innerHeight - LOGO_SIZE),
    vx: (Math.random() < 0.5 ? 1 : -1) * (0.8 + Math.random() * 0.8),
    vy: (Math.random() < 0.5 ? 1 : -1) * (0.8 + Math.random() * 0.8),
    rotation: Math.random() * 360,
    vr: (Math.random() - 0.5) * 0.5,
  }));
}

interface BouncingLogosProps {
  count?: number;
  opacity?: string;
  containerRef: React.RefObject<HTMLElement | null>;
}

export function BouncingLogos({
  count = 6,
  opacity = "opacity-[0.06]",
  containerRef,
}: BouncingLogosProps) {
  const elsRef = useRef<(HTMLDivElement | null)[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const instances = makeInstances(count);

    const paint = () => {
      instances.forEach((inst, i) => {
        const el = elsRef.current[i];
        if (el) {
          el.style.transform = `translate3d(${inst.x}px, ${inst.y}px, 0) rotate(${inst.rotation}deg)`;
        }
      });
    };

    paint();

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const tick = () => {
      const maxX = container.clientWidth - LOGO_W;
      const maxY = container.clientHeight - LOGO_SIZE;

      for (const inst of instances) {
        inst.x += inst.vx;
        inst.y += inst.vy;
        inst.rotation += inst.vr;

        if (inst.x <= 0) {
          inst.x = 0;
          inst.vx = Math.abs(inst.vx);
        }
        if (inst.x >= maxX) {
          inst.x = maxX;
          inst.vx = -Math.abs(inst.vx);
        }
        if (inst.y <= 0) {
          inst.y = 0;
          inst.vy = Math.abs(inst.vy);
        }
        if (inst.y >= maxY) {
          inst.y = maxY;
          inst.vy = -Math.abs(inst.vy);
        }
      }

      paint();
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [containerRef, count]);

  return (
    <div role="presentation" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          ref={(el) => {
            elsRef.current[i] = el;
          }}
          className={`pointer-events-none absolute ${opacity}`}
          style={{ top: 0, left: 0 }}
        >
          <Logo
            size={LOGO_SIZE}
            className="text-foreground"
            aria-hidden="true"
          />
        </div>
      ))}
    </div>
  );
}

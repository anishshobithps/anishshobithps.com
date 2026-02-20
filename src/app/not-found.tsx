"use client";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
} from "@/components/ui/empty";
import { Logo } from "@/components/shared/logo";
import { HomeIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";

const LOGO_SIZE = 40;
const LOGO_W = Math.round(((64 - 14) / 64) * LOGO_SIZE);
const COUNT = 6;

type Instance = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  vr: number;
  el: HTMLDivElement | null;
};

function makeInstances(): Instance[] {
  return Array.from({ length: COUNT }).map(() => ({
    x: Math.random() * (window.innerWidth - LOGO_W),
    y: Math.random() * (window.innerHeight - LOGO_SIZE),
    vx: (Math.random() < 0.5 ? 1 : -1) * (0.8 + Math.random() * 0.8),
    vy: (Math.random() < 0.5 ? 1 : -1) * (0.8 + Math.random() * 0.8),
    rotation: Math.random() * 360,
    vr: (Math.random() - 0.5) * 0.5,
    el: null,
  }));
}

export default function NotFound() {
  const containerRef = useRef<HTMLDivElement>(null);
  const instancesRef = useRef<Instance[]>([]);
  const rafRef = useRef<number>(0);

  if (instancesRef.current.length === 0 && typeof window !== "undefined") {
    instancesRef.current = makeInstances();
  }

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    for (const inst of instancesRef.current) {
      if (inst.el) {
        inst.el.style.transform = `translate3d(${inst.x}px, ${inst.y}px, 0) rotate(${inst.rotation}deg)`;
      }
    }

    const tick = () => {
      const maxX = container.clientWidth - LOGO_W;
      const maxY = container.clientHeight - LOGO_SIZE;

      for (const inst of instancesRef.current) {
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

        if (inst.el) {
          inst.el.style.transform = `translate3d(${inst.x}px, ${inst.y}px, 0) rotate(${inst.rotation}deg)`;
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative flex min-h-screen flex-col items-center justify-center gap-6 overflow-hidden"
    >
      {Array.from({ length: COUNT }).map((_, i) => (
        <div
          key={i}
          ref={(el) => {
            const inst = instancesRef.current[i];
            if (!inst) return;
            inst.el = el;
            if (el) {
              el.style.transform = `translate3d(${inst.x}px, ${inst.y}px, 0) rotate(${inst.rotation}deg)`;
            }
          }}
          className="pointer-events-none absolute opacity-[0.06]"
          style={{ willChange: "transform", top: 0, left: 0 }}
        >
          <Logo size={LOGO_SIZE} className="text-foreground" />
        </div>
      ))}

      <Empty className="z-10 backdrop-blur-sm">
        <EmptyHeader>
          {/* ── Flickering 404 SVG ── */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 280 100"
            width="280"
            height="100"
            fill="none"
            aria-label="404"
            className="text-foreground"
          >
            <defs>
              <style>{`
                .nf-n {
                  font-family: var(--font-geist-mono), ui-monospace, monospace;
                  font-size: 96px;
                  font-weight: 600;
                  letter-spacing: -0.03em;
                  fill: currentColor;
                }
              `}</style>
            </defs>

            {/* Left "4" */}
            <g>
              <text className="nf-n" x="0" y="88">
                4
              </text>
              <animate
                attributeName="opacity"
                calcMode="discrete"
                values="1;1;1;1;0.15;1;1;0.9;1;1;1;0.1;1;1;1;1;0.8;0.1;1;1"
                keyTimes="0;0.05;0.1;0.15;0.17;0.19;0.3;0.31;0.33;0.4;0.5;0.52;0.54;0.6;0.7;0.75;0.76;0.77;0.79;1"
                dur="4s"
                repeatCount="indefinite"
              />
            </g>

            {/* Centre logo glyph */}
            <g>
              <g transform="translate(88, 12) scale(1.2)">
                <polygon
                  points="32,4 48,60 40.5,60 32,14 23.5,60 16,60"
                  fill="currentColor"
                />
                <rect
                  x="18"
                  y="36"
                  width="11"
                  height="5"
                  rx="2.5"
                  fill="currentColor"
                />
                <rect
                  x="35"
                  y="36"
                  width="11"
                  height="5"
                  rx="2.5"
                  fill="currentColor"
                />
              </g>
              <animate
                attributeName="opacity"
                calcMode="discrete"
                values="1;0.05;1;1;0.1;0.9;0.05;1;0.8;0.05;1;1;0.1;1;0.05;0.9;1;0.05;1;1"
                keyTimes="0;0.08;0.1;0.2;0.22;0.24;0.26;0.28;0.4;0.42;0.44;0.5;0.55;0.57;0.6;0.62;0.7;0.85;0.87;1"
                dur="3.2s"
                repeatCount="indefinite"
              />
            </g>

            {/* Right "4" */}
            <g>
              <text className="nf-n" x="188" y="88">
                4
              </text>
              <animate
                attributeName="opacity"
                calcMode="discrete"
                values="1;1;1;0.2;1;1;1;1;0.1;0.8;0.1;1;1;1;0.15;1;1;1;0.05;1"
                keyTimes="0;0.1;0.2;0.22;0.24;0.3;0.4;0.45;0.47;0.49;0.51;0.53;0.6;0.65;0.67;0.69;0.8;0.9;0.92;1"
                dur="3.7s"
                repeatCount="indefinite"
              />
            </g>
          </svg>

          <div className="space-y-2 text-center">
            <p className="text-lg font-semibold tracking-tight">
              Even my 404 has motion
            </p>
            <EmptyDescription className="text-muted-foreground">
              I spent weeks on this site and you landed on the one page that
              doesn't exist, <br /> Respect the effort.
            </EmptyDescription>
          </div>
        </EmptyHeader>

        <EmptyContent>
          <Button asChild size="lg">
            <Link href="/" className="flex items-center gap-2">
              <HomeIcon data-icon="inline-start" />
              Go Home
            </Link>
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  );
}

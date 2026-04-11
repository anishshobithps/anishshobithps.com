"use client";
import { useEffect, useId, useState } from "react";
import { LazyMotion, domAnimation, m } from "motion/react";
import opentype from "opentype.js";

interface SignatureProps {
  text?: string;
  color?: string;
  fontSize?: number;
  duration?: number;
  delay?: number;
  className?: string;
  once?: boolean;
}

let cachedFont: opentype.Font | null = null;
let fontLoadPromise: Promise<opentype.Font> | null = null;

function loadFont(): Promise<opentype.Font> {
  if (cachedFont) return Promise.resolve(cachedFont);
  if (!fontLoadPromise) {
    fontLoadPromise = fetch("/fonts/LastoriaBoldRegular.otf")
      .then((res) => res.arrayBuffer())
      .then((buf) => {
        cachedFont = opentype.parse(buf);
        return cachedFont;
      });
  }
  return fontLoadPromise;
}

export function Signature({
  text = "Signature",
  color = "var(--foreground)",
  fontSize = 14,
  duration = 1.5,
  delay = 0,
  className,
  once = true,
}: SignatureProps) {
  const [paths, setPaths] = useState<string[]>([]);
  const [width, setWidth] = useState(300);

  const height = 100;
  const horizontalPadding = fontSize * 0.1;
  const topMargin = Math.max(5, (height - fontSize) / 2);
  const baseline = Math.min(height - 5, topMargin + fontSize);
  const maskId = `sig-${useId().replace(/:/g, "")}`;

  useEffect(() => {
    let cancelled = false;
    loadFont()
      .then((font) => {
        if (cancelled) return;
        let x = horizontalPadding;
        const next: string[] = [];

        for (const char of text) {
          const glyph = font.charToGlyph(char);
          next.push(glyph.getPath(x, baseline, fontSize).toPathData(3));
          x +=
            (glyph.advanceWidth ?? font.unitsPerEm) *
            (fontSize / font.unitsPerEm);
        }

        setPaths(next);
        setWidth(() => x + horizontalPadding);
      })
      .catch(() => {
        if (cancelled) return;
        setPaths([]);
        setWidth(() => text.length * fontSize * 0.6);
      });
    return () => {
      cancelled = true;
    };
  }, [text, fontSize, baseline, horizontalPadding]);

  const variants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: { pathLength: 1, opacity: 1 },
  };

  return (
    <LazyMotion features={domAnimation}>
      <m.svg
        key={paths.length}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        fill="none"
        className={className}
        initial="hidden"
        whileInView="visible"
        viewport={{ once, amount: 0.5 }}
      >
        <defs>
          <mask id={maskId} maskUnits="userSpaceOnUse">
            {paths.map((d, i) => (
              <m.path
                key={`mask-${i}-${d.slice(0, 8)}`}
                d={d}
                stroke="white"
                strokeWidth={fontSize * 0.22}
                fill="none"
                variants={variants}
                transition={{
                  pathLength: {
                    delay: delay + i * 0.2,
                    duration,
                    ease: "easeInOut",
                  },
                  opacity: { delay: delay + i * 0.2 + 0.01, duration: 0.01 },
                }}
                vectorEffect="non-scaling-stroke"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
          </mask>
        </defs>

        {paths.map((d, i) => (
          <m.path
            key={`stroke-${i}-${d.slice(0, 8)}`}
            d={d}
            stroke={color}
            strokeWidth={2}
            fill="none"
            variants={variants}
            transition={{
              pathLength: {
                delay: delay + i * 0.2,
                duration,
                ease: "easeInOut",
              },
              opacity: { delay: delay + i * 0.2 + 0.01, duration: 0.01 },
            }}
            vectorEffect="non-scaling-stroke"
            strokeLinecap="butt"
            strokeLinejoin="round"
          />
        ))}

        <g mask={`url(#${maskId})`}>
          {paths.map((d, i) => (
            <path key={`fill-${i}-${d.slice(0, 8)}`} d={d} fill={color} />
          ))}
        </g>
      </m.svg>
    </LazyMotion>
  );
}

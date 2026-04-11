"use client";
import { useEffect, useId, useReducer } from "react";
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

type SigState = { entries: { d: string; key: string }[]; width: number };

export function Signature({
  text = "Signature",
  color = "var(--foreground)",
  fontSize = 14,
  duration = 1.5,
  delay = 0,
  className,
  once = true,
}: SignatureProps) {
  const [{ entries, width }, dispatch] = useReducer(
    (_: SigState, next: SigState) => next,
    { entries: [], width: 300 },
  );

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
        const next: { d: string; key: string }[] = [];

        for (const char of text) {
          const glyph = font.charToGlyph(char);
          const d = glyph.getPath(x, baseline, fontSize).toPathData(3);
          next.push({ d, key: `${char}@${Math.round(x)}` });
          x +=
            (glyph.advanceWidth ?? font.unitsPerEm) *
            (fontSize / font.unitsPerEm);
        }

        dispatch({ entries: next, width: x + horizontalPadding });
      })
      .catch(() => {
        if (cancelled) return;
        dispatch({ entries: [], width: text.length * fontSize * 0.6 });
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
        key={entries.length}
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
            {entries.map(({ d, key }, entryIndex) => (
              <m.path
                key={`mask-${key}`}
                d={d}
                stroke="white"
                strokeWidth={fontSize * 0.22}
                fill="none"
                variants={variants}
                transition={{
                  pathLength: {
                    delay: delay + entryIndex * 0.2,
                    duration,
                    ease: "easeInOut",
                  },
                  opacity: {
                    delay: delay + entryIndex * 0.2 + 0.01,
                    duration: 0.01,
                  },
                }}
                vectorEffect="non-scaling-stroke"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
          </mask>
        </defs>

        {entries.map(({ d, key }, entryIndex) => (
          <m.path
            key={`stroke-${key}`}
            d={d}
            stroke={color}
            strokeWidth={2}
            fill="none"
            variants={variants}
            transition={{
              pathLength: {
                delay: delay + entryIndex * 0.2,
                duration,
                ease: "easeInOut",
              },
              opacity: {
                delay: delay + entryIndex * 0.2 + 0.01,
                duration: 0.01,
              },
            }}
            vectorEffect="non-scaling-stroke"
            strokeLinecap="butt"
            strokeLinejoin="round"
          />
        ))}

        <g mask={`url(#${maskId})`}>
          {entries.map(({ d, key }) => (
            <path key={`fill-${key}`} d={d} fill={color} />
          ))}
        </g>
      </m.svg>
    </LazyMotion>
  );
}

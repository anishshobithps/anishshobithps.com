"use client";
import { useId } from "react";
import { LazyMotion, domAnimation, m, useReducedMotion } from "motion/react";

interface SignatureProps {
  entries: { d: string; key: string }[];
  width: number;
  color?: string;
  fontSize?: number;
  duration?: number;
  delay?: number;
  className?: string;
  once?: boolean;
}

export function Signature({
  entries,
  width,
  color = "var(--foreground)",
  fontSize = 14,
  duration = 1.5,
  delay = 0,
  className,
  once = true,
}: SignatureProps) {
  const height = 100;
  const maskId = `sig-${useId().replace(/:/g, "")}`;
  const reduceMotion = useReducedMotion();

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
        initial={reduceMotion ? "visible" : "hidden"}
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

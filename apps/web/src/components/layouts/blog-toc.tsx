"use client";

import { SectionLabel } from "@repo/ui/components/typography";
import { cn } from "@repo/ui/lib/cn";
import { TOCItem, useActiveAnchor, useActiveAnchors } from "fumadocs-core/toc";
import { useTOCItems } from "fumadocs-ui/components/toc";
import {
  type ComponentProps,
  type CSSProperties,
  type RefObject,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const clamp = (value: number) => Math.min(Math.max(value, 0), 1);

export const pad = (value: number) => String(value).padStart(2, "0");

export function useReadingProgress(target: RefObject<HTMLElement | null>) {
  const [reading, setReading] = useState({ progress: 0, engaged: false });

  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      const el = target.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const span = rect.height - window.innerHeight;
      const progress = span <= 0 ? (rect.top <= 0 ? 1 : 0) : clamp(-rect.top / span);
      const engaged = rect.top < 72 && rect.bottom > 72;
      setReading((prev) =>
        prev.progress === progress && prev.engaged === engaged ? prev : { progress, engaged },
      );
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [target]);

  return reading;
}

export function useTOCState() {
  const items = useTOCItems();
  const visible = useActiveAnchors();
  const estimate = useActiveAnchor();
  const active = useMemo(
    () => (visible.length > 0 ? visible : estimate ? [estimate] : []),
    [visible, estimate],
  );
  return useMemo(() => {
    const ids = items.map((item) => item.url.slice(1));
    const activeSet = new Set(active);
    const first = ids.findIndex((id) => activeSet.has(id));
    const top = Math.min(...items.map((item) => item.depth));
    let count = 0;
    const numbers = items.map((item) => (item.depth === top ? ++count : null));
    return { items, ids, activeSet, first, top, numbers, sections: count };
  }, [items, active]);
}

export function currentSection(state: ReturnType<typeof useTOCState>) {
  if (state.first === -1) return { index: -1, number: 0 };
  for (let i = state.first; i >= 0; i--) {
    const number = state.numbers[i];
    if (number != null) return { index: i, number };
  }
  return { index: state.first, number: 0 };
}

const COLUMNS = 26;
const ROWS = 3;

export function HalftoneMeter({
  progress,
  columns = COLUMNS,
  rows = ROWS,
  className,
}: {
  progress: number;
  columns?: number;
  rows?: number;
  className?: string;
}) {
  const filled = Math.round(progress * columns);
  return (
    <div aria-hidden="true" className={className}>
      <div
        className="grid grid-cols-(--cols) gap-0.75"
        style={{ "--cols": `repeat(${columns}, minmax(0, 1fr))` } as CSSProperties}
      >
        {Array.from({ length: columns * rows }, (_, index) => {
          const column = index % columns;
          const row = Math.floor(index / columns);
          const on = column < filled;
          return (
            <span
              key={index}
              className={cn(
                "aspect-square justify-self-center rounded-full transition-[background-color,scale] delay-(--delay) duration-500 ease-out motion-reduce:transition-none",
                row === 1 ? "w-full max-w-[5px]" : "w-3/4 max-w-[4px]",
                on ? "scale-100 bg-(--brand)" : "scale-75 bg-foreground/20",
              )}
              style={{ "--delay": `${column * 14 + row * 40}ms` } as CSSProperties}
            />
          );
        })}
      </div>
    </div>
  );
}

const RAIL = 9;
const NEST = 21;
const BEND = 7;

function railPath(list: HTMLElement, nested: boolean[]) {
  const box = list.getBoundingClientRect();
  const rows = Array.from(list.querySelectorAll<HTMLElement>(":scope > li"));
  let d = "";
  rows.forEach((row, index) => {
    const rect = row.getBoundingClientRect();
    const x = nested[index] ? NEST : RAIL;
    const prev = index > 0 ? (nested[index - 1] ? NEST : RAIL) : x;
    const next = index < rows.length - 1 ? (nested[index + 1] ? NEST : RAIL) : x;
    const top = rect.top - box.top + (prev !== x ? BEND : 0);
    const bottom = rect.bottom - box.top - (next !== x ? BEND : 0);
    if (index === 0) d += `M${x} ${top + 6}`;
    else if (prev !== x) {
      const from = rows[index - 1]!.getBoundingClientRect().bottom - box.top - BEND;
      const mid = (from + top) / 2;
      d += `C${prev} ${mid} ${x} ${mid} ${x} ${top}`;
    }
    d += `L${x} ${index === rows.length - 1 ? bottom - 6 : bottom}`;
  });
  return d;
}

export function PressList({ className }: { className?: string }) {
  const state = useTOCState();
  const listRef = useRef<HTMLOListElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const id = useId();
  const nested = useMemo(
    () => state.items.map((item) => item.depth > state.top),
    [state.items, state.top],
  );

  useLayoutEffect(() => {
    const list = listRef.current;
    const svg = svgRef.current;
    if (!list || !svg) return;
    const place = () => {
      const d = railPath(list, nested);
      svg.setAttribute("height", String(list.scrollHeight));
      for (const path of svg.querySelectorAll("path")) path.setAttribute("d", d);
      const links = Array.from(list.querySelectorAll<HTMLElement>('[data-active="true"]'));
      if (links.length === 0) {
        list.style.setProperty("--thumb-height", "0px");
        return;
      }
      const box = list.getBoundingClientRect();
      const start = links[0]!.getBoundingClientRect().top - box.top;
      const end = links[links.length - 1]!.getBoundingClientRect().bottom - box.top;
      list.style.setProperty("--thumb-top", `${start + 2}px`);
      list.style.setProperty("--thumb-height", `${Math.max(0, end - start - 4)}px`);
    };
    place();
    const observer = new ResizeObserver(place);
    observer.observe(list);
    return () => observer.disconnect();
  }, [state.activeSet, nested]);

  if (state.items.length === 0) return null;

  const slow = `${id}-green`;

  return (
    <ol ref={listRef} className={cn("relative flex flex-col py-1 pl-6", className)}>
      <svg
        ref={svgRef}
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 w-8 overflow-visible"
      >
        <defs>
          <clipPath id={slow}>
            <rect
              x="0"
              width="40"
              className="[y:var(--thumb-top,0)] [height:var(--thumb-height,0)] transition-[y,height] duration-500 ease-out motion-reduce:transition-none"
            />
          </clipPath>
        </defs>
        <path fill="none" strokeWidth="1" className="stroke-foreground/20" />
        <g clipPath={`url(#${slow})`}>
          <path fill="none" strokeWidth="2" strokeLinecap="round" className="stroke-(--brand)" />
        </g>
      </svg>
      {state.items.map((item, index) => {
        const id = state.ids[index]!;
        const deep = nested[index];
        const active = state.activeSet.has(id);
        const read = state.first !== -1 && index < state.first;
        const number = state.numbers[index];
        return (
          <li key={item.url} className="relative">
            <span
              aria-hidden="true"
              className={cn(
                "absolute top-1/2 z-10 -translate-y-1/2 rounded-full border transition-[background-color,border-color,scale] duration-300 motion-reduce:transition-none",
                deep ? "-left-[5.5px] size-[5px]" : "-left-[18.5px] size-[7px]",
                active
                  ? "scale-125 border-(--brand) bg-(--brand)"
                  : read
                    ? "border-muted-foreground bg-muted-foreground"
                    : "border-foreground/25 bg-background",
              )}
            />
            <TOCItem
              href={item.url}
              className={cn(
                "group/toc flex items-baseline gap-2 rounded-sm py-1.5 pr-1 text-sm leading-snug outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50",
                deep && "pl-4",
                active
                  ? "text-foreground"
                  : read
                    ? "text-muted-foreground/70 hover:text-foreground"
                    : "text-muted-foreground hover:text-foreground",
              )}
            >
              {number != null && (
                <SectionLabel pixel asChild accent={active} className="w-5 shrink-0">
                  <span>{pad(number)}</span>
                </SectionLabel>
              )}
              <span className="min-w-0 text-pretty transition-transform duration-200 group-hover/toc:translate-x-0.5 motion-reduce:transition-none">
                {item.title}
              </span>
            </TOCItem>
          </li>
        );
      })}
    </ol>
  );
}

export function RegisterDial({
  progress,
  size = 18,
  className,
  ...props
}: ComponentProps<"svg"> & { progress: number; size?: number }) {
  const stroke = 2;
  const radius = (size - stroke * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const slip = (1 - progress) * 1.6;
  const center = size / 2;
  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
      aria-label={`Reading progress: ${Math.round(progress * 100)}%`}
      className={cn("overflow-visible", className)}
      {...props}
    >
      <circle cx={center} cy={center} r={radius} fill="none" strokeWidth={stroke} className="stroke-foreground/15" />
      <g
        className="transition-transform duration-500 ease-out motion-reduce:transition-none"
        style={{ transform: `translate(${slip}px, ${slip * 0.7}px)` }}
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
          transform={`rotate(-90 ${center} ${center})`}
          className="stroke-(--brand) transition-[stroke-dashoffset] duration-300 ease-out motion-reduce:transition-none"
        />
      </g>
      <path
        d={`M${center} ${center - 3}V${center + 3}M${center - 3} ${center}H${center + 3}`}
        strokeWidth={1.25}
        strokeLinecap="round"
        className="stroke-foreground/70"
      />
    </svg>
  );
}

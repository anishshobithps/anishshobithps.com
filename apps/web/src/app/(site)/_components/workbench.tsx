"use client";

import type { workbenchScene } from "@repo/iso/scenes/workbench";
import { Input } from "@repo/ui/components/input";
import {
  TypographyMuted,
  TypographySmall,
} from "@repo/ui/components/typography";
import { usePrefersReducedMotion } from "@repo/ui/hooks/use-prefers-reduced-motion";
import { DraggableRenderer, translate, type Draggable } from "dragology";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";

type Stage = { station: number };
type WorkbenchProps = Omit<ReturnType<typeof workbenchScene>, "scene"> & {
  width: number;
  height: number;
  children: ReactNode;
};

export function Workbench({
  stations,
  origin,
  robot,
  width,
  height,
  children,
}: WorkbenchProps) {
  const [stage, setStage] = useState<Stage>({ station: 0 });
  const [dragSession, setDragSession] = useState(0);
  const pointer = useRef<number | null>(null);
  const reducedMotion = usePrefersReducedMotion();
  const station = stations[stage.station]!;
  const id = useId();
  const instructionsId = `${id}-instructions`;

  useEffect(() => {
    function release(event: PointerEvent) {
      if (event.pointerId === pointer.current) pointer.current = null;
    }

    function cancel() {
      if (pointer.current === null) return;
      pointer.current = null;
      setDragSession((session) => session + 1);
    }

    function cancelPointer(event: PointerEvent) {
      if (event.pointerId === pointer.current) cancel();
    }

    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", cancelPointer);
    window.addEventListener("blur", cancel);
    return () => {
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", cancelPointer);
      window.removeEventListener("blur", cancel);
      if (["default", "grabbing"].includes(document.body.style.cursor)) {
        document.body.style.removeProperty("cursor");
      }
    };
  }, []);

  const draw: Draggable<Stage> = ({ state, d }) => {
    const { at } = stations[state.station]!;

    return (
      <g>
        <g
          id="workbench-robot"
          transform={translate(at)}
          dragologyOnDrag={() =>
            d
              .between(
                [state.station - 1, state.station, state.station + 1]
                  .filter((station) => station >= 0 && station < stations.length)
                  .map((station) => ({ station })),
              )
              .withDropTransition(reducedMotion ? false : 120)
          }
        >
          <use href={`#${id}-outline`} />
          <g transform={translate(-origin[0], -origin[1])}>
            <use href={`#${id}-body`} />
            <use href={`#${id}-eyes`} opacity={state.station >= 1 ? 1 : 0} />
            <use href={`#${id}-gear`} opacity={state.station >= 2 ? 1 : 0} />
            <use href={`#${id}-antenna`} opacity={state.station >= 3 ? 1 : 0} />
          </g>
          <rect
            x={-64}
            y={-64}
            width={128}
            height={128}
            fill="transparent"
            className="pointer-events-auto cursor-grab"
          />
        </g>
      </g>
    );
  };

  function selectStation(next: number) {
    if (next === stage.station) return;
    if (pointer.current !== null) {
      pointer.current = null;
      setDragSession((session) => session + 1);
    }
    setStage({ station: next });
  }

  return (
    <figure className="mt-4 flex flex-col gap-2">
      <div className="relative -mx-gutter aspect-bench overflow-hidden -outline-offset-2 has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-ring">
        <div className="sr-only">
          <Input
            type="range"
            min={0}
            max={stations.length - 1}
            value={stage.station}
            aria-label="Robot assembly stage"
            aria-describedby={instructionsId}
            aria-valuetext={station.label}
            onChange={(event) => selectStation(event.currentTarget.valueAsNumber)}
          />
        </div>
        {children}
        <svg
          aria-hidden="true"
          focusable="false"
          viewBox={`0 0 ${width} ${height}`}
          className="pointer-events-none absolute inset-0 size-full"
          onPointerDownCapture={(event) => {
            if (
              !event.isPrimary ||
              event.button !== 0 ||
              pointer.current !== null
            ) {
              event.stopPropagation();
              return;
            }
            pointer.current = event.pointerId;
          }}
        >
          <defs>
            <path
              id={`${id}-outline`}
              d="M-37 -23v-11h12 M25 -34h12v11 M37 19v11h-12 M-25 30h-12V19"
              fill="none"
              className="stroke-(--brand-text)"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {Object.entries(robot).map(([part, markup]) => (
              <g
                key={part}
                id={`${id}-${part}`}
                dangerouslySetInnerHTML={{ __html: markup }}
              />
            ))}
          </defs>
          <DraggableRenderer
            key={`${dragSession}:${reducedMotion ? stage.station : "animated"}`}
            draggable={draw}
            state={stage}
            onDropState={setStage}
            onDragStatus={({ type }) => {
              if (type !== "idle") return;
              queueMicrotask(() => {
                if (document.body.style.cursor === "default") {
                  document.body.style.removeProperty("cursor");
                }
              });
            }}
            width={width}
            height={height}
          />
          {stations.map(({ label, at: [x, y] }, index) => (
            <g key={label} transform={translate(x, y + 43)}>
              <circle
                r={stage.station === index ? 6 : 5}
                className="fill-background stroke-(--brand-text)"
                opacity={stage.station === index ? 1 : 0.6}
                strokeWidth={2.5}
              />
              {stage.station !== index && (
                <circle
                  r={38}
                  className="pointer-events-auto cursor-pointer fill-transparent"
                  onClick={() => selectStation(index)}
                />
              )}
            </g>
          ))}
        </svg>
      </div>
      <figcaption className="flex flex-col gap-1 px-1">
        <TypographySmall id={instructionsId}>
          Drag the robot one station at a time, or select a dot.
        </TypographySmall>
        <TypographyMuted role="status">{station.status}</TypographyMuted>
      </figcaption>
    </figure>
  );
}

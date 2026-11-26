"use client";

import IconBase from "@phosphor-icons/react/dist/lib/IconBase";
import type { IconProps, IconWeight } from "@phosphor-icons/react";
import { createElement, Fragment, useId, type ReactElement, type RefAttributes } from "react";

export type IconNode = [tag: string, props: Record<string, string>];
export type IconShapes = Partial<Record<IconWeight, IconNode[]>>;
export type GlassShapes = { body: IconNode[]; rim: IconNode[] };
export type ShapeIconProps = IconProps & RefAttributes<SVGSVGElement>;

const cache = new WeakMap<IconShapes, Map<IconWeight, ReactElement>>();

function weightsOf(shapes: IconShapes): Map<IconWeight, ReactElement> {
  const cached = cache.get(shapes);
  if (cached) return cached;

  const weights = new Map<IconWeight, ReactElement>();
  for (const [weight, nodes] of Object.entries(shapes) as [IconWeight, IconNode[]][]) {
    weights.set(
      weight,
      createElement(
        Fragment,
        null,
        nodes.map(([tag, props], index) => createElement(tag, { key: index, ...props })),
      ),
    );
  }
  cache.set(shapes, weights);
  return weights;
}

export function ShapeIcon({ shapes, ...props }: ShapeIconProps & { shapes: IconShapes }) {
  return createElement(IconBase, { ...props, weights: weightsOf(shapes) });
}

function nodes(list: IconNode[], prefix: string) {
  return list.map(([tag, props], index) => createElement(tag, { key: `${prefix}${index}`, ...props }));
}

function stops(from: string, to: string) {
  return [
    createElement("stop", { key: "a", offset: 0, style: { stopColor: `var(${from})` } }),
    createElement("stop", { key: "b", offset: 1, style: { stopColor: `var(${to})` } }),
  ];
}

export function GlassIcon({
  shapes,
  size = "1em",
  weight,
  mirrored,
  alt,
  color: _color,
  children,
  ...props
}: ShapeIconProps & { shapes: GlassShapes }) {
  const id = useId();
  const tint = `${id}t`;
  const rim = `${id}r`;
  const solid = weight === "fill";

  return createElement(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 256 256",
      width: size,
      height: size,
      fill: "none",
      "data-slot": "glass-icon",
      transform: mirrored ? "scale(-1, 1)" : undefined,
      ...props,
    },
    alt ? createElement("title", { key: "title" }, alt) : null,
    createElement(
      "defs",
      { key: "defs" },
      createElement(
        "linearGradient",
        { id: tint, x1: 0, y1: 0, x2: 0, y2: 256, gradientUnits: "userSpaceOnUse" },
        ...stops("--glass-tint-from", "--glass-tint-to"),
      ),
      createElement(
        "linearGradient",
        { id: rim, x1: 0, y1: 0, x2: 256, y2: 256, gradientUnits: "userSpaceOnUse" },
        ...stops("--glass-rim-from", "--glass-rim-to"),
      ),
    ),
    solid
      ? createElement("g", { key: "solid", fill: `url(#${rim})` }, ...nodes(shapes.body, "s"))
      : createElement(
          Fragment,
          { key: "glass" },
          createElement(
            "g",
            { key: "body", fill: `url(#${tint})`, style: { filter: "var(--glass-shadow)" } },
            ...nodes(shapes.body, "b"),
          ),
          createElement("g", { key: "rim", fill: `url(#${rim})` }, ...nodes(shapes.rim, "r")),
        ),
    children,
  );
}

"use client";

import IconBase from "@phosphor-icons/react/dist/lib/IconBase";
import type { IconProps, IconWeight } from "@phosphor-icons/react";
import { createElement, Fragment, type ReactElement, type RefAttributes } from "react";

export type IconNode = [tag: string, props: Record<string, string>];
export type IconShapes = Partial<Record<IconWeight, IconNode[]>>;
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

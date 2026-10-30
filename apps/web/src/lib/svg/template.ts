import type { ReactNode } from "react";
import type { z } from "zod";

export type Theme = "light" | "dark";

export type Query = Record<string, string>;

interface Fixture<Data> {
  label: string;
  query: Query;
  data: Data;
}

export interface SvgTemplate<Params, Data = undefined> {
  params: z.ZodType<Params>;
  size: (params: Params) => { width: number; height: number };
  load?: (params: Params) => Promise<Data>;
  revalidate?: number;
  fixtures: Fixture<Data>[];
  render: (props: { params: Params; data: Data; theme: Theme }) => ReactNode;
}

export type AnySvgTemplate = SvgTemplate<unknown, unknown>;

export function defineTemplate<Params, Data = undefined>(
  template: SvgTemplate<Params, Data>,
) {
  return template as unknown as AnySvgTemplate;
}

export const CARD_WIDTH = 840;

export const HOUR = 60 * 60;

/**
 * Thrown by a loader when the options were well-formed but name something that
 * doesn't exist (a city nobody has heard of). The route answers 400, not 500.
 */
export class SvgParamError extends Error {
  name = "SvgParamError";
}

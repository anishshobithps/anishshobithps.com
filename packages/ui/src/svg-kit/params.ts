import { z } from "zod";

export function limit(max: number, fallback: number) {
  return z.coerce.number().int().min(1).max(max).default(fallback);
}

export const cueNames = [
  "tap",
  "select",
  "toggleOn",
  "toggleOff",
  "open",
  "close",
  "pin",
  "flip",
  "read",
  "copy",
  "success",
  "error",
  "info",
  "post",
  "like",
  "unlike",
  "moodTerrible",
  "moodBad",
  "moodGood",
  "moodAmazing",
  "remove",
  "download",
  "top",
  "drop",
] as const;

export type CueName = (typeof cueNames)[number];

const cueSet: ReadonlySet<string> = new Set(cueNames);

export function isCueName(value: string | undefined): value is CueName {
  return value !== undefined && cueSet.has(value);
}

export function themeCue(theme: string): CueName {
  if (theme === "light") return "toggleOn";
  if (theme === "dark") return "toggleOff";
  return "select";
}

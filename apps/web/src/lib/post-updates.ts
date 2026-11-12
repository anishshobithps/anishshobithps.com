import { toTimestamp } from "@repo/core/date";

export type PostUpdateKind = "correction" | "addition" | "sources" | "edit";

export interface PostUpdate {
  date: Date;
  kind: PostUpdateKind;
  note: string;
}

interface WithUpdates {
  lastModified?: Date;
  updates?: readonly PostUpdate[];
}

export function getPostUpdates(data: WithUpdates): PostUpdate[] {
  return [...(data.updates ?? [])].sort(
    (a, b) => toTimestamp(b.date) - toTimestamp(a.date),
  );
}

export function getModifiedAt(data: WithUpdates): Date | undefined {
  if (data.lastModified) return data.lastModified;
  return getPostUpdates(data)[0]?.date;
}

import { cn } from "@repo/ui/lib/cn";

export function Divider({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("-mx-gutter h-px bg-line", className)}
    />
  );
}

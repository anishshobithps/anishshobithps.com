import { cn } from "@/lib/cn";

export function Divider({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("-mx-gutter h-px bg-line", className)}
    />
  );
}

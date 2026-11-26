"use client";

import { SidebarTrigger } from "@repo/ui/components/sidebar";
import { Separator } from "@repo/ui/components/separator";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Text } from "@repo/ui/components/typography";
import { usePathname } from "next/navigation";
import { adminNav } from "@/app/admin/sidebar";

function titleFor(pathname: string): string {
  for (const group of adminNav) {
    const item = group.items.find((entry) => entry.href === pathname);
    if (item) return item.title;
  }
  return "Admin";
}

export function AdminHeader() {
  const pathname = usePathname();
  const title = titleFor(pathname);

  return (
    <header className="sticky top-0 z-(--z-rail) flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-3 backdrop-blur md:px-4">
      <SidebarTrigger />
      <Separator orientation="vertical" className="mx-1 data-[orientation=vertical]:h-4" />
      <Text variant="title" as="span" className="min-w-0 truncate">
        {title}
      </Text>
      <div className="ml-auto">
        <ThemeToggle />
      </div>
    </header>
  );
}

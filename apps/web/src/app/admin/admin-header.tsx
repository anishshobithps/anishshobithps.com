"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { TypographySmall } from "@/components/ui/typography";
import { usePathname } from "next/navigation";

export function AdminHeader() {
  const pathname = usePathname()
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b px-4">
      <SidebarTrigger />
      <div className="flex items-center gap-2">
        <TypographySmall className="font-semibold capitalize">
          {pathname.split("/").pop()}
        </TypographySmall>
      </div>
      <div className="ml-auto">
        <ThemeToggle />
      </div>
    </header>
  );
}

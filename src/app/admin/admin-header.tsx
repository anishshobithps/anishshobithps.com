"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import {
  BookOpenIcon,
  ChatCircleIcon,
  GearIcon,
} from "@/components/shared/icons";
import { TypographySmall } from "@/components/ui/typography";
import { usePathname } from "next/navigation";

const routes = [
  { href: "/admin/guestbook", label: "Guestbook", icon: ChatCircleIcon },
  { href: "/admin/comments", label: "Blog Comments", icon: BookOpenIcon },
  { href: "/admin", label: "Overview", icon: GearIcon },
];

export function AdminHeader() {
  const pathname = usePathname();
  const route =
    routes.find((r) => pathname === r.href) ?? routes[routes.length - 1];
  const Icon = route.icon;

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b px-4">
      <SidebarTrigger />
      <div className="flex items-center gap-2">
        <Icon className="size-4 text-muted-foreground" weight="duotone" />
        <TypographySmall className="font-semibold">
          {route.label}
        </TypographySmall>
      </div>
      <div className="ml-auto">
        <ThemeToggle />
      </div>
    </header>
  );
}

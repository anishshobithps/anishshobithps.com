"use client";

import { useRouter } from "next/navigation";
import { ExpandableTabs } from "@/components/ui/animated-tabs";
import { Home, Settings, User } from "lucide-react";

export function Header() {
  const router = useRouter();

  const tabs = [
    { title: "Home", icon: Home },
    { title: "Profile", icon: User },
    { type: "separator" },
    { title: "Settings", icon: Settings },
  ] as const;

  const handleChange = (index: number | null) => {
    if (index === null) return;
    const path = ["/", "/me", "", "/settings"][index];
    if (path) router.push(path);
  };

  return (
    <header className="border-b border-edge px-4 py-2">
      <div className="max-w-6xl mx-auto">
        <ExpandableTabs tabs={tabs} onChange={handleChange} />
      </div>
    </header>
  );
}

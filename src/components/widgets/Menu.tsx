import { Sheet, SheetContent, SheetTrigger } from "@components/ui/sheet";

import { Menu as MenuIcon } from "lucide-react";

export function Menu({ children }: { children: React.ReactNode }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <MenuIcon aria-hidden="true"/>
      </SheetTrigger>
      <SheetContent>
        <div className="grid gap-4 py-4">{children}</div>
      </SheetContent>
    </Sheet>
  );
}

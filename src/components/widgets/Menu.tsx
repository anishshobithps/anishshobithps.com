import { Sheet, SheetContent, SheetTrigger } from "@components/ui/sheet";
import { Button } from "@components/ui/button";
import { Menu as MenuIcon } from "lucide-react";

export function Menu({ children }: { children: React.ReactNode }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Open menu">
          <MenuIcon aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <div className="grid gap-4 py-4">{children}</div>
      </SheetContent>
    </Sheet>
  );
}

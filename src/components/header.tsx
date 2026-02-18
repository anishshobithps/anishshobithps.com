import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Link from "next/link";
import { Logo } from "./logo";
import { TypographySmall } from "@/components/ui/typography";

const navigationLinks = [
  { href: "#", label: "Products" },
  { href: "#", label: "Categories" },
  { href: "#", label: "Deals" },
];

const HamburgerIcon = () => (
  <svg
    className="pointer-events-none"
    width={16}
    height={16}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4 12L20 12"
      className="origin-center -translate-y-1.75 transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-315"
    />
    <path
      d="M4 12H20"
      className="origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.8)] group-aria-expanded:rotate-45"
    />
    <path
      d="M4 12H20"
      className="origin-center translate-y-1.75 transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-135"
    />
  </svg>
);

export default function Navbar() {
  return (
    <header className="bg-background/80 sticky top-0 z-50 w-full backdrop-blur">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-6 sm:px-8 lg:px-10">
        <Link href="/" aria-label="Home">
          <Logo size={32} />
        </Link>

        <div className="flex items-center gap-1">
          <NavigationMenu className="max-md:hidden">
            <NavigationMenuList className="gap-0.5">
              {navigationLinks.map((link, index) => (
                <NavigationMenuItem key={index}>
                  <NavigationMenuLink
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-md px-3 py-1.5 transition-colors"
                  >
                    <TypographySmall>{link.label}</TypographySmall>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          <div className="md:hidden">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  className="group size-8"
                  variant="ghost"
                  size="icon"
                  aria-label="Toggle menu"
                >
                  <HamburgerIcon />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                sideOffset={8}
                className="bg-background/70 w-[100vw] rounded-lg border-x-0 p-0 shadow-md backdrop-blur-md"
              >
                <nav className="flex flex-col divide-y">
                  {navigationLinks.map((link, index) => (
                    <Link
                      key={index}
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground hover:bg-accent px-6 py-3.5 transition-colors"
                    >
                      <TypographySmall>{link.label}</TypographySmall>
                    </Link>
                  ))}
                </nav>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </header>
  );
}

import { cn } from "@/lib/cn";
import { DecorIcon, FullWidthDivider } from "@/components/ui/border";
import { Divider } from "@/components/ui/divider";
import { ComponentPropsWithRef, forwardRef } from "react";

export const PageLayout = forwardRef<
  HTMLDivElement,
  ComponentPropsWithRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative min-h-screen w-full overflow-x-clip bg-background text-foreground",
      className,
    )}
    {...props}
  />
));
PageLayout.displayName = "PageLayout";

export const Content = forwardRef<HTMLElement, ComponentPropsWithRef<"main">>(
  ({ className, ...props }, ref) => (
    <main
      ref={ref}
      className={cn(
        "relative mx-auto w-full max-w-5xl",
        "before:pointer-events-none before:absolute before:inset-y-0 before:left-0 before:w-px before:bg-border",
        "after:pointer-events-none after:absolute after:inset-y-0 after:right-0 after:w-px after:bg-border",
        className,
      )}
      {...props}
    />
  ),
);

Content.displayName = "Content";

interface SectionProps extends ComponentPropsWithRef<"section"> {
  variant?: "default" | "hero";
}

export const Section = forwardRef<HTMLElement, SectionProps>(
  ({ variant = "default", children, ...props }, ref) => {
    return (
      <section
        ref={ref}
        className={cn(
          "relative flex flex-col gap-10 px-6 sm:px-8 lg:px-10",
          variant === "default" && "pb-20",
          variant === "hero" && "pb-12",
        )}
        {...props}
      >
        <DecorIcon position="top-left" />
        <DecorIcon position="top-right" />
        <DecorIcon position="bottom-left" />
        <DecorIcon position="bottom-right" />
        <FullWidthDivider position="bottom" />
        <Divider short borderTop={false} />
        {children}
      </section>
    );
  },
);

Section.displayName = "Section";

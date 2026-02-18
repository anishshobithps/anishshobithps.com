import { cn } from "@/lib/cn";
import { ComponentPropsWithRef, forwardRef } from "react";

export const PageLayout = forwardRef<
  HTMLDivElement,
  ComponentPropsWithRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative min-h-screen w-full bg-background text-foreground",
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
        "relative mx-auto w-full max-w-4xl px-6 py-16 sm:px-8 lg:px-10",
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
          "relative flex flex-col gap-10",
          variant === "default" && "py-20",
          variant === "hero" && "pt-6 pb-12 border-b",
        )}
        {...props}
      >
        {children}
      </section>
    );
  },
);

Section.displayName = "Section";

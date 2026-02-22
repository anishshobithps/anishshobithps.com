import { cn } from "@/lib/cn";
import { DecorIcon, FullWidthDivider } from "@/components/ui/border";
import { Divider } from "@/components/ui/divider";
import { ComponentPropsWithRef, forwardRef } from "react";

export const PageLayout = forwardRef<
  HTMLDivElement,
  ComponentPropsWithRef<"div">
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative z-10 min-h-screen w-full overflow-x-clip",
      className,
    )}
    {...props}
  >
    <div
      className={cn(
        "absolute inset-0 pointer-events-none isolate",

        // Grid
        "bg-[linear-gradient(to_right,var(--grid-line)_0.5px,transparent_1px),linear-gradient(to_bottom,var(--grid-line)_0.5px,transparent_1px)]",
        "bg-size-[80px_80px]",

        // Mask OUT center (match max-w-5xl ≈ 64rem)
        "mask-[linear-gradient(to_right,black_0%,black_calc(50%-32rem),transparent_calc(50%-32rem),transparent_calc(50%+32rem),black_calc(50%+32rem),black_100%)]",

        "mask-composite:intersect",
        "[-webkit-mask-composite:source-in]",
      )}
    />
    {children}
  </div>
));

export const Content = forwardRef<HTMLElement, ComponentPropsWithRef<"main">>(
  ({ className, ...props }, ref) => (
    <main
      ref={ref}
      className={cn(
        "relative mx-auto w-full max-w-5xl",
        "before:pointer-events-none before:absolute before:inset-y-0 before:left-0 before:w-px before:bg-border before:z-20",
        "after:pointer-events-none after:absolute after:inset-y-0 after:right-0 after:w-px after:bg-border after:z-20",
        className,
      )}
      {...props}
    />
  ),
);

Content.displayName = "Content";

interface SectionProps extends ComponentPropsWithRef<"section"> {
  variant?: "default" | "hero" | "nav";
  noTopDivider?: boolean;
  innerPadding?: string;
}

export const Section = forwardRef<HTMLElement, SectionProps>(
  (
    {
      variant = "default",
      noTopDivider = false,
      children,
      className,
      innerPadding,
      ...props
    },
    ref,
  ) => {
    return (
      <section
        ref={ref}
        className={cn(
          "relative flex px-6 sm:px-8 lg:px-10",
          variant === "default" && !noTopDivider && "flex-col pb-12",
          variant === "default" && noTopDivider && "flex-col pb-8 xl:pb-12",
          variant === "hero" && "flex-col pb-14",
          variant === "nav" && "flex-col",
          className,
        )}
        {...props}
      >
        <DecorIcon position="top-left" />
        <DecorIcon position="top-right" />
        <DecorIcon position="bottom-left" />
        <DecorIcon position="bottom-right" />
        {variant === "nav" && <FullWidthDivider position="top" />}
        {variant === "nav" ? (
          <>
            <Divider short borderTop={false} />
            <div className="flex flex-row items-center justify-between py-4 w-full">
              {children}
            </div>
            <FullWidthDivider position="bottom" />
          </>
        ) : (
          <>
            <FullWidthDivider position="bottom" />
            {!noTopDivider && <Divider short borderTop={false} />}
            <div
              className={cn(
                innerPadding ||
                  (noTopDivider
                    ? "pt-8 xl:pt-12"
                    : variant === "hero"
                      ? "pt-14"
                      : "pt-12"),
                variant === "hero" && "flex flex-col gap-5 sm:gap-6",
                variant === "default" && "flex flex-col gap-10",
              )}
            >
              {children}
            </div>
          </>
        )}
      </section>
    );
  },
);

Section.displayName = "Section";

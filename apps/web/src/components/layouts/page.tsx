import { SectionMargins } from "@/components/layouts/section-margins";
import { cn } from "@/lib/cn";
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
    {children}
  </div>
));
PageLayout.displayName = "PageLayout";

export const Content = forwardRef<HTMLElement, ComponentPropsWithRef<"main">>(
  ({ className, ...props }, ref) => (
    <main
      ref={ref}
      data-slot="content"
      className={cn(
        "relative mx-auto w-full max-w-5xl",
        "before:pointer-events-none before:absolute before:inset-y-0 before:left-0 before:z-20 before:w-px before:bg-line",
        "after:pointer-events-none after:absolute after:inset-y-0 after:right-0 after:z-20 after:w-px after:bg-line",
        className,
      )}
      {...props}
    />
  ),
);
Content.displayName = "Content";

const sectionVariants = {
  default: { frame: "pb-12", body: "flex flex-col gap-10 pt-12" },
  hero: { frame: "pb-14", body: "flex flex-col gap-5 pt-14 sm:gap-6" },
  compact: { frame: "pb-6", body: "flex flex-col gap-6 pt-6" },
  article: {
    frame: "pb-8 xl:pb-12",
    body: "flex flex-col gap-10 pt-8 xl:pt-12",
  },
  nav: {
    frame: "",
    body: "flex w-full flex-row items-center justify-between py-4",
  },
  flush: { frame: "", body: "flex flex-col" },
} as const;

interface SectionProps extends ComponentPropsWithRef<"section"> {
  variant?: keyof typeof sectionVariants;
}

export const Section = forwardRef<HTMLElement, SectionProps>(
  ({ variant = "default", children, className, ...props }, ref) => (
    <section
      ref={ref}
      data-slot="section"
      className="section-gap group/section relative border border-line bg-line"
      {...props}
    >
      <SectionMargins label={props["aria-label"]} />
      <div
        className={cn(
          "relative flex flex-col bg-background px-gutter group-last-of-type/section:overflow-hidden group-last-of-type/section:rounded-b-2xl",
          sectionVariants[variant].frame,
          className,
        )}
      >
        <div className={sectionVariants[variant].body}>{children}</div>
      </div>
    </section>
  ),
);
Section.displayName = "Section";

export function Card({
  className,
  children,
  ...props
}: ComponentPropsWithRef<"div">) {
  return (
    <div
      className={cn(
        "@container relative rounded-xl border p-6 @lg:p-8",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

const edgeToEdge =
  "-mx-gutter border-y border-line bg-line first:-mt-px last:-mb-px";

interface CardGridProps extends ComponentPropsWithRef<"ul"> {
  columns?: 2 | 3;
}

export function CardGrid({
  className,
  children,
  columns = 2,
  ...props
}: CardGridProps) {
  return (
    <div data-slot="card-grid" className={edgeToEdge}>
      <ul
        role="list"
        data-columns={columns}
        className={cn(
          "grid grid-cols-1 gap-px [&>li]:bg-background",
          columns === 3 ? "md:grid-cols-3" : "md:grid-cols-2",
          className,
        )}
        {...props}
      >
        {children}
      </ul>
    </div>
  );
}

export function CardGridItem({
  className,
  children,
  ...props
}: ComponentPropsWithRef<"li">) {
  return (
    <li
      className={cn("@container relative p-4 @sm:p-6 @lg:p-8", className)}
      {...props}
    >
      {children}
    </li>
  );
}

export function Panel({ className, ...props }: ComponentPropsWithRef<"div">) {
  return (
    <div
      data-slot="panel"
      className={cn(edgeToEdge, "flex flex-col gap-px", className)}
      {...props}
    />
  );
}

const panelRow =
  "rounded-panel bg-background px-gutter first:rounded-t-none last:rounded-b-none";

export function PanelRow({
  className,
  ...props
}: ComponentPropsWithRef<"div">) {
  return <div className={cn(panelRow, className)} {...props} />;
}

export const panelListItem =
  "border-b border-line bg-background last:border-b-0";

import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type HeadingProps = HTMLAttributes<HTMLHeadingElement>;
type TextProps = HTMLAttributes<HTMLParagraphElement>;

export function TypographyH1({ className, ...props }: HeadingProps) {
  return (
    <h1
      className={cn(
        "scroll-m-20 text-[clamp(1.75rem,4vw+1rem,3rem)] font-extrabold tracking-tight text-balance leading-tight",
        className,
      )}
      {...props}
    />
  );
}

export function TypographyH2({ className, ...props }: HeadingProps) {
  return (
    <h2
      className={cn(
        "scroll-m-20 border-b pb-2 text-[clamp(1.375rem,2.5vw+0.75rem,2.25rem)] font-semibold tracking-tight first:mt-0",
        className,
      )}
      {...props}
    />
  );
}

export function TypographyH3({ className, ...props }: HeadingProps) {
  return (
    <h3
      className={cn(
        "scroll-m-20 text-[clamp(1.125rem,1.5vw+0.75rem,1.75rem)] font-semibold tracking-tight",
        className,
      )}
      {...props}
    />
  );
}

export function TypographyH4({ className, ...props }: HeadingProps) {
  return (
    <h4
      className={cn(
        "scroll-m-20 text-[clamp(1rem,1vw+0.75rem,1.375rem)] font-semibold tracking-tight",
        className,
      )}
      {...props}
    />
  );
}

export function TypographyP({ className, ...props }: TextProps) {
  return (
    <p
      className={cn("leading-7 text-pretty not-first:mt-6", className)}
      {...props}
    />
  );
}

export function TypographyLead({ className, ...props }: TextProps) {
  return (
    <p
      className={cn(
        "text-[clamp(1rem,1vw+0.75rem,1.25rem)] text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function TypographyBlockquote({
  className,
  ...props
}: HTMLAttributes<HTMLQuoteElement>) {
  return (
    <blockquote
      className={cn("mt-6 border-l-2 pl-6 italic", className)}
      {...props}
    />
  );
}

export function TypographyList({
  className,
  ...props
}: HTMLAttributes<HTMLUListElement>) {
  return (
    <ul
      className={cn("my-6 ml-6 list-disc [&>li]:mt-2", className)}
      {...props}
    />
  );
}

export function TypographyInlineCode({
  className,
  ...props
}: HTMLAttributes<HTMLElement>) {
  return (
    <code
      className={cn(
        "bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
        className,
      )}
      {...props}
    />
  );
}

export function TypographyLarge({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("text-lg font-semibold", className)} {...props} />;
}

export function TypographySmall({
  className,
  ...props
}: HTMLAttributes<HTMLElement>) {
  return (
    <small
      className={cn("text-sm font-medium leading-none", className)}
      {...props}
    />
  );
}

export function TypographyMuted({ className, ...props }: TextProps) {
  return (
    <p className={cn("text-muted-foreground text-sm", className)} {...props} />
  );
}

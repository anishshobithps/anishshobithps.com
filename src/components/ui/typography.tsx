import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import { type ElementType, type HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/cn";

type AsChildProps = { asChild?: boolean };

const headingVariants = cva(
  "scroll-m-20 tracking-tight text-balance leading-[1.1]",
  {
    variants: {
      level: {
        h1: "text-[clamp(2rem,5cqi+1rem,3.5rem)] font-extrabold",
        h2: "text-[clamp(1.5rem,3cqi+0.75rem,2.25rem)] font-bold border-b border-border pb-2 first:mt-0",
        h3: "text-[clamp(1.25rem,2cqi+0.75rem,1.875rem)] font-semibold",
        h4: "text-[clamp(1.125rem,1cqi+0.875rem,1.5rem)] font-semibold",
      },
    },
    defaultVariants: { level: "h1" },
  },
);

type HeadingProps = HTMLAttributes<HTMLHeadingElement> &
  VariantProps<typeof headingVariants> &
  AsChildProps & {
    as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  };

export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, level = "h1", as, asChild = false, ...props }, ref) => {
    const Tag = asChild ? Slot : (as ?? level ?? "h1");
    return (
      <Tag
        ref={ref}
        role="heading"
        aria-level={Number(
          as?.replace("h", "") ?? level?.replace("h", "") ?? 1,
        )}
        className={cn(headingVariants({ level }), className)}
        {...props}
      />
    );
  },
);
Heading.displayName = "Heading";

export const TypographyH1 = forwardRef<
  HTMLHeadingElement,
  Omit<HeadingProps, "level">
>((props, ref) => <Heading ref={ref} level="h1" as="h1" {...props} />);
TypographyH1.displayName = "TypographyH1";

export const TypographyH2 = forwardRef<
  HTMLHeadingElement,
  Omit<HeadingProps, "level">
>((props, ref) => <Heading ref={ref} level="h2" as="h2" {...props} />);
TypographyH2.displayName = "TypographyH2";

export const TypographyH3 = forwardRef<
  HTMLHeadingElement,
  Omit<HeadingProps, "level">
>((props, ref) => <Heading ref={ref} level="h3" as="h3" {...props} />);
TypographyH3.displayName = "TypographyH3";

export const TypographyH4 = forwardRef<
  HTMLHeadingElement,
  Omit<HeadingProps, "level">
>((props, ref) => <Heading ref={ref} level="h4" as="h4" {...props} />);
TypographyH4.displayName = "TypographyH4";

const textVariants = cva("text-pretty", {
  variants: {
    variant: {
      default: "text-base leading-7 not-first:mt-6",
      lead: "text-[clamp(1.0625rem,1.5cqi+0.75rem,1.25rem)] leading-relaxed text-muted-foreground",
      muted: "text-sm leading-normal text-muted-foreground",
      large: "text-lg leading-7 font-semibold",
      small: "text-sm leading-none font-medium",
    },
  },
  defaultVariants: { variant: "default" },
});

type TextProps = HTMLAttributes<HTMLElement> &
  VariantProps<typeof textVariants> &
  AsChildProps & {
    as?: ElementType;
  };

const TEXT_DEFAULT_TAGS: Record<string, ElementType> = {
  large: "div",
  small: "small",
};

export const Text = forwardRef<HTMLElement, TextProps>(
  ({ className, variant, as, asChild = false, ...props }, ref) => {
    const Tag = asChild
      ? Slot
      : (as ?? TEXT_DEFAULT_TAGS[variant ?? ""] ?? "p");
    return (
      <Tag
        ref={ref}
        className={cn(textVariants({ variant }), className)}
        {...props}
      />
    );
  },
);
Text.displayName = "Text";

export const TypographyP = forwardRef<
  HTMLParagraphElement,
  Omit<TextProps, "variant">
>((props, ref) => <Text ref={ref} variant="default" {...props} />);
TypographyP.displayName = "TypographyP";

export const TypographyLead = forwardRef<
  HTMLParagraphElement,
  Omit<TextProps, "variant">
>((props, ref) => <Text ref={ref} variant="lead" {...props} />);
TypographyLead.displayName = "TypographyLead";

export const TypographyMuted = forwardRef<
  HTMLParagraphElement,
  Omit<TextProps, "variant">
>((props, ref) => <Text ref={ref} variant="muted" {...props} />);
TypographyMuted.displayName = "TypographyMuted";

export const TypographyLarge = forwardRef<
  HTMLDivElement,
  Omit<TextProps, "variant">
>((props, ref) => <Text ref={ref} variant="large" {...props} />);
TypographyLarge.displayName = "TypographyLarge";

export const TypographySmall = forwardRef<
  HTMLElement,
  Omit<TextProps, "variant">
>((props, ref) => <Text ref={ref} variant="small" {...props} />);
TypographySmall.displayName = "TypographySmall";

type BlockquoteProps = HTMLAttributes<HTMLQuoteElement> & AsChildProps;

export const TypographyBlockquote = forwardRef<
  HTMLQuoteElement,
  BlockquoteProps
>(({ className, asChild = false, ...props }, ref) => {
  const Tag = asChild ? Slot : "blockquote";
  return (
    <Tag
      ref={ref}
      role="blockquote"
      className={cn(
        "mt-6 border-l-2 border-border pl-6 italic text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
});
TypographyBlockquote.displayName = "TypographyBlockquote";

type ListProps = HTMLAttributes<HTMLUListElement> & AsChildProps;

export const TypographyList = forwardRef<HTMLUListElement, ListProps>(
  ({ className, asChild = false, ...props }, ref) => {
    const Tag = asChild ? Slot : "ul";
    return (
      <Tag
        ref={ref}
        role="list"
        className={cn(
          "my-6 ml-6 list-disc marker:text-muted-foreground [&>li]:mt-2 [&>li]:leading-7",
          className,
        )}
        {...props}
      />
    );
  },
);
TypographyList.displayName = "TypographyList";

type InlineCodeProps = HTMLAttributes<HTMLElement> & AsChildProps;

export const TypographyInlineCode = forwardRef<HTMLElement, InlineCodeProps>(
  ({ className, asChild = false, ...props }, ref) => {
    const Tag = asChild ? Slot : "code";
    return (
      <Tag
        ref={ref}
        role="code"
        aria-label={
          typeof props.children === "string" ? props.children : undefined
        }
        className={cn(
          "relative rounded bg-muted px-[0.3em] py-[0.15em] font-mono text-[0.875em] font-semibold text-foreground",
          className,
        )}
        {...props}
      />
    );
  },
);
TypographyInlineCode.displayName = "TypographyInlineCode";

type MarkProps = HTMLAttributes<HTMLElement> & AsChildProps;

export const TypographyMark = forwardRef<HTMLElement, MarkProps>(
  ({ className, asChild = false, ...props }, ref) => {
    const Tag = asChild ? Slot : "mark";
    return (
      <Tag
        ref={ref}
        aria-label={
          typeof props.children === "string"
            ? `highlighted: ${props.children}`
            : undefined
        }
        className={cn(
          "bg-(--selection-bg) text-(--selection-fg) rounded-sm px-[0.25em] not-italic",
          className,
        )}
        {...props}
      />
    );
  },
);
TypographyMark.displayName = "TypographyMark";

type SectionLabelProps = HTMLAttributes<HTMLParagraphElement> & AsChildProps;

export const SectionLabel = forwardRef<HTMLParagraphElement, SectionLabelProps>(
  ({ className, asChild = false, ...props }, ref) => {
    const Tag = asChild ? Slot : "p";
    return (
      <Tag
        ref={ref}
        aria-hidden="true"
        className={cn(
          "text-sm font-mono font-medium tracking-widest text-muted-foreground/80 uppercase",
          className,
        )}
        {...props}
      />
    );
  },
);
SectionLabel.displayName = "SectionLabel";

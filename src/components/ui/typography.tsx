import React, { forwardRef, JSX } from "react";
import { cn } from "@/lib/cn";

const createComponent = <T extends HTMLElement>(
  tag: keyof JSX.IntrinsicElements,
  defaultClassName: string,
  displayName: string
) => {
  const Component = forwardRef<T, React.HTMLAttributes<T>>(
    ({ className, ...props }, ref) => {
      return React.createElement(tag, {
        ref,
        className: cn(defaultClassName, className),
        ...props,
      });
    }
  );

  Component.displayName = displayName;
  return Component;
};

// Headings
export const H1 = createComponent<HTMLHeadingElement>(
  "h1",
  "text-balance font-semibold tracking-tight text-3xl cq-sm:text-4xl cq-md:text-5xl mb-4 mt-0",
  "H1"
);

export const H2 = createComponent<HTMLHeadingElement>(
  "h2",
  "text-balance font-semibold tracking-tight text-2xl cq-sm:text-3xl cq-md:text-4xl mt-6 first:mt-0 mb-4",
  "H2"
);

export const H3 = createComponent<HTMLHeadingElement>(
  "h3",
  "font-semibold tracking-tight text-xl cq-sm:text-2xl cq-md:text-3xl mt-4 first:mt-0 mb-3",
  "H3"
);

export const H4 = createComponent<HTMLHeadingElement>(
  "h4",
  "font-semibold tracking-tight text-base cq-sm:text-lg cq-md:text-xl mt-3 first:mt-0 mb-2",
  "H4"
);

export const H5 = createComponent<HTMLHeadingElement>(
  "h5",
  "text-sm cq-sm:text-base cq-md:text-lg font-medium leading-normal mt-3 mb-2",
  "H5"
);

export const H6 = createComponent<HTMLHeadingElement>(
  "h6",
  "uppercase font-medium text-xs cq-sm:text-sm cq-md:text-base tracking-wide mt-3 mb-2 first:mt-0",
  "H6"
);

// Paragraphs
export const P = createComponent<HTMLParagraphElement>(
  "p",
  "text-pretty max-w-prose text-sm cq-sm:text-base leading-relaxed mb-3 cq-sm:mb-4 cq-lg:mb-5",
  "P"
);

export const Lead = createComponent<HTMLParagraphElement>(
  "p",
  "text-muted-foreground font-normal text-base cq-sm:text-lg cq-md:text-xl leading-normal max-w-2xl mb-4 cq-sm:mb-5 cq-md:mb-6 cq-lg:mb-8",
  "Lead"
);

export const Large = createComponent<HTMLDivElement>(
  "div",
  "text-base cq-sm:text-lg leading-normal font-semibold",
  "Large"
);

export const Small = createComponent<HTMLParagraphElement>(
  "p",
  "text-xs cq-sm:text-sm text-muted-foreground font-medium leading-none",
  "Small"
);

export const Muted = createComponent<HTMLSpanElement>(
  "span",
  "text-xs cq-sm:text-sm text-muted-foreground leading-normal",
  "Muted"
);

// Code
export const InlineCode = createComponent<HTMLSpanElement>(
  "code",
  "font-mono font-medium text-xs cq-sm:text-sm bg-muted px-1.5 py-0.5 rounded-md",
  "InlineCode"
);

export const MultilineCode = createComponent<HTMLPreElement>(
  "pre",
  "font-mono text-xs cq-sm:text-sm bg-muted p-3 cq-sm:p-4 cq-md:p-6 rounded-lg overflow-x-auto border",
  "MultilineCode"
);

// Block
export const Quote = createComponent<HTMLQuoteElement>(
  "blockquote",
  "border-l-4 border-border pl-4 italic text-muted-foreground my-4 cq-sm:pl-6 cq-sm:my-6",
  "Quote"
);

export const List = createComponent<HTMLUListElement>(
  "ul",
  "list-disc ml-4 cq-sm:ml-6 mb-3 cq-sm:mb-4 [&>li]:mb-1",
  "List"
);

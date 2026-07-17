import defaultMdxComponents from "fumadocs-ui/mdx";
import * as TabsComponents from "fumadocs-ui/components/tabs";
import type { MDXComponents } from "mdx/types";
import { TypographyMark, TypographyMuted } from "@/components/ui/typography";

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    ...TabsComponents,
    TypographyMark,
    TypographyMuted,
    ...components,
  };
}

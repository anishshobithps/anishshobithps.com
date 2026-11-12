import type { ComponentProps, ReactNode } from "react";
import { classifyLink } from "@repo/core/link-target";
import { siteConfig } from "@repo/site-config";
import { LinkCard } from "./link-card";
import { PreviewLink } from "./preview-link";

type AnchorComponent = (props: ComponentProps<"a">) => ReactNode | Promise<ReactNode>;

const SITE_ORIGINS = [siteConfig.baseUrl, `https://${siteConfig.domain}`] as const;
const IMAGE_URL = /\.(?:png|jpe?g|gif|webp|avif|svg)(?:[?#].*)?$/i;

export function createPreviewLink(Fallback: AnchorComponent) {
  return function MdxLink(props: ComponentProps<"a">) {
    const { href } = props;
    if (!href || !/^https:\/\//i.test(href) || IMAGE_URL.test(href)) {
      return <Fallback {...props} />;
    }

    const target = classifyLink(href, SITE_ORIGINS);
    if (!target || target.kind === "internal") return <Fallback {...props} />;

    return (
      <PreviewLink
        {...props}
        preview={<LinkCard url={href} variant="preview" />}
      />
    );
  };
}

import { Children, isValidElement, type ComponentProps, type ReactNode } from "react";
import { classifyLink } from "@repo/core/link-target";
import { siteConfig } from "@repo/site-config";
import { LinkCard } from "./link-card";
import { PreviewLink, PreviewSup } from "./preview-link";

type AnchorComponent = (props: ComponentProps<"a">) => ReactNode | Promise<ReactNode>;

const SITE_ORIGINS = [siteConfig.baseUrl, `https://${siteConfig.domain}`] as const;
const IMAGE_URL = /\.(?:png|jpe?g|gif|webp|avif|svg)(?:[?#].*)?$/i;

export function CitationSup(
  props: ComponentProps<"sup"> & { "data-cite-url"?: string; "data-cite-label"?: string },
) {
  const { "data-cite-url": url, "data-cite-label": label, ...rest } = props;
  if (!url) return <sup {...rest} />;
  return (
    <PreviewSup {...rest} preview={<LinkCard url={url} label={label} variant="preview" />} />
  );
}

function wrapsImage(children: ReactNode): boolean {
  return Children.toArray(children).some(
    (child) => isValidElement(child) && "src" in (child.props as object),
  );
}

export function createPreviewLink(Fallback: AnchorComponent) {
  return function MdxLink(props: ComponentProps<"a">) {
    const { href } = props;
    if (
      !href ||
      !/^https:\/\//i.test(href) ||
      IMAGE_URL.test(href) ||
      wrapsImage(props.children)
    ) {
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

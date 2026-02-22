import { siteConfig } from "@/lib/config";
import type {
  Person,
  WebSite,
  WebPage,
  BlogPosting,
  BreadcrumbList,
  WithContext,
} from "schema-dts";

type SchemaProps =
  | { type: "person" }
  | { type: "website" }
  | {
      type: "webpage";
      title: string;
      description: string;
      canonicalUrl: string;
    }
  | {
      type: "article";
      title: string;
      description: string;
      canonicalUrl: string;
      publishedAt?: string;
      updatedAt?: string;
      tags?: string[];
    }
  | { type: "breadcrumb"; items: { name: string; url: string }[] };

function buildPerson(): WithContext<Person> {
  const x = siteConfig.social.find((s) => s.platform === "x");
  const github = siteConfig.social.find((s) => s.platform === "github");
  const linkedin = siteConfig.social.find((s) => s.platform === "linkedin");

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: siteConfig.name,
    url: siteConfig.baseUrl,
    image: `${siteConfig.baseUrl}/profile.jpg`,
    jobTitle: siteConfig.role,
    description: siteConfig.description,
    sameAs: [x, github, linkedin].filter(Boolean).map((s) => s!.href),
  };
}

function buildWebSite(): WithContext<WebSite> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.baseUrl,
    description: siteConfig.description,
    author: {
      "@type": "Person",
      name: siteConfig.name,
      url: siteConfig.baseUrl,
    },
  };
}

function buildWebPage(
  title: string,
  description: string,
  canonicalUrl: string,
): WithContext<WebPage> {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url: canonicalUrl,
    isPartOf: { "@type": "WebSite", url: siteConfig.baseUrl },
    author: {
      "@type": "Person",
      name: siteConfig.name,
      url: siteConfig.baseUrl,
    },
  };
}

function buildBlogPosting(params: {
  title: string;
  description: string;
  canonicalUrl: string;
  publishedAt?: string;
  updatedAt?: string;
  tags?: string[];
}): WithContext<BlogPosting> {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: params.title,
    description: params.description,
    url: params.canonicalUrl,
    image: `${siteConfig.baseUrl}/profile.jpg`,
    ...(params.publishedAt && { datePublished: params.publishedAt }),
    ...(params.updatedAt && { dateModified: params.updatedAt }),
    ...(params.tags && { keywords: params.tags.join(", ") }),
    author: {
      "@type": "Person",
      name: siteConfig.name,
      url: siteConfig.baseUrl,
      image: `${siteConfig.baseUrl}/profile.jpg`,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.baseUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteConfig.baseUrl}/profile.jpg`,
        width: "460",
        height: "460",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": params.canonicalUrl,
    },
  };
}

function buildBreadcrumb(
  items: { name: string; url: string }[],
): WithContext<BreadcrumbList> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

function resolveSchema(props: SchemaProps): WithContext<any> {
  switch (props.type) {
    case "person":
      return buildPerson();
    case "website":
      return buildWebSite();
    case "webpage":
      return buildWebPage(props.title, props.description, props.canonicalUrl);
    case "article":
      return buildBlogPosting(props);
    case "breadcrumb":
      return buildBreadcrumb(props.items);
  }
}

export function JsonLd(props: SchemaProps) {
  const schema = resolveSchema(props);
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

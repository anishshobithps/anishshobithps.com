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

type ArticleProps = Extract<SchemaProps, { type: "article" }>;
type AnySchema = WithContext<
  Person | WebSite | WebPage | BlogPosting | BreadcrumbList
>;

const SCHEMA_CONTEXT = "https://schema.org" as const;
const profileImageUrl = `${siteConfig.baseUrl}/profile.avif`;
const schemaAuthor = {
  "@type": "Person" as const,
  name: siteConfig.name,
  url: siteConfig.baseUrl,
};
const schemaPublisher = {
  "@type": "Organization" as const,
  name: siteConfig.name,
  url: siteConfig.baseUrl,
  logo: {
    "@type": "ImageObject" as const,
    url: profileImageUrl,
    width: "460",
    height: "460",
  },
};

function buildPerson(): WithContext<Person> {
  return {
    "@context": SCHEMA_CONTEXT,
    ...schemaAuthor,
    alternateName: siteConfig.handle,
    image: profileImageUrl,
    jobTitle: siteConfig.role,
    description: siteConfig.description,
    sameAs: [...siteConfig.sameAs],
  };
}

function buildWebSite(): WithContext<WebSite> {
  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.baseUrl,
    description: siteConfig.description,
    author: schemaAuthor,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteConfig.baseUrl}/blogs?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    } as never,
  };
}

function buildWebPage(
  title: string,
  description: string,
  canonicalUrl: string,
): WithContext<WebPage> {
  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "WebPage",
    name: title,
    description,
    url: canonicalUrl,
    isPartOf: { "@type": "WebSite", url: siteConfig.baseUrl },
    author: schemaAuthor,
  };
}

function buildBlogPosting({
  title,
  description,
  canonicalUrl,
  publishedAt,
  updatedAt,
  tags,
}: ArticleProps): WithContext<BlogPosting> {
  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "BlogPosting",
    headline: title,
    description,
    url: canonicalUrl,
    image: profileImageUrl,
    ...(publishedAt && { datePublished: publishedAt }),
    ...(updatedAt && { dateModified: updatedAt }),
    ...(tags && { keywords: tags.join(", ") }),
    author: { ...schemaAuthor, image: profileImageUrl },
    publisher: schemaPublisher,
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
  };
}

function buildBreadcrumb(
  items: { name: string; url: string }[],
): WithContext<BreadcrumbList> {
  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

function resolveSchema(props: SchemaProps): AnySchema {
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
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(resolveSchema(props)) }}
    />
  );
}

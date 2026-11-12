import { LinkIcon } from "@repo/icons";
import { Text } from "@repo/ui/components/typography";
import { LinkCard } from "@/components/link-card/link-card";
import { Reveal } from "@/components/shared/reveal";

export interface PostLink {
  url: string;
  label?: string;
  note?: string;
  featured?: boolean;
}

export function PostSourceCard({ links }: { links: PostLink[] }) {
  const featured = links.find((link) => link.featured);
  if (!featured) return null;
  return (
    <LinkCard
      url={featured.url}
      label={featured.label}
      note={featured.note}
      className="mb-8"
    />
  );
}

export function PostLinksRail({ links }: { links: PostLink[] }) {
  if (links.length === 0) return null;
  return (
    <section aria-labelledby="post-links-rail-heading" className="min-h-0 shrink-0">
      <div className="mb-2 flex items-center gap-1.5">
        <LinkIcon aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground" />
        <Text as="h2" id="post-links-rail-heading" variant="caption">
          Links
        </Text>
      </div>
      <ul role="list" className="-mx-2.5 flex flex-col gap-0.5">
        {links.map((link) => (
          <li key={link.url} className="min-w-0">
            <LinkCard url={link.url} label={link.label} variant="row" />
          </li>
        ))}
      </ul>
    </section>
  );
}

export function PostLinksRecap({ links }: { links: PostLink[] }) {
  if (links.length === 0) return null;
  return (
    <Reveal className="mt-14">
      <section aria-labelledby="post-links-recap-heading" className="not-prose">
        <div className="mb-4 flex items-center gap-2">
          <LinkIcon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
          <Text as="h2" id="post-links-recap-heading" variant="title">
            Links from this post
          </Text>
        </div>
        <ul role="list" className="grid gap-3 sm:grid-cols-2">
          {links.map((link) => (
            <li key={link.url} className="min-w-0">
              <LinkCard
                url={link.url}
                label={link.label}
                note={link.note}
                variant="compact"
                className="h-full"
              />
            </li>
          ))}
        </ul>
      </section>
    </Reveal>
  );
}

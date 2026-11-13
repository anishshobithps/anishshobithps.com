import { getGuestbookPreviewPool, pickRandom } from "@/lib/guestbook-preview";
import { GuestbookPreview } from "@/app/(site)/_components/guestbook-preview";
import { Section } from "@/components/layouts/page";
import {
  TypographyH2,
  TypographyLead,
} from "@repo/ui/components/typography";
import { Reveal } from "@/components/shared/reveal";
import { ArtStage } from "@/components/layouts/hero-art";
import { PageArt } from "@repo/diagrams/page-art";
import { Button } from "@repo/ui/components/button";
import { CaretRightIcon } from "@repo/icons";
import Link from "next/link";

export async function GuestbookTeaser() {
  const entries = pickRandom(await getGuestbookPreviewPool(), 15);

  return (
    <Section aria-label="From the guestbook" doodle="balloon">
      <Reveal className="group/iso">
        <div className="mb-8 grid items-center gap-8 md:grid-cols-[minmax(0,1fr)_20rem] lg:grid-cols-[minmax(0,1fr)_24rem]">
          <div className="flex min-w-0 flex-col items-start gap-6">
            <div className="flex max-w-2xl flex-col gap-3">
              <TypographyH2>From the guestbook</TypographyH2>
              <TypographyLead>
                People who stopped by and left a trace. Add yours.
              </TypographyLead>
            </div>
            <Button asChild variant="outline">
              <Link href="/guestbook" prefetch={false}>
                Sign the guestbook
                <CaretRightIcon
                  data-icon="inline-end"
                  className="size-3.5"
                  aria-hidden="true"
                />
              </Link>
            </Button>
          </div>
          <ArtStage className="-mx-gutter h-44 md:mx-0 md:h-auto md:aspect-video">
            <PageArt name="traces" data={entries.map((entry) => entry.user.name)} />
          </ArtStage>
        </div>

        <GuestbookPreview entries={entries} />
      </Reveal>
    </Section>
  );
}

import { getGuestbookPreview } from "@/app/(site)/guestbook/actions";
import { GuestbookRotator } from "@/app/(site)/_components/guestbook-rotator";
import { Section } from "@/components/layouts/page";
import {
  TypographyH2,
  TypographyLead,
  TypographyMark,
} from "@/components/ui/typography";
import { Reveal } from "@/components/shared/reveal";
import { ArtStage } from "@/components/layouts/hero-art";
import { PageArt } from "@/components/diagrams/page-art";
import { Button } from "@/components/ui/button";
import { CaretRightIcon } from "@/components/shared/icons";
import Link from "next/link";
import { unstable_rethrow } from "next/navigation";
import { connection } from "next/server";

export async function GuestbookTeaser() {
  await connection();

  let entries: Awaited<ReturnType<typeof getGuestbookPreview>>;
  try {
    entries = await getGuestbookPreview(15);
  } catch (error) {
    unstable_rethrow(error);
    console.error("Failed to load guestbook preview:", error);
    entries = [];
  }

  return (
    <Section aria-label="Guestbook preview">
      <TypographyH2 className="sr-only">From the guestbook</TypographyH2>
      <Reveal className="iso-trigger">
        <div className="mb-8 grid items-center gap-8 md:grid-cols-[minmax(0,1fr)_20rem] lg:grid-cols-[minmax(0,1fr)_24rem]">
          <div className="flex min-w-0 flex-col items-start gap-6">
            <TypographyLead className="max-w-2xl">
              People who stopped by and{" "}
              <TypographyMark>left a trace</TypographyMark>. Add yours.
            </TypographyLead>
            <Button asChild variant="outline">
              <Link href="/guestbook">
                Sign the guestbook
                <CaretRightIcon
                  data-icon="inline-end"
                  className="size-3.5"
                  aria-hidden="true"
                />
              </Link>
            </Button>
          </div>
          <ArtStage className="hidden aspect-video md:block">
            <PageArt name="traces" />
          </ArtStage>
        </div>

        <GuestbookRotator entries={entries} />
      </Reveal>
    </Section>
  );
}

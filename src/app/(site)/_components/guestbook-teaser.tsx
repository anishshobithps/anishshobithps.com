import { getGuestbookPreview } from "@/app/(site)/guestbook/actions";
import { GuestbookRotator } from "@/app/(site)/_components/guestbook-rotator";
import { Section } from "@/components/layouts/page";
import {
  SectionHeader,
  TypographyLead,
  TypographyMark,
} from "@/components/ui/typography";
import { Reveal } from "@/components/shared/reveal";
import { Button } from "@/components/ui/button";
import { CaretRightIcon } from "@/components/shared/icons";
import Link from "next/link";

export async function GuestbookTeaser() {
  const entries = await getGuestbookPreview(15);

  return (
    <Section aria-label="Guestbook preview">
      <SectionHeader>Guestbook</SectionHeader>

      <Reveal>
        <div className="mb-4 max-w-2xl">
          <TypographyLead>
            People who stopped by and{" "}
            <TypographyMark>left a trace</TypographyMark>. Add yours.
          </TypographyLead>
        </div>

        <GuestbookRotator entries={entries} />

        <Button asChild variant="outline">
          <Link href="/guestbook">
            Sign the guestbook
            <CaretRightIcon className="size-3.5" aria-hidden="true" />
          </Link>
        </Button>
      </Reveal>
    </Section>
  );
}

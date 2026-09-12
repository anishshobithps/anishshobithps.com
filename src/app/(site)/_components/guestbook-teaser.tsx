import { getGuestbookPreview } from "@/app/(site)/guestbook/actions";
import { GuestbookRotator } from "@/app/(site)/_components/guestbook-rotator";
import { Section } from "@/components/layouts/page";
import {
  TypographyLead,
  TypographyMark,
} from "@/components/ui/typography";
import { Reveal } from "@/components/shared/reveal";
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
            <CaretRightIcon
              data-icon="inline-end"
              className="size-3.5"
              aria-hidden="true"
            />
          </Link>
        </Button>
      </Reveal>
    </Section>
  );
}

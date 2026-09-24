import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyHeader } from "@/components/ui/empty";
import { HouseIcon } from "@/components/shared/icons";
import { PageArt } from "@/components/diagrams/page-art";
import { ArtStage } from "@/components/layouts/hero-art";
import {
  Text,
  TypographyMuted,
  TypographyMark,
} from "@/components/ui/typography";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
      <Empty className="relative z-10 flex-none gap-4 border-0">
        <ArtStage active className="aspect-[4/3] w-full max-w-md">
          <PageArt name="notFound" />
        </ArtStage>

        <EmptyHeader>
          <div className="space-y-2 text-center">
            <Text
              as="h1"
              variant="none"
              className="text-lg font-semibold tracking-tight"
            >
              Even my 404 has motion
            </Text>
            <TypographyMuted>
              I spent weeks on this site and you landed on the{" "}
              <TypographyMark>one page that doesn’t exist</TypographyMark>.
              Respect the effort.
            </TypographyMuted>
          </div>
        </EmptyHeader>

        <EmptyContent>
          <Button asChild size="lg">
            <Link href="/" className="flex items-center gap-2">
              <HouseIcon aria-hidden="true" data-icon="inline-start" />
              Go Home
            </Link>
          </Button>
        </EmptyContent>
      </Empty>
    </main>
  );
}

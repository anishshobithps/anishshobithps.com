import { PhotoGallery } from "@/app/(site)/photos/photo-gallery";
import { PhotosSkeleton } from "@/app/(site)/photos/photos-skeleton";
import { PageArt } from "@/components/diagrams/page-art";
import { HeroWithArt } from "@/components/layouts/hero-art";
import { Section } from "@/components/layouts/page";
import {
  TypographyH1,
  TypographyLead,
  TypographyMark,
} from "@/components/ui/typography";
import { features } from "@/lib/features";
import { buildMeta } from "@/lib/metadata";
import {
  formatTakenDate,
  photoTitle,
} from "@/lib/photo-meta";
import { getPublishedPhotos, photoPageUrl } from "@/lib/photos";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

const DESCRIPTION =
  "Photos straight off the camera roll, with the settings they were shot at. No presets, no filters.";

export async function generateMetadata({
  searchParams,
}: PageProps<"/photos">): Promise<Metadata> {
  if (!features.photos) notFound();

  const meta = buildMeta({
    title: "Photos",
    pageTitle: "Photos",
    description: DESCRIPTION,
    path: "home / photos",
    canonicalPath: "/photos",
    type: "website",
  });

  const { photo: id } = await searchParams;
  if (typeof id !== "string") return meta;
  const photo = (await getPublishedPhotos()).find((p) => p.id === id);
  if (!photo) return meta;

  const title = photoTitle(photo);
  const description =
    [
      photo.takenAt && formatTakenDate(photo.takenAt, photo.takenAtOffset),
      photo.location,
      photo.camera,
    ]
      .filter(Boolean)
      .join(", ") || DESCRIPTION;
  const image = { ...photo.ogImage, alt: photo.alt };

  return {
    ...meta,
    title,
    description,
    openGraph: {
      ...meta.openGraph,
      title,
      description,
      url: photoPageUrl(photo.id),
      images: [image],
    },
    twitter: { ...meta.twitter, title, description, images: [image] },
  };
}

export default function PhotosPage() {
  if (!features.photos) notFound();

  return (
    <>
      <Section variant="hero" aria-label="Photos header">
        <HeroWithArt art={<PageArt name="photos" />}>
          <TypographyH1>Photos</TypographyH1>
          <TypographyLead>
            Whatever was worth pulling the phone out for.{" "}
            <TypographyMark>Straight off the camera roll</TypographyMark>, with
            the settings it was shot at.
          </TypographyLead>
        </HeroWithArt>
      </Section>
      <Section variant="flush" aria-label="Photo gallery">
        <Suspense fallback={<PhotosSkeleton />}>
          <PhotoGallery description={DESCRIPTION} />
        </Suspense>
      </Section>
    </>
  );
}

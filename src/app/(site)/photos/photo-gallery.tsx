import { PhotoViewer } from "@/app/(site)/photos/photo-viewer";
import { Panel, PanelRow } from "@/components/layouts/page";
import { JsonLd } from "@/components/shared/json-ld";
import {
  SectionLabel,
  Text,
  TypographyMuted,
} from "@/components/ui/typography";
import { cn } from "@/lib/cn";
import { siteConfig } from "@/lib/config";
import {
  blurBackground,
  gridSizes,
  justifiedRows,
  justifiedTile,
  photoRowHeight,
} from "@/lib/photo-files";
import { exposureSummary, groupPhotosByMonth } from "@/lib/photo-meta";
import {
  getPublishedPhotos,
  photoPageUrl,
  type PublicPhoto,
} from "@/lib/photos";

const EAGER_TILES = 4;

function PhotoTile({ photo, eager }: { photo: PublicPhoto; eager: boolean }) {
  const summary = exposureSummary(photo);
  return (
    <li
      className="relative min-w-0 bg-background"
      style={justifiedTile(photo.width, photo.height)}
    >
      <a
        href={`/photos?photo=${photo.id}`}
        data-photo-id={photo.id}
        className="group/photo relative block size-full overflow-hidden outline-none after:pointer-events-none after:absolute after:inset-0 after:ring-ring after:ring-inset focus-visible:after:ring-2"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.src}
          srcSet={photo.srcSet}
          sizes={gridSizes(photo.width, photo.height)}
          alt={photo.alt}
          width={photo.width}
          height={photo.height}
          loading={eager ? "eager" : "lazy"}
          fetchPriority={eager ? "high" : "auto"}
          decoding="async"
          className="size-full bg-muted bg-cover object-cover"
          style={{
            backgroundImage: blurBackground(
              photo.blurDataUrl,
              photo.width,
              photo.height,
            ),
          }}
        />
        {summary.length > 0 && (
          <Text
            as="span"
            variant="none"
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-wrap gap-x-2.5 bg-linear-to-t from-black/75 from-45% to-transparent px-3 pt-8 pb-2.5 font-mono text-[11px] leading-none text-white opacity-0 transition-opacity duration-150 group-hover/photo:opacity-100 group-focus-visible/photo:opacity-100"
          >
            {summary.map((part) => (
              <span key={part} className="whitespace-nowrap">
                {part}
              </span>
            ))}
          </Text>
        )}
      </a>
    </li>
  );
}

function GalleryEmpty() {
  return (
    <div className="flex flex-col items-center gap-2 py-16 text-center">
      <TypographyMuted>Nothing on the wall yet.</TypographyMuted>
      <TypographyMuted className="font-mono text-xs">
        {"// the prints are still drying. check back soon."}
      </TypographyMuted>
    </div>
  );
}

export async function PhotoGallery({ description }: { description: string }) {
  const photos = await getPublishedPhotos();

  const jsonLd = (
    <JsonLd
      type="gallery"
      title="Photos"
      description={description}
      canonicalUrl={`${siteConfig.baseUrl}/photos`}
      images={photos.map((photo) => ({
        url: photo.ogImage.url,
        pageUrl: photoPageUrl(photo.id),
        caption: photo.caption ?? photo.alt,
        width: photo.width,
        height: photo.height,
        takenAt: photo.takenAt,
      }))}
    />
  );

  if (photos.length === 0) {
    return (
      <>
        {jsonLd}
        <GalleryEmpty />
      </>
    );
  }

  const groups = groupPhotosByMonth(photos);
  let rendered = 0;

  return (
    <>
      {jsonLd}
      <PhotoViewer photos={photos}>
        <Panel>
          {groups.map((group) => (
            <section
              key={group.key}
              aria-labelledby={`photos-${group.key}`}
              className="flex flex-col gap-px"
            >
              <PanelRow className="flex items-center justify-between gap-3 rounded-none py-3">
                <SectionLabel asChild aria-hidden={undefined} className="text-[11px]">
                  <h2 id={`photos-${group.key}`}>{group.label}</h2>
                </SectionLabel>
                <TypographyMuted className="font-mono text-xs tabular-nums">
                  {group.photos.length}{" "}
                  {group.photos.length === 1 ? "photo" : "photos"}
                </TypographyMuted>
              </PanelRow>
              <ul role="list" className={cn(justifiedRows, photoRowHeight)}>
                {group.photos.map((photo) => (
                  <PhotoTile
                    key={photo.id}
                    photo={photo}
                    eager={rendered++ < EAGER_TILES}
                  />
                ))}
              </ul>
            </section>
          ))}
        </Panel>
      </PhotoViewer>
    </>
  );
}

"use client";

import { fetchNowPlaying } from "@/app/(site)/actions";
import { TypographyMuted } from "@/components/ui/typography";
import { cn } from "@/lib/cn";
import { queryKeys } from "@/lib/query-keys";
import { useQuery } from "@tanstack/react-query";

function Turntable({ playing }: { playing: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 48 48"
      className="size-9 shrink-0 overflow-visible"
    >
      <g
        className={cn(
          "origin-center [transform-box:fill-box]",
          playing && "motion-safe:animate-[spin_1.8s_linear_infinite]",
        )}
      >
        <circle cx="21" cy="25" r="19" className="fill-muted stroke-foreground/25" />
        {[16, 13.5, 11].map((r) => (
          <circle
            key={r}
            cx="21"
            cy="25"
            r={r}
            fill="none"
            strokeWidth="0.6"
            className="stroke-foreground/15"
          />
        ))}
        <circle
          cx="21"
          cy="25"
          r="6.5"
          className={cn(
            "transition-[fill] duration-500",
            playing ? "fill-(--brand)" : "fill-muted-foreground/40",
          )}
        />
        <path
          d="M23.25 21.1 A4.5 4.5 0 0 1 25.5 25"
          fill="none"
          strokeWidth="0.9"
          strokeLinecap="round"
          className="stroke-background/70"
        />
        <circle cx="21" cy="25" r="1.1" className="fill-background" />
      </g>
      <path
        d="M5.84 16.25 A17.5 17.5 0 0 1 15.01 8.55 M36.16 33.75 A17.5 17.5 0 0 1 26.99 41.45"
        fill="none"
        strokeWidth="1.2"
        strokeLinecap="round"
        className="stroke-foreground/25"
      />
      <g
        className={cn(
          "origin-[41px_7px] [transform-box:view-box] motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-[cubic-bezier(0.2,0.8,0.2,1)]",
          !playing && "-rotate-14",
        )}
      >
        <path
          d="M41 7 L41 27 L36 33"
          fill="none"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="stroke-foreground/60"
        />
        <path
          d="M37.2 31.6 L34.6 34.7"
          strokeWidth="3"
          strokeLinecap="round"
          className="stroke-foreground/70"
        />
      </g>
      <circle cx="41" cy="7" r="3.2" className="fill-background stroke-foreground/45" />
      <circle cx="41" cy="7" r="1" className="fill-foreground/45" />
    </svg>
  );
}

export function NowPlayingLive() {
  const { data } = useQuery({
    queryKey: queryKeys.nowPlaying,
    queryFn: fetchNowPlaying,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });

  return (
    <div className="flex items-center gap-1.5 max-w-[280px] min-w-0">
      <Turntable playing={Boolean(data?.isPlaying)} />
      {!data?.title ? (
        <TypographyMuted className="font-mono truncate text-nowrap">
          not listening to anything
        </TypographyMuted>
      ) : (
        <TypographyMuted
          className="font-mono truncate text-nowrap"
          title={`${data.title} by ${data.artist}`}
        >
          {data.isPlaying ? "listening to" : "last listened to"}{" "}
          <a
            href={data.songUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors underline underline-offset-2"
            aria-label={`${data.title} by ${data.artist} on Spotify (opens in new tab)`}
          >
            {data.title}
          </a>
        </TypographyMuted>
      )}
    </div>
  );
}

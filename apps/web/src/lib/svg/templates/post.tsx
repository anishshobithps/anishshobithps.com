import { z } from "zod";
import { formatShortDate } from "@repo/core/date";
import { findPost, loadPostCard, type PostCard } from "@/lib/svg/data/posts";
import {
  Body,
  CardHeader,
  Cell,
  Frame,
  GUTTER,
  Label,
  Pill,
  Title,
  truncate,
} from "@repo/svg-kit/primitives";
import { CARD_WIDTH, defineTemplate, HOUR } from "@repo/svg-kit/template";

const SIZE = { width: CARD_WIDTH, height: 256 };
const MAX_TAGS = 3;

function meta({ date, readingMinutes }: PostCard) {
  return [
    date && formatShortDate(date),
    readingMinutes && `${readingMinutes} min read`,
  ]
    .filter(Boolean)
    .join(" · ");
}

const FIXTURE: PostCard = {
  url: "/blog/rcb-tickets-are-broken-so-i-built-an-alert-system-at-4am",
  title: "RCB Tickets Are Broken, So I Built an Alert System at 4AM",
  description:
    "Two hours of sleep-deprived coding, a Discord ping at 3:30pm, and tickets in hand by 3:40pm.",
  date: "2026-04-28T00:00:00.000Z",
  readingMinutes: 9,
  tags: ["RCB", "IPL", "TypeScript", "Effect", "Personal"],
};

export const post = defineTemplate({
  params: z.object({
    slug: z
      .string()
      .trim()
      .optional()
      .refine((slug) => !slug || Boolean(findPost(slug)), "No post with that slug."),
  }),
  size: () => SIZE,
  load: ({ slug }) => loadPostCard(slug),
  revalidate: HOUR,
  fixtures: [
    { label: "Latest post", query: {}, data: FIXTURE },
    {
      label: "Long title and description, no tags",
      query: { slug: "making-my-resume-machine-readable" },
      data: {
        ...FIXTURE,
        title:
          "I Never Thought I'd Code, Until This One Moment Changed Everything About How I Work",
        description:
          "From dreaming about architecture to building software. How curiosity, games, Discord bots, and one exam moment led me to a career in Computer Science, and what I would tell anyone starting today.",
        tags: [],
      },
    },
  ],
  render: ({ params, data, theme }) => (
    <Frame theme={theme} {...SIZE}>
      <CardHeader
        theme={theme}
        label={params.slug ? "Blog post" : "Latest post"}
      />
      <Cell
        theme={theme}
        style={{
          flex: 1,
          minHeight: 0,
          flexDirection: "column",
          justifyContent: "space-between",
          paddingTop: GUTTER,
          paddingBottom: GUTTER,
          paddingLeft: GUTTER,
          paddingRight: GUTTER,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Title theme={theme}>{truncate(data.title, 90)}</Title>
          {data.description && (
            <Body theme={theme}>{truncate(data.description, 170)}</Body>
          )}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <Label theme={theme}>{meta(data)}</Label>
          <div style={{ display: "flex", gap: 8 }}>
            {data.tags.slice(0, MAX_TAGS).map((tag) => (
              <Pill key={tag} theme={theme}>
                {`#${truncate(tag, 18)}`}
              </Pill>
            ))}
          </div>
        </div>
      </Cell>
    </Frame>
  ),
});

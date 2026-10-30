import { z } from "zod";
import { formatShortDate } from "@/lib/date";
import { formatCount } from "@/lib/github";
import { loadRecentPosts, type PostRow } from "@/lib/svg/data/posts";
import { limit } from "@/lib/svg/params";
import {
  CardHeader,
  Frame,
  HAIRLINE,
  HEADER_HEIGHT,
  Label,
  Line,
  List,
  listHeight,
  plural,
  Row,
  truncate,
} from "@/lib/svg/primitives";
import { CARD_WIDTH, defineTemplate, HOUR, type Theme } from "@/lib/svg/template";
import { padIndex } from "@/lib/text";

function height(rows: number) {
  return 3 * HAIRLINE + HEADER_HEIGHT + listHeight(rows);
}

function Post({ theme, index, post }: { theme: Theme; index: number; post: PostRow }) {
  return (
    <Row>
      <Label theme={theme} tone="accent">
        {padIndex(index + 1)}
      </Label>
      <Line theme={theme}>{truncate(post.title, 50)}</Line>
      <div style={{ display: "flex", justifyContent: "flex-end", width: 72 }}>
        {post.readingMinutes && (
          <Label theme={theme} tone="faint">
            {`${post.readingMinutes} min`}
          </Label>
        )}
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", width: 84 }}>
        <Label theme={theme}>
          {`${formatCount(post.views)} ${post.views === 1 ? "read" : "reads"}`}
        </Label>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", width: 108 }}>
        <Label theme={theme}>{post.date ? formatShortDate(post.date) : "Draft"}</Label>
      </div>
    </Row>
  );
}

const FIXTURE: PostRow[] = [
  {
    url: "/blog/rcb-tickets-are-broken-so-i-built-an-alert-system-at-4am",
    title: "RCB Tickets Are Broken, So I Built an Alert System at 4AM",
    date: "2026-04-28T00:00:00.000Z",
    readingMinutes: 9,
    views: 1284,
  },
  {
    url: "/blog/making-my-resume-machine-readable",
    title: "Making My Résumé Machine-Readable",
    date: "2026-03-06T00:00:00.000Z",
    readingMinutes: 7,
    views: 642,
  },
  {
    url: "/blog/how-i-started-coding",
    title: "I Never Thought I'd Code, Until This One Moment Changed Everything About How I Work",
    date: "2025-11-02T00:00:00.000Z",
    readingMinutes: 12,
    views: 1,
  },
];

export const posts = defineTemplate({
  params: z.object({ limit: limit(8, 3) }),
  size: ({ limit }) => ({ width: CARD_WIDTH, height: height(limit) }),
  load: ({ limit }) => loadRecentPosts(limit),
  revalidate: HOUR,
  fixtures: [
    { label: "Latest three", query: {}, data: { total: 11, posts: FIXTURE } },
    { label: "Nothing published", query: { limit: "1" }, data: { total: 0, posts: [] } },
  ],
  render: ({ params, data, theme }) => (
    <Frame theme={theme} width={CARD_WIDTH} height={height(params.limit)}>
      <CardHeader theme={theme} label="From the blog" meta={plural(data.total, "post")} />
      <List theme={theme} empty="Nothing published yet. Drafts don't count.">
        {data.posts.map((post, index) => (
          <Post key={post.url} theme={theme} index={index} post={post} />
        ))}
      </List>
    </Frame>
  ),
});

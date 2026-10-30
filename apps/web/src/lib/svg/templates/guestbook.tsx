import { z } from "zod";
import { formatRelativeDate } from "@repo/core/date";
import { type Guestbook, loadGuestbook } from "@/lib/svg/data/guestbook";
import { FONT_STACK, FONTS } from "@/lib/svg/fonts";
import { palette } from "@/lib/svg/palette";
import { limit } from "@/lib/svg/params";
import {
  Body,
  CardHeader,
  Frame,
  HAIRLINE,
  HEADER_HEIGHT,
  Label,
  List,
  listHeight,
  plural,
  Row,
  truncate,
} from "@/lib/svg/primitives";
import { CARD_WIDTH, defineTemplate, HOUR, type Theme } from "@/lib/svg/template";
import { sanitizeText } from "@repo/core/text";

const ROW_HEIGHT = 72;
const AVATAR = 36;

function height(rows: number) {
  return 3 * HAIRLINE + HEADER_HEIGHT + listHeight(rows, ROW_HEIGHT);
}

function Avatar({ theme, src, name }: { theme: Theme; src: string | null; name: string }) {
  const c = palette(theme);
  const frame = {
    flexShrink: 0,
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    border: `1px solid ${c.line}`,
  };
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} width={AVATAR} height={AVATAR} alt="" style={{ ...frame, objectFit: "cover" }} />
  ) : (
    <div
      style={{
        ...frame,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: c.brandWash,
      }}
    >
      <Label theme={theme} tone="accent" pixel>
        {Array.from(name)[0] ?? "?"}
      </Label>
    </div>
  );
}

function Signature({
  theme,
  entry,
}: {
  theme: Theme;
  entry: Guestbook["signatures"][number];
}) {
  return (
    <Row height={ROW_HEIGHT}>
      <Avatar theme={theme} src={entry.avatar} name={entry.name} />
      <div
        style={{
          display: "flex",
          flex: 1,
          minWidth: 0,
          flexDirection: "column",
          gap: 6,
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <span
            style={{
              fontFamily: FONT_STACK.body,
              fontWeight: FONTS.body.weight,
              fontSize: 16,
              lineHeight: 1.2,
              textWrap: "nowrap",
              color: palette(theme).foreground,
            }}
          >
            {truncate(entry.name, 32)}
          </span>
          <Label theme={theme} tone="faint">
            {formatRelativeDate(entry.createdAt)}
          </Label>
        </div>
        <Body theme={theme} lines={1}>
          {truncate(sanitizeText(entry.message), 88)}
        </Body>
      </div>
      <Label theme={theme} tone="accent">
        {`No. ${entry.number}`}
      </Label>
    </Row>
  );
}

const FIXTURE: Guestbook = {
  total: 128,
  signatures: [
    {
      number: 128,
      name: "Priya Rao",
      message: "The pen plotter in the footer is the most unnecessary, wonderful thing I've seen this week.",
      createdAt: "2026-10-09T10:00:00.000Z",
      avatar: null,
    },
    {
      number: 127,
      name: "Rahul",
      message: "Came for the résumé, stayed for the 404 page.",
      createdAt: "2026-10-01T10:00:00.000Z",
      avatar: null,
    },
    {
      number: 126,
      name: "Sam Okafor",
      message: "hi 👋",
      createdAt: "2026-09-12T10:00:00.000Z",
      avatar: null,
    },
  ],
};

export const guestbook = defineTemplate({
  params: z.object({ limit: limit(6, 3) }),
  size: ({ limit }) => ({ width: CARD_WIDTH, height: height(limit) }),
  load: ({ limit }) => loadGuestbook(limit),
  revalidate: HOUR,
  fixtures: [
    { label: "Latest three", query: {}, data: FIXTURE },
    { label: "Empty", query: { limit: "1" }, data: { total: 0, signatures: [] } },
  ],
  render: ({ params, data, theme }) => (
    <Frame theme={theme} width={CARD_WIDTH} height={height(params.limit)}>
      <CardHeader
        theme={theme}
        label="Guestbook"
        meta={plural(data.total, "signature")}
      />
      <List theme={theme} empty="Nobody has signed yet. The pen is right there.">
        {data.signatures.map((entry) => (
          <Signature key={entry.number} theme={theme} entry={entry} />
        ))}
      </List>
    </Frame>
  ),
});

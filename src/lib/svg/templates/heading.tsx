import { z } from "zod";
import { FONT_STACK, FONTS } from "@/lib/svg/fonts";
import { palette } from "@/lib/svg/palette";
import { Hairline, Label, truncate } from "@/lib/svg/primitives";
import { CARD_WIDTH, defineTemplate, type Theme } from "@/lib/svg/template";
import { padIndex } from "@/lib/text";

const BADGE = 24;
const ROW = { height: 40, badge: 32 };
const TITLE_MAX = 40;

function Badge({ theme, n, size }: { theme: Theme; n: number; size: number }) {
  const c = palette(theme);
  return (
    <div
      style={{
        display: "flex",
        flexShrink: 0,
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: size / 2,
        border: `1px solid ${c.brand}`,
        backgroundColor: c.brandWash,
      }}
    >
      <Label theme={theme} tone="accent" pixel size={size > BADGE ? 13 : 11}>
        {padIndex(n)}
      </Label>
    </div>
  );
}

export const heading = defineTemplate({
  params: z.object({
    n: z.coerce.number().int().min(1).max(99),
    title: z
      .string()
      .trim()
      .optional()
      .transform((title) => (title ? truncate(title, TITLE_MAX) : undefined)),
  }),
  size: ({ title }) =>
    title
      ? { width: CARD_WIDTH, height: ROW.height }
      : { width: BADGE, height: BADGE },
  fixtures: [
    {
      label: "With title",
      query: { n: "2", title: "Selected work" },
      data: undefined,
    },
    {
      label: "Long title, truncated",
      query: {
        n: "12",
        title: "Things I built when I should have been sleeping instead",
      },
      data: undefined,
    },
    { label: "Circle only", query: { n: "3" }, data: undefined },
  ],
  render: ({ params: { n, title }, theme }) => {
    if (!title) return <Badge theme={theme} n={n} size={BADGE} />;

    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          width: CARD_WIDTH,
          height: ROW.height,
        }}
      >
        <Badge theme={theme} n={n} size={ROW.badge} />
        <span
          style={{
            flexShrink: 0,
            fontFamily: FONT_STACK.display,
            fontWeight: FONTS.display.weight,
            fontSize: 24,
            lineHeight: 1,
            letterSpacing: "-0.02em",
            textWrap: "nowrap",
            color: palette(theme).foreground,
          }}
        >
          {title}
        </span>
        <Hairline theme={theme} />
      </div>
    );
  },
});

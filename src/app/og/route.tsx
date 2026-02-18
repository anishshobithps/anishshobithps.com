import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

const BASE = process.env.NEXT_PUBLIC_BASE_URL! || "http://localhost:3000";
const A = `${BASE}/og-assets`;

const C = {
  bg: "#1c1c1f",
  bgDeep: "#161618",
  fg: "#fafafa",
  primary: "#e8e8ea",
  muted: "#71717a",
  mutedLight: "#a1a1aa",
  border: "rgba(255,255,255,0.08)",
  borderBright: "rgba(255,255,255,0.14)",
  accent: "#3f3f46",
  green: "#22c55e",
  greenGlow: "rgba(34,197,94,0.35)",
};

const truncate = (str: string, max: number) =>
  str.length > max ? str.slice(0, max - 1).trimEnd() + "…" : str;

const titleFontSize = (len: number) => {
  if (len > 80) return 44;
  if (len > 55) return 54;
  if (len > 35) return 64;
  return 76;
};

const fetchFont = async (path: string) => {
  const res = await fetch(`${BASE}/fonts/${path}`);
  return res.arrayBuffer();
};

export async function GET(req: NextRequest) {
  const [geist700, geist400] = await Promise.all([
    fetchFont("Geist-SemiBold.ttf"),
    fetchFont("Geist-Regular.ttf"),
  ]);

  const { searchParams } = new URL(req.url);

  const rawTitle = searchParams.get("title") ?? "Untitled";
  const rawDescription = searchParams.get("description") ?? "";
  const name = truncate(searchParams.get("name") ?? "Anish Shobith P S", 40);
  const domain = truncate(
    searchParams.get("domain") ?? "anishshobithps.com",
    50,
  );
  const path = truncate(searchParams.get("path") ?? "home / blog", 60);

  const title = truncate(rawTitle, 100);
  const description = truncate(rawDescription, 130);

  const tags = (searchParams.get("tags")?.split(",").filter(Boolean) ?? [])
    .slice(0, 4)
    .map((t) => truncate(t.trim(), 20));

  const tSize = titleFontSize(title.length);
  const hasDescription = description.length > 0;

  return new ImageResponse(
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: 1200,
        height: 630,
        background: `linear-gradient(160deg, #1e1e22 0%, ${C.bgDeep} 55%, #111113 100%)`,
        color: C.fg,
        padding: "44px 80px 56px",
        fontFamily: "Geist",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background:
            "linear-gradient(90deg, rgba(232,232,234,0.9) 0%, rgba(232,232,234,0.3) 50%, rgba(232,232,234,0) 100%)",
          display: "flex",
        }}
      />

      <div
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          background:
            "radial-gradient(circle at center, rgba(255,255,255,0.06) 0%, transparent 70%)",
          top: -370,
          right: 630,
        }}
      />

      <img
        src={`${A}/watermark.png`}
        width={580}
        height={580}
        style={{
          position: "absolute",
          bottom: -110,
          right: -50,
          opacity: 0.035,
          transform: "rotate(10deg)",
          display: "flex",
        }}
      />

      <img
        src={`${A}/noise.png`}
        width={1200}
        height={630}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          opacity: 0.06,
          zIndex: 50,
          display: "flex",
        }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 60,
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            minWidth: 0,
          }}
        >
          <img
            src={`${A}/logo.png`}
            width={44}
            height={44}
            style={{ display: "flex", borderRadius: 10, flexShrink: 0 }}
          />
          <div
            style={{
              display: "flex",
              width: 1,
              height: 20,
              backgroundColor: C.border,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              display: "flex",
              fontFamily: "Geist",
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: C.muted,
              whiteSpace: "nowrap",
              overflow: "hidden",
              maxWidth: 500,
            }}
          >
            {path}
          </span>
        </div>

        <span
          style={{
            display: "flex",
            fontFamily: "Geist",
            fontSize: 20,
            color: C.muted,
            opacity: 0.45,
            flexShrink: 0,
            whiteSpace: "nowrap",
          }}
        >
          {domain}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 20,
          zIndex: 60,
          position: "relative",
          flex: 1,
          justifyContent: "center",
          marginTop: 16,
          marginBottom: 16,
        }}
      >
        {tags.length > 0 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "nowrap" }}>
            {tags.map((tag) => (
              <span
                key={tag}
                style={{
                  display: "flex",
                  padding: "5px 14px",
                  fontSize: 10,
                  fontFamily: "Geist",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.18em",
                  border: `1px solid ${C.borderBright}`,
                  backgroundColor: "rgba(255,255,255,0.04)",
                  color: C.mutedLight,
                  borderRadius: 6,
                  whiteSpace: "nowrap",
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div
          style={{
            display: "flex",
            fontSize: tSize,
            fontWeight: 900,
            lineHeight: 1.08,
            letterSpacing: "-0.03em",
            color: C.fg,
            maxWidth: 1040,
            wordBreak: "break-word",
          }}
        >
          {title}
        </div>

        {hasDescription && (
          <div
            style={{
              display: "flex",
              fontSize: 22,
              fontWeight: 400,
              color: C.mutedLight,
              maxWidth: 820,
              lineHeight: 1.55,
              opacity: 0.85,
            }}
          >
            {description}
          </div>
        )}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          borderTop: `1px solid ${C.border}`,
          paddingTop: 28,
          zIndex: 60,
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            minWidth: 0,
          }}
        >
          <span
            style={{
              display: "flex",
              fontSize: 9,
              fontFamily: "Geist",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.55em",
              color: C.muted,
            }}
          >
            Author / Engineer
          </span>

          <span
            style={{
              display: "flex",
              fontSize: 34,
              fontWeight: 800,
              letterSpacing: "-0.025em",
              color: C.fg,
              whiteSpace: "nowrap",
              overflow: "hidden",
              maxWidth: 600,
            }}
          >
            {name}
          </span>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              padding: "5px 14px 5px 10px",
              border: `1px solid rgba(34,197,94,0.25)`,
              borderRadius: 8,
              backgroundColor: "rgba(34,197,94,0.06)",
              alignSelf: "flex-start" as const,
              marginTop: 2,
            }}
          >
            <div
              style={{
                position: "relative",
                display: "flex",
                width: 10,
                height: 10,
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  backgroundColor: C.green,
                  boxShadow: `0 0 10px ${C.greenGlow}, 0 0 20px ${C.greenGlow}`,
                }}
              />
            </div>
            <span
              style={{
                fontSize: 10,
                fontFamily: "Geist",
                fontWeight: 600,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: C.green,
              }}
            >
              Available for hire
            </span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
            alignItems: "flex-end",
            opacity: 0.18,
            flexShrink: 0,
          }}
        >
          {[100, 70, 45].map((w, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                width: w,
                height: 1,
                backgroundColor: C.mutedLight,
              }}
            />
          ))}
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Geist", data: geist700, weight: 700, style: "normal" },
        { name: "Geist", data: geist400, weight: 400, style: "normal" },
      ],
    },
  );
}

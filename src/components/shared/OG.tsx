const theme = {
  background: "#141417",
  foreground: "#f9f9fb",
  mutedFg: "#8888a0",
  border: "rgba(255,255,255,0.10)",
  input: "rgba(255,255,255,0.15)",
  purple: "#a855f7",
  selectionBg: "#86efac",
  selectionFg: "#052e16",
  gridLine: "rgba(255,255,255,0.025)",
};

function LogoGlyph({ size = 32, color }: { size?: number; color: string }) {
  const scaledWidth = Math.round((50 / 64) * size);
  return (
    <svg
      viewBox="14 0 50 64"
      width={scaledWidth}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <polygon points="32,4 48,60 40.5,60 32,14 23.5,60 16,60" fill={color} />
      <rect x="18" y="36" width="11" height="5" rx="2.5" fill={color} />
      <rect x="35" y="36" width="11" height="5" rx="2.5" fill={color} />
    </svg>
  );
}

export interface OGImageProps {
  title: string;
  description: string;
  name: string;
  role: string;
  domain: string;
  path: string;
  tags: string[];
  availableForHire: boolean;
}

function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max).trimEnd() + "…" : str;
}

function getTitleFontSize(title: string): number {
  const len = title.length;
  if (len < 20) return 64;
  if (len < 40) return 52;
  if (len < 60) return 42;
  if (len < 80) return 34;
  return 28;
}

function getDescFontSize(desc: string): number {
  const len = desc.length;
  if (len < 80) return 24;
  if (len < 140) return 20;
  return 17;
}

function parsePathSegments(input: string): string[] {
  let cleaned = input.trim();
  try {
    const url = new URL(cleaned);
    cleaned = url.pathname;
  } catch {}
  return cleaned.split("/").filter(Boolean);
}

function PathDisplay({ path }: { path: string }) {
  const segments = parsePathSegments(path);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      {segments.map((segment, i) => {
        const isLast = i === segments.length - 1;
        return (
          <div
            key={segment}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            {i > 0 && (
              <span
                style={{
                  fontFamily: "'Geist Mono', monospace",
                  fontSize: 13,
                  color: "rgba(136,136,160,0.3)",
                  fontWeight: 300,
                }}
              >
                /
              </span>
            )}
            <span
              style={{
                fontFamily: "'Geist Mono', monospace",
                fontWeight: isLast ? 500 : 400,
                fontSize: 13,
                letterSpacing: "0.02em",
                color: isLast ? theme.selectionBg : "rgba(136,136,160,0.4)",
              }}
            >
              {segment}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function OGImage({
  title,
  description,
  name,
  role,
  domain,
  path,
  tags,
  availableForHire,
}: OGImageProps) {
  return (
    <div
      style={{
        width: 1200,
        height: 630,
        backgroundColor: theme.background,
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Geist', sans-serif",
        display: "flex",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: `linear-gradient(90deg, transparent 0%, ${theme.selectionBg}88 20%, ${theme.selectionBg} 50%, ${theme.selectionBg}88 80%, transparent 100%)`,
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(${theme.gridLine} 1px, transparent 1px), linear-gradient(90deg, ${theme.gridLine} 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: -140,
          right: -100,
          width: 640,
          height: 640,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(134,239,172,0.08) 0%, transparent 70%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          bottom: -160,
          left: -80,
          width: 500,
          height: 500,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(134,239,172,0.04) 0%, transparent 70%)",
        }}
      />

      <svg
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: 0.04,
          mixBlendMode: "overlay",
        }}
      >
        <filter id="noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.75"
            numOctaves="4"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise)" />
      </svg>

      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.6) 100%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          bottom: -110,
          right: -40,
          transform: "rotate(10deg)",
          opacity: 0.025,
        }}
      >
        <LogoGlyph size={520} color={theme.foreground} />
      </div>

      <div
        style={{
          padding: "0 80px 56px 80px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 44,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <LogoGlyph size={32} color={theme.foreground} />
            <div
              style={{
                width: 1,
                height: 20,
                background: `linear-gradient(to bottom, transparent, ${theme.input}, transparent)`,
              }}
            />
            <PathDisplay path={path} />
          </div>
          <span
            style={{
              fontFamily: "'Geist Mono', monospace",
              fontSize: 20,
              fontStyle: "italic",
              color: theme.mutedFg,
            }}
          >
            {domain}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 22,
            justifyContent: "center",
            flex: 1,
          }}
        >
          {tags.length > 0 && (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    padding: "5px 14px",
                    fontSize: 11,
                    fontFamily: "'Geist Mono', monospace",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    border: "1px solid rgba(134,239,172,0.2)",
                    backgroundColor: "rgba(134,239,172,0.06)",
                    color: theme.selectionBg,
                    borderRadius: 6,
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div
            style={{
              fontSize: getTitleFontSize(title),
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              color: theme.foreground,
            }}
          >
            {truncate(title, 80)}
          </div>

          <div
            style={{
              fontSize: getDescFontSize(description),
              color: theme.mutedFg,
              maxWidth: "72%",
              lineHeight: 1.55,
              fontStyle: "italic",
            }}
          >
            {truncate(description, 160)}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            borderTop: `1px solid ${theme.border}`,
            paddingTop: 28,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.35em",
                  color: theme.purple,
                  fontFamily: "'Geist Mono', monospace",
                }}
              >
                {role}
              </span>
              <div
                style={{
                  fontSize: 36,
                  fontWeight: 700,
                  color: theme.foreground,
                  letterSpacing: "-0.02em",
                }}
              >
                {name}
              </div>
            </div>

            {availableForHire && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  paddingTop: 6,
                  paddingBottom: 6,
                  paddingLeft: 12,
                  paddingRight: 12,
                  borderRadius: 6,
                  backgroundColor: "rgba(134,239,172,0.08)",
                  border: "1px solid rgba(134,239,172,0.25)",
                  alignSelf: "flex-start",
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: theme.selectionBg,
                  }}
                />
                <span
                  style={{
                    fontSize: 11,
                    fontFamily: "'Geist Mono', monospace",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    color: theme.selectionBg,
                    whiteSpace: "nowrap",
                  }}
                >
                  Available for hire
                </span>
              </div>
            )}
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 8,
              opacity: 0.45,
            }}
          >
            <div
              style={{ width: 40, height: 1, backgroundColor: theme.mutedFg }}
            />
            <span
              style={{
                fontFamily: "'Geist Mono', monospace",
                fontSize: 17,
                color: theme.mutedFg,
                letterSpacing: "0.12em",
                fontWeight: 600,
              }}
            >
              © 2022 — {new Date().getFullYear()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

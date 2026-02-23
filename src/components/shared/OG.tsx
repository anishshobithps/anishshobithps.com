const theme = {
  background: "#141417",
  backgroundAlt: "#1a1a20",
  foreground: "#f5f5f7",
  primary: "#e8e8ec",
  muted: "#6b6b80",
  mutedBright: "#9999aa",
  border: "rgba(255, 255, 255, 0.08)",
  borderBright: "rgba(255, 255, 255, 0.15)",
  accent: "#2a2a35",
  green: "#10b981",
  purpleAccent: "#8b7cf8",
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
          height: 3,
          background: `linear-gradient(90deg, ${theme.purpleAccent} 0%, #c084fc 40%, #f472b6 70%, transparent 100%)`,
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: -120,
          right: -80,
          width: 600,
          height: 600,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(139,124,248,0.08) 0%, transparent 70%)",
        }}
      />

      <svg
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: 0.035,
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
            "radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.55) 100%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          bottom: -100,
          right: -30,
          transform: "rotate(10deg)",
          opacity: 0.03,
        }}
      >
        <LogoGlyph size={500} color={theme.foreground} />
      </div>

      <div
        style={{
          padding: "0 80px 56px 80px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
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
                background: `linear-gradient(to bottom, transparent, ${theme.borderBright}, transparent)`,
              }}
            />

            <span
              style={{
                fontFamily: "'Geist Mono', monospace",
                fontWeight: 700,
                fontSize: 12,
                letterSpacing: "0.18em",
                color: theme.muted,
                textTransform: "uppercase",
              }}
            >
              {path}
            </span>
          </div>

          <span
            style={{
              fontFamily: "'Geist Mono', monospace",
              fontSize: 20,
              fontStyle: "italic",
              color: theme.muted,
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
                    border: `1px solid rgba(139,124,248,0.3)`,
                    backgroundColor: "rgba(139,124,248,0.07)",
                    color: "#b8aefc",
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
              display: "flex",
              flexWrap: "wrap",
              alignItems: "baseline",
              columnGap: 16,
            }}
          >
            {title && <span>{truncate(title, 80)}</span>}
          </div>

          <div
            style={{
              fontSize: getDescFontSize(description),
              color: theme.mutedBright,
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
                  color: theme.purpleAccent,
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
                  backgroundColor: "rgba(16, 185, 129, 0.06)",
                  border: `1px solid rgba(16, 185, 129, 0.2)`,
                  alignSelf: "flex-start",
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: theme.green,
                  }}
                />
                <span
                  style={{
                    fontSize: 11,
                    fontFamily: "'Geist Mono', monospace",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    color: theme.green,
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
              style={{ width: 40, height: 1, backgroundColor: theme.muted }}
            />
            <span
              style={{
                fontFamily: "'Geist Mono', monospace",
                fontSize: 17,
                color: theme.muted,
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

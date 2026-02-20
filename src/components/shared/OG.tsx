const theme = {
  background: "#141417",
  backgroundAlt: "#1a1a20",
  foreground: "#f0f0f5",
  primary: "#e8e8ec",
  muted: "#6b6b80",
  mutedBright: "#9999aa",
  border: "rgba(255, 255, 255, 0.08)",
  borderBright: "rgba(255, 255, 255, 0.15)",
  accent: "#2a2a35",
  accentGlow: "rgba(120, 100, 255, 0.12)",
  green: "#10b981",
  purpleAccent: "#8b7cf8",
};

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
      {/* Top accent bar */}
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

      {/* Grid texture */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Radial glow */}
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

      {/* Noise texture */}
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

      {/* Vignette overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.55) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Large watermark SVG */}
      <div
        style={{
          position: "absolute",
          bottom: -80,
          right: -20,
          transform: "rotate(10deg)",
          opacity: 0.035,
        }}
      >
        <svg viewBox="0 0 64 64" width={480} height={480} fill="none">
          <polygon
            points="32,4 48,60 40.5,60 32,14 23.5,60 16,60"
            fill={theme.foreground}
          />
          <rect
            x={18}
            y={36}
            width={11}
            height={5}
            rx={2.5}
            fill={theme.foreground}
          />
          <rect
            x={35}
            y={36}
            width={11}
            height={5}
            rx={2.5}
            fill={theme.foreground}
          />
        </svg>
      </div>

      {/* Inner padded wrapper */}
      <div
        style={{
          padding: "0 80px 56px 80px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 40,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            {/* Top-left logo */}
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                backgroundColor: theme.foreground,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg viewBox="0 0 64 64" width={30} height={30} fill="none">
                <polygon
                  points="32,9 46,55 39.5,55 32,20 24.5,55 18,55"
                  fill={theme.background}
                />
                <rect
                  x={18.5}
                  y={34}
                  width={10}
                  height={4.5}
                  rx={2.25}
                  fill={theme.background}
                />
                <rect
                  x={35.5}
                  y={34}
                  width={10}
                  height={4.5}
                  rx={2.25}
                  fill={theme.background}
                />
              </svg>
            </div>

            <div
              style={{
                width: 1,
                height: 28,
                background: `linear-gradient(to bottom, transparent, ${theme.borderBright}, transparent)`,
              }}
            />

            <span
              style={{
                fontFamily: "'Geist Mono', monospace",
                fontWeight: 700,
                fontSize: 13,
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
              fontSize: 22,
              fontStyle: "italic",
              color: theme.muted,
            }}
          >
            {domain}
          </span>
        </div>

        {/* BODY */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
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
              fontSize: 64,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              color: theme.foreground,
            }}
          >
            {title}
          </div>

          <div
            style={{
              fontSize: 26,
              color: theme.mutedBright,
              maxWidth: "65%",
              lineHeight: 1.5,
              fontStyle: "italic",
            }}
          >
            {description}
          </div>
        </div>

        {/* FOOTER */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            borderTop: `1px solid ${theme.border}`,
            paddingTop: 28,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span
                style={{
                  fontSize: 14,
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
                  fontSize: 38,
                  fontWeight: 700,
                  color: theme.foreground,
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
                fontSize: 18,
                color: theme.muted,
                letterSpacing: "0.12em",
                fontWeight: 600,
              }}
            >
              © 2020 — {new Date().getFullYear()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

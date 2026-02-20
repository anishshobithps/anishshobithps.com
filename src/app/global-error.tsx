"use client";

import { useEffect, useState } from "react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ reset }: GlobalErrorProps) {
  const [showLogo, setShowLogo] = useState(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const schedule = () => {
      const delay = 800 + Math.random() * 2700;
      timeout = setTimeout(() => {
        setShowLogo(true);
        const hold = 150 + Math.random() * 250;
        setTimeout(() => {
          setShowLogo(false);
          schedule()
        }, hold);
      }, delay);
    };

    schedule();
    return () => clearTimeout(timeout);
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "24px",
          background: "#000",
          color: "#fff",
          fontFamily: "ui-monospace, monospace",
          position: "relative",
          overflow: "hidden",
        }}
      >

        {/* ── CRT noise + scanlines ── */}
        <svg
          aria-hidden="true"
          style={{
            position: "fixed",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: 0,
          }}
        >
          <defs>
            <filter id="crt-noise" x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.65"
                numOctaves="3"
                stitchTiles="stitch"
                result="noise"
              >
                <animate
                  attributeName="seed"
                  values="0;1;2;3;4;5;6;7;8;9;10;11;12;13;14;15"
                  dur="0.4s"
                  repeatCount="indefinite"
                  calcMode="discrete"
                />
              </feTurbulence>
              <feColorMatrix type="saturate" values="0" in="noise" result="grayNoise" />
              <feBlend in="SourceGraphic" in2="grayNoise" mode="overlay" result="blended" />
              <feComponentTransfer in="blended">
                <feFuncA type="linear" slope="0.08" />
              </feComponentTransfer>
            </filter>

            <pattern id="scanlines" x="0" y="0" width="100%" height="3" patternUnits="userSpaceOnUse">
              <rect x="0" y="0" width="100%" height="1" fill="rgba(0,0,0,0.18)" />
              <rect x="0" y="1" width="100%" height="2" fill="transparent" />
            </pattern>

            <style>{`
              @keyframes flicker-overlay {
                0%, 100% { opacity: 1;    }
                8%        { opacity: 0.92; }
                15%       { opacity: 1;    }
                42%       { opacity: 0.96; }
                43%       { opacity: 0.8;  }
                44%       { opacity: 0.96; }
                75%       { opacity: 1;    }
                88%       { opacity: 0.93; }
                89%       { opacity: 1;    }
              }
              @keyframes vignette-pulse {
                0%, 100% { opacity: 0.7; }
                50%       { opacity: 0.5; }
              }
              .crt-flicker { animation: flicker-overlay 5s ease-in-out infinite; }
              .crt-vignette { animation: vignette-pulse 4s ease-in-out infinite; }
            `}</style>

            <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
              <stop offset="0%"   stopColor="transparent" />
              <stop offset="100%" stopColor="rgba(0,0,0,0.85)" />
            </radialGradient>
          </defs>

          <rect className="crt-flicker" width="100%" height="100%" fill="white" filter="url(#crt-noise)" />
          <rect width="100%" height="100%" fill="url(#scanlines)" />
          <rect className="crt-vignette" width="100%" height="100%" fill="url(#vignette)" />
        </svg>

        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "24px" }}>

          {/* 500 with logo randomly replacing the middle 0 */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 232 96"
            width="232"
            height="96"
            fill="none"
            aria-label="500"
          >
            <defs>
              <style>{`
                .ge-n {
                  font-family: ui-monospace, monospace;
                  font-size: 96px;
                  font-weight: 600;
                  letter-spacing: -0.03em;
                  fill: #ffffff;
                }
              `}</style>
            </defs>

            {/* "5" */}
            <g>
              <text className="ge-n" x="0" y="88">5</text>
              <animate attributeName="opacity" calcMode="discrete"
                values="1;1;1;0.1;1;1;0.8;1;1;1;0.15;1;1;0.05;1;1;1;0.9;0.1;1"
                keyTimes="0;0.05;0.1;0.12;0.14;0.3;0.31;0.33;0.4;0.5;0.52;0.54;0.6;0.72;0.74;0.8;0.9;0.91;0.93;1"
                dur="3.8s" repeatCount="indefinite" />
            </g>

            {/* Middle character: "0" or logo glyph */}
            <g>
              {showLogo ? (
                <g transform="translate(79.6, 5) scale(1.375) translate(-14, 0)">
                  <polygon points="32,4 48,60 40.5,60 32,14 23.5,60 16,60" fill="white" />
                  <rect x="18" y="36" width="11" height="5" rx="2.5" fill="white" />
                  <rect x="35" y="36" width="11" height="5" rx="2.5" fill="white" />
                </g>
              ) : (
                <g>
                  <text className="ge-n" x="76" y="88">0</text>
                  <animate attributeName="opacity" calcMode="discrete"
                    values="1;0.05;1;0.8;0.05;1;1;0.1;1;0.05;0.9;1;0.05;1;1;0.1;1;0.05;1;1"
                    keyTimes="0;0.07;0.09;0.2;0.22;0.24;0.35;0.37;0.39;0.5;0.52;0.54;0.65;0.67;0.7;0.8;0.82;0.9;0.92;1"
                    dur="3s" repeatCount="indefinite" />
                </g>
              )}
            </g>

            {/* last "0" */}
            <g>
              <text className="ge-n" x="152" y="88">0</text>
              <animate attributeName="opacity" calcMode="discrete"
                values="1;1;0.2;1;1;1;0.1;0.8;0.1;1;1;0.15;1;1;1;0.05;1;1;1;1"
                keyTimes="0;0.1;0.12;0.14;0.3;0.4;0.42;0.44;0.46;0.5;0.6;0.62;0.64;0.7;0.8;0.85;0.87;0.9;0.95;1"
                dur="4.2s" repeatCount="indefinite" />
            </g>
          </svg>

          <div style={{ textAlign: "center", fontSize: "13px", lineHeight: "1.6" }}>
            <p style={{ margin: "0 0 4px", fontSize: "16px", fontWeight: 600, color: "#fff" }}>
              Well… that escalated quickly.
            </p>
            <p style={{ margin: 0, opacity: 0.5 }}>
              The entire layout collapsed. Not ideal.
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={reset}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "8px 16px",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "6px",
                background: "transparent", color: "#fff",
                fontSize: "14px", cursor: "pointer",
                fontFamily: "ui-monospace, monospace",
              }}
            >
              Try Again
            </button>
            <a
              href="/"
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "8px 16px", borderRadius: "6px",
                background: "#fff", color: "#000",
                fontSize: "14px", textDecoration: "none",
                fontFamily: "ui-monospace, monospace", fontWeight: 600,
              }}
            >
              Go Home
            </a>
          </div>
        </div>

      </body>
    </html>
  );
}

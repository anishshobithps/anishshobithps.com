"use client";

export default function Loading() {
  const uid = "logoLoader";

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background">
      <svg
        role="img"
        aria-label="Loading"
        viewBox="14 0 50 64"
        width="50"
        height="64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-foreground transition-colors select-none"
      >
        <defs>
          <clipPath id={`${uid}-fillClip`}>
            <rect x="0" y="0" width="64" height="64">
              <animate
                attributeName="y"
                values="64; 4; 64"
                dur="1.5s"
                keyTimes="0; 0.5; 1"
                calcMode="spline"
                keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"
                repeatCount="indefinite"
              />
            </rect>
          </clipPath>
          <style>{`
            @media (prefers-reduced-motion: reduce) {
              .${uid}-ghost  { animation: none !important; opacity: 0.5; }
              .${uid}-filled { animation: none !important; clip-path: none; opacity: 0; }
            }
            @keyframes ${uid}-ghostBreath {
              0%, 100% { opacity: 0.12; transform: scale(1);    }
              50%       { opacity: 0.07; transform: scale(0.99); }
            }
            @keyframes ${uid}-breath {
              0%, 100% { transform: scale(1);    }
              50%       { transform: scale(0.99); }
            }
            .${uid}-ghost {
              fill: currentColor;
              transform-origin: 32px 32px;
              animation: ${uid}-ghostBreath 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
            }
            .${uid}-filled {
              fill: currentColor;
              transform-origin: 32px 32px;
              clip-path: url(#${uid}-fillClip);
              animation: ${uid}-breath 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
            }
          `}</style>
        </defs>

        <g className={`${uid}-ghost`}>
          <polygon points="32,4 48,60 40.5,60 32,14 23.5,60 16,60" />
          <rect x="18" y="36" width="11" height="5" rx="2.5" />
          <rect x="35" y="36" width="11" height="5" rx="2.5" />
        </g>

        <g className={`${uid}-filled`}>
          <polygon points="32,4 48,60 40.5,60 32,14 23.5,60 16,60" />
          <rect x="18" y="36" width="11" height="5" rx="2.5" />
          <rect x="35" y="36" width="11" height="5" rx="2.5" />
        </g>
      </svg>
    </div>
  );
}

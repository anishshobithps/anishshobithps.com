import { MascotFigure, type MascotEyes } from "@/components/shared/logo-mascot";

type Mood = "" | "terrible" | "bad" | "good" | "amazing";

const REACTIONS: Record<Mood, { eyes: MascotEyes; mouth: string }> = {
  "": { eyes: "open", mouth: "M27.5 50 Q32 52 36.5 48.5" },
  terrible: { eyes: "angry", mouth: "M27.5 52.5 Q32 47 36.5 52.5" },
  bad: { eyes: "flat", mouth: "M28 50.5 Q32 50.5 36 50.5" },
  good: { eyes: "open", mouth: "M27.5 49 Q32 54 36.5 49" },
  amazing: { eyes: "happy", mouth: "M27 48.5 Q32 57.5 37 48.5" },
};

export function ReactionMascot({ mood }: { mood: Mood }) {
  const { eyes, mouth } = REACTIONS[mood];
  return (
    <svg
      viewBox="12 0 40 64"
      aria-hidden="true"
      fill="none"
      className="h-13 w-8 overflow-visible text-foreground"
    >
      <MascotFigure
        eyes={eyes}
        mouth={mouth}
        mouthFilled={mood === "amazing"}
      />
    </svg>
  );
}

export function CricketDoodle() {
  return (
    <svg
      viewBox="0 0 64 44"
      aria-hidden="true"
      className="h-12 w-17 overflow-visible"
    >
      <g
        fill="none"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M24 15 Q28 11 32 15" className="chirp stroke-(--brand)" />
        <path
          d="M20.5 11 Q28 4 35.5 11"
          className="chirp stroke-(--brand) [animation-delay:200ms]"
        />
        <path
          d="M47 19 Q52 8 60 6 M45 19 Q47 9 53 4"
          className="stroke-muted-foreground"
        />
        <path
          d="M24 28 L16 18 L10 32 M36 31 L34 37 M41 29 L43 36 M29 32 L27 38"
          className="stroke-muted-foreground"
        />
      </g>
      <ellipse
        cx="30"
        cy="26"
        rx="13"
        ry="6.5"
        strokeWidth="1.5"
        className="fill-(--brand)/15 stroke-(--brand)"
      />
      <path
        d="M20 24.5 Q30 20 42 25"
        fill="none"
        strokeWidth="1.2"
        strokeLinecap="round"
        className="stroke-(--brand)"
      />
      <circle
        cx="45"
        cy="23"
        r="4.5"
        strokeWidth="1.5"
        className="fill-(--brand)/15 stroke-(--brand)"
      />
      <circle cx="46.5" cy="22" r="0.9" className="fill-foreground" />
    </svg>
  );
}

export function TypingBubble() {
  return (
    <svg
      viewBox="0 0 40 30"
      aria-hidden="true"
      className="h-7.5 w-10 shrink-0 overflow-visible"
    >
      <path
        d="M6 3 H34 A4 4 0 0 1 38 7 V19 A4 4 0 0 1 34 23 H14 L8 28 V23 H6 A4 4 0 0 1 2 19 V7 A4 4 0 0 1 6 3 Z"
        strokeWidth="1.5"
        strokeLinejoin="round"
        className="fill-muted/60 stroke-muted-foreground/60"
      />
      {[12, 20, 28].map((cx, i) => (
        <circle
          key={cx}
          cx={cx}
          cy="13"
          r="2"
          className="typing-dot fill-(--brand)"
          style={{ animationDelay: `${i * 160}ms` }}
        />
      ))}
    </svg>
  );
}

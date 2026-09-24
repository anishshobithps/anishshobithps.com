import type { ReactNode } from "react";
import { LayersCover } from "./layers";
import {
  IsoBox,
  IsoDots,
  IsoFaceText,
  IsoFlow,
  IsoGuide,
  IsoLabel,
  IsoLift,
  IsoPath,
  IsoPlate,
  IsoRipple,
  IsoSvg,
  projector,
  type Vec3,
} from "./iso";

function Sheets() {
  const p = projector(17, 200, 190);
  const sheets = [
    { c: -2.6, z: 0, label: "Draft" },
    { c: 0, z: 2, label: "Edit" },
    { c: 2.6, z: 4, label: "Ship" },
  ];
  return (
    <>
      {sheets.map(({ c, z, label }, i) => {
        const top = i === sheets.length - 1;
        return (
          <IsoLift key={c} lift={-8} delay={i * 180}>
            <IsoBox
              p={p}
              at={[c - 2.3, -c - 3, z]}
              size={[4.6, 6, 0.18]}
              tone={top ? "accent" : "default"}
            />
            <IsoDots
              p={p}
              at={[c - 1.8, -c - 2.5, z + 0.18]}
              size={[3.6, 3]}
              step={0.34}
              shape="rows"
              lit={top ? 0.12 : 0}
              seed={i + 4}
            />
            <IsoFaceText
              p={p}
              plane="top"
              at={[c - 0.4, -c + 1.6, z + 0.18]}
              size={10}
              tone={top ? "accent" : "muted"}
            >
              {`0${i + 1} ${label}`}
            </IsoFaceText>
          </IsoLift>
        );
      })}
      <IsoLift lift={-8} delay={360}>
        <IsoBox p={p} at={[2.9, -3.9, 4.18]} size={[0.35, 0.35, 1.4]} tone="accent" />
        <IsoLabel p={p} at={[3.07, -3.72, 5.6]} dx={18} dy={-14} anchor="start" leader size={9} tone="accent">
          post.mdx
        </IsoLabel>
      </IsoLift>
    </>
  );
}

function Assembly() {
  const p = projector(18, 200, 186);
  return (
    <>
      <IsoPlate p={p} at={[-4, -4, 0]} size={[8, 8]} />
      <IsoBox p={p} at={[-3.6, -3.6, 0]} size={[3, 3, 3]} />
      <IsoFaceText p={p} plane="top" at={[-2.1, -2.1, 3]} size={11}>
        API
      </IsoFaceText>
      <IsoPlate p={p} at={[0.6, -3.6, 0]} size={[3, 3]} />
      <IsoBox p={p} at={[-3.6, 0.6, 0]} size={[3, 3, 1.8]} />
      <IsoFaceText p={p} plane="top" at={[-2.1, 2.1, 1.8]} size={11}>
        UI
      </IsoFaceText>
      <IsoFaceText p={p} plane="left" at={[-2.1, 3.6, 0.9]} size={8} tone="muted">
        React
      </IsoFaceText>
      <IsoBox p={p} at={[0.6, 0.6, 0]} size={[3, 3, 2.4]} />
      <IsoFaceText p={p} plane="top" at={[2.1, 2.1, 2.4]} size={11}>
        CLI
      </IsoFaceText>
      <IsoFaceText p={p} plane="left" at={[2.1, 3.6, 1.2]} size={8} tone="muted">
        Bun
      </IsoFaceText>
      <IsoFaceText p={p} plane="right" at={[3.6, 2.1, 1.2]} size={8} tone="muted">
        Tools
      </IsoFaceText>
      {[
        [0.6, -3.6],
        [3.6, -3.6],
        [3.6, -0.6],
        [0.6, -0.6],
      ].map(([x, y]) => (
        <IsoGuide key={`${x}${y}`} p={p} from={[x, y, 0]} to={[x, y, 3.6]} />
      ))}
      <IsoLift lift={-10} delay={120}>
        <IsoBox p={p} at={[0.6, -3.6, 3.6]} size={[3, 3, 2]} tone="accent" />
        <IsoDots p={p} at={[0.9, -3.3, 5.6]} size={[2.4, 2.4]} step={0.34} shape="circle" lit={0.35} seed={8} />
        <IsoFaceText p={p} plane="left" at={[2.1, -0.6, 4.6]} size={9} tone="accent">
          Bot
        </IsoFaceText>
        <IsoLabel p={p} at={[3.6, -3.6, 5.6]} dx={20} dy={-16} anchor="start" leader size={9} tone="accent">
          Shipping
        </IsoLabel>
      </IsoLift>
    </>
  );
}

function Notes() {
  const p = projector(16, 200, 168);
  const notes: { at: Vec3; text: string; accent?: boolean }[] = [
    { at: [-4, -1, 0.7], text: "gg" },
    { at: [-0.5, -4.2, 1.6], text: "hi!" },
    { at: [-0.4, 2.2, 3.2], text: "new", accent: true },
    { at: [3.2, -0.8, 2.4], text: "<3" },
    { at: [3.4, 3.2, 1], text: "yo" },
  ];
  return (
    <>
      <IsoPlate p={p} at={[-5.8, -6, 0]} size={[10.8, 10.8]} />
      {notes.map(({ at: [x, y, z], text, accent }, i) => (
        <IsoLift key={`${x}${y}`} lift={accent ? -10 : -6} delay={i * 140}>
          <IsoBox p={p} at={[x - 1.4, y - 1.4, z]} size={[2.8, 2.8, 0.2]} tone={accent ? "accent" : "default"} />
          <IsoDots
            p={p}
            at={[x - 1.15, y - 1.15, z + 0.2]}
            size={[0.9, 0.9]}
            step={0.3}
            shape="circle"
            lit={accent ? 0.6 : 0}
            seed={i + 20}
          />
          <IsoFaceText p={p} plane="top" at={[x + 0.3, y + 0.35, z + 0.2]} size={11} tone={accent ? "accent" : "default"}>
            {text}
          </IsoFaceText>
          {accent && <IsoRipple p={p} center={[x, y, z + 0.2]} radius={1.3} />}
        </IsoLift>
      ))}
      <IsoFlow p={p} points={[[-6.5, 6.5, 0.4], [-3.6, 4.6, 2], [-1.9, 3.2, 3.3]]} tone="accent" />
      <IsoLabel p={p} at={[-6.5, 6.5, 0.4]} dy={12} size={9} tone="accent">
        You?
      </IsoLabel>
    </>
  );
}

function Padlock() {
  const p = projector(18, 200, 176);
  const shackle = (y: number): Vec3[] => {
    const arc: Vec3[] = Array.from({ length: 13 }, (_, i) => {
      const a = (i / 12) * Math.PI;
      return [1.1 * Math.cos(a), y, 3.4 + 1.1 * Math.sin(a)];
    });
    return [[1.1, y, 2.4], ...arc, [-1.1, y, 2.4]];
  };
  const data = [
    { at: [-3.6, -3.6], label: "Email", dx: -34, dy: -4 },
    { at: [3, -3.6], label: "Name", dx: 0, dy: -14 },
    { at: [-3.6, 3], label: "IP", dx: 0, dy: -14 },
  ] as const;
  return (
    <>
      <IsoPlate p={p} at={[-4.5, -4.5, 0]} size={[9, 9]} />
      <IsoFaceText p={p} plane="top" at={[2.3, 3.3, 0]} size={9} tone="muted">
        No trackers
      </IsoFaceText>
      <IsoRipple p={p} center={[0, 0, 0]} radius={3} />
      {data.map(({ at: [x, y], label, dx, dy }, i) => (
        <IsoLift key={label} lift={-4} delay={i * 200 + 200}>
          <IsoBox p={p} at={[x, y, 0]} size={[0.8, 0.8, 0.8]} tone="ghost" />
          <IsoLabel p={p} at={[x + 0.4, y + 0.4, 0.8]} dx={dx} dy={dy} size={8}>
            {label}
          </IsoLabel>
        </IsoLift>
      ))}
      <IsoLift lift={-8}>
        <IsoBox p={p} at={[-1.8, -0.7, 0]} size={[3.6, 1.4, 2.4]} tone="accent" />
        <IsoDots p={p} at={[-1.4, -0.4, 2.4]} size={[2.8, 0.8]} step={0.35} lit={0.3} seed={31} />
        <IsoFaceText p={p} plane="left" at={[0, 0.7, 1.4]} size={9} tone="accent">
          Private
        </IsoFaceText>
        <IsoFaceText p={p} plane="left" at={[0, 0.7, 0.6]} size={6} tone="muted">
          Clerk · Neon
        </IsoFaceText>
        <IsoPath p={p} points={shackle(-0.2)} />
        <IsoPath p={p} points={shackle(0.2)} tone="accent" />
      </IsoLift>
    </>
  );
}

function Swatches() {
  const p = projector(16, 200, 206);
  const swatches: { t: number; h: number; label: string; tone: "default" | "accent" | "ghost" }[] = [
    { t: -3.3, h: 5, label: "Aa", tone: "default" },
    { t: -1.1, h: 6.2, label: "Logo", tone: "accent" },
    { t: 1.1, h: 4.4, label: "OG", tone: "ghost" },
    { t: 3.3, h: 5.4, label: "#hex", tone: "default" },
  ];
  return (
    <>
      <IsoPlate p={p} at={[-5.2, -5.2, 0]} size={[10.4, 10.4]} />
      {swatches.map(({ t, h, label, tone }, i) => (
        <IsoLift key={t} lift={-8} delay={i * 150}>
          <IsoBox p={p} at={[t - 1.3, -t - 0.2, 0]} size={[2.6, 0.4, h]} tone={tone} />
          <IsoFaceText
            p={p}
            plane="left"
            at={[t, -t + 0.2, h - 1]}
            size={label === "Aa" ? 14 : 9}
            keepCase={label === "Aa"}
            tone={tone === "accent" ? "accent" : tone === "ghost" ? "muted" : "default"}
          >
            {label}
          </IsoFaceText>
        </IsoLift>
      ))}
      <IsoLift lift={-12} delay={300}>
        <IsoDots p={p} at={[-2.3, -0.1, 8]} size={[2.4, 2.4]} step={0.3} shape="circle" lit={0.4} seed={41} />
      </IsoLift>
    </>
  );
}

function Envelope() {
  const p = projector(18, 150, 196);
  const top = 0.5;
  return (
    <>
      <IsoLift lift={-6}>
        <IsoBox p={p} at={[-2.4, -1.6, 0]} size={[4.8, 3.2, top]} />
        <IsoPath
          p={p}
          points={[
            [-2.4, -1.6, top],
            [0, 0.4, top],
            [2.4, -1.6, top],
          ]}
          tone="accent"
        />
        <IsoFaceText p={p} plane="top" at={[0, 1.05, top]} size={9} tone="muted">
          Hello
        </IsoFaceText>
      </IsoLift>
      <IsoFlow
        p={p}
        points={[
          [1.2, -2.4, 1.2],
          [2.8, -4.4, 2.6],
          [4.6, -6.2, 3.6],
        ]}
        tone="accent"
      />
      <IsoLabel p={p} at={[2.8, -4.4, 2.6]} dx={-6} dy={-12} anchor="end" size={9} tone="accent">
        Say hi
      </IsoLabel>
      <IsoLift lift={-10} delay={200}>
        <IsoBox p={p} at={[5, -8, 3.4]} size={[1.8, 1.8, 1]} tone="accent" />
        <IsoDots p={p} at={[5.2, -7.8, 4.4]} size={[1.4, 1.4]} step={0.3} shape="circle" lit={0.5} seed={51} />
        <IsoRipple p={p} center={[5.9, -7.1, 4.4]} radius={0.9} />
        <IsoLabel p={p} at={[5.9, -7.1, 4.4]} dy={-26} size={9} tone="default">
          Inbox
        </IsoLabel>
      </IsoLift>
    </>
  );
}

const scenes = {
  blogs: Sheets,
  projects: Assembly,
  guestbook: Notes,
  resume: LayersCover,
  privacy: Padlock,
  branding: Swatches,
  contact: Envelope,
} satisfies Record<string, () => ReactNode>;

const viewBoxes: Partial<Record<keyof typeof scenes, string>> = {
  resume: "40 0 320 240",
};

export function PageArt({ name }: { name: keyof typeof scenes }) {
  const Scene = scenes[name];
  return (
    <IsoSvg viewBox={viewBoxes[name] ?? "0 0 400 300"}>
      <Scene />
    </IsoSvg>
  );
}

import type { ReactNode } from "react";
import {
  IsoBox,
  IsoCylinder,
  IsoDots,
  IsoFaceText,
  IsoFlow,
  IsoLabel,
  IsoLift,
  IsoRipple,
  IsoSvg,
  projector,
  type Vec3,
} from "./iso";
import { padIndex } from "@/lib/text";
import { LayersCover } from "./layers";

function AlertCover() {
  const p = projector(12, 200, 128);
  return (
    <>
      <IsoBox p={p} at={[-4.9, -8.1, 0]} size={[2, 2, 1.2]} tone="ghost" />
      <IsoFaceText p={p} plane="top" at={[-3.9, -7.1, 1.2]} size={6} tone="muted">
        Cloud
      </IsoFaceText>
      <IsoLabel p={p} at={[-4.9, -8.1, 1.2]} dy={-9} size={7}>
        Datacenter IP · 403
      </IsoLabel>

      <IsoBox p={p} at={[-7.2, 4.8, 0]} size={[2.4, 2.4, 4.2]} />
      <IsoDots p={p} at={[-7, 5, 4.2]} size={[2, 2]} step={0.4} shape="rows" lit={0} />
      <IsoFaceText p={p} plane="left" at={[-6, 7.2, 2.1]} size={8}>
        API
      </IsoFaceText>
      <IsoLabel p={p} at={[-4.8, 7.2, 0]} dy={12} size={7}>
        Public · no auth
      </IsoLabel>

      <IsoFlow p={p} points={[[-1.9, 1.9, 2.3], [-4.6, 4.6, 2.3]]} />
      <IsoLabel p={p} at={[-3.25, 3.25, 2.3]} dy={-8} size={7}>
        Poll 10-15s
      </IsoLabel>
      <IsoFlow p={p} points={[[-4.6, 4.6, 0.9], [-1.9, 1.9, 0.9]]} />
      <IsoLabel p={p} at={[-3.25, 3.25, 0.9]} dy={8} size={7}>
        200 · JSON
      </IsoLabel>

      <IsoLift lift={-4} delay={60}>
        <IsoBox p={p} at={[-1.8, -1.4, 0]} size={[3.6, 2.8, 0.35]} tone="accent" />
        <IsoDots p={p} at={[-1.5, -0.8, 0.35]} size={[3, 1.9]} step={0.38} lit={0.18} seed={3} />
        <IsoBox p={p} at={[-1.8, -1.4, 0.35]} size={[3.6, 0.28, 2.4]} tone="accent" />
        <IsoFaceText p={p} plane="left" at={[0, -1.12, 1.9]} size={7} tone="accent">
          Effect
        </IsoFaceText>
      </IsoLift>
      <IsoLabel p={p} at={[1.8, 1.4, 0]} dy={12} size={7}>
        Home machine
      </IsoLabel>

      <IsoFlow p={p} points={[[2.1, -2.1, 1.2], [4.7, -4.7, 1.2]]} tone="accent" />
      <IsoLabel p={p} at={[3.4, -3.4, 1.2]} dy={-8} size={7} tone="accent">
        Buy tickets
      </IsoLabel>

      <IsoLift lift={-8} delay={160}>
        <IsoCylinder p={p} center={[6, -6, 0]} radius={1.5} height={2.2} tone="accent" />
        <IsoDots p={p} at={[4.5, -7.5, 2.2]} size={[3, 3]} step={0.38} shape="circle" lit={0.35} seed={7} />
        <IsoRipple p={p} center={[6, -6, 2.2]} radius={1.5} />
        <IsoLabel p={p} at={[6, -6, 2.2]} dy={-26} size={7} tone="accent">
          Discord · @role
        </IsoLabel>
      </IsoLift>
    </>
  );
}

function GraphemeCover() {
  const p = projector(13, 234, 136);
  const tiles: { t: number; code: string; tone: "default" | "accent" }[] = [
    { t: -8.2, code: "1F469", tone: "default" },
    { t: -5.6, code: "1F3FB", tone: "default" },
    { t: -3, code: "200D", tone: "accent" },
    { t: -0.4, code: "1F4BB", tone: "default" },
  ];
  return (
    <>
      {tiles.map(({ t, code, tone }, i) => (
        <IsoLift key={t} lift={-8} delay={i * 70}>
          <IsoBox p={p} at={[t - 1, -t - 1, 0]} size={[2, 2, 1.1]} tone={tone} />
          <IsoFaceText p={p} plane="top" at={[t, -t, 1.1]} size={6.5} tone={tone}>
            {code}
          </IsoFaceText>
          <IsoLabel p={p} at={[t - 1, -t - 1, 1.1]} dy={-12} size={9} tone={tone}>
            {padIndex(i + 1)}
          </IsoLabel>
        </IsoLift>
      ))}
      {[-6.9, -4.3, -1.7].map((t) => (
        <IsoLabel key={t} p={p} at={[t, -t, 0.55]} size={9}>
          +
        </IsoLabel>
      ))}

      <IsoFlow p={p} points={[[1, -1, 0.55], [2.8, -2.8, 0.55]]} tone="accent" />
      <IsoLabel p={p} at={[1.9, -1.9, 0.55]} dy={-9} size={7} tone="accent">
        GSUB
      </IsoLabel>

      <IsoLift lift={-12} delay={320}>
        <IsoBox p={p} at={[3, -6.2, 0]} size={[3.2, 3.2, 1.3]} tone="accent" />
        <IsoDots p={p} at={[3.3, -5.9, 1.3]} size={[2.6, 2.6]} step={0.3} shape="circle" lit={0.3} seed={11} />
        <IsoLabel p={p} at={[4.6, -4.6, 1.3]} dy={-40} size={22}>
          👩🏻‍💻
        </IsoLabel>
      </IsoLift>
      <IsoLabel p={p} at={[6.2, -3, 0]} dy={12} size={7} tone="accent">
        1 grapheme
      </IsoLabel>
    </>
  );
}

function StairsCover() {
  const p = projector(12, 231, 160);
  const steps = [
    { t: -6, h: 1, label: "Games" },
    { t: -3, h: 2, label: "School" },
    { t: 0, h: 3, label: "Bots" },
    { t: 3, h: 4.2, label: "Uni" },
  ];
  const path: Vec3[] = steps.flatMap(({ t, h }, i) => {
    const next = steps[i + 1];
    const edge = t + 1.2;
    return next
      ? [
          [t, -t, h],
          [edge, -edge, h],
          [edge, -edge, next.h],
        ]
      : [[t, -t, h]];
  });
  return (
    <>
      {steps.map(({ t, h, label }, i) => {
        const last = i === steps.length - 1;
        return (
          <IsoLift key={t} lift={-6} delay={i * 70}>
            <IsoBox p={p} at={[t - 1.2, -t - 1.2, 0]} size={[2.4, 2.4, h]} tone={last ? "accent" : "default"} />
            <IsoFaceText p={p} plane="left" at={[t, -t + 1.2, Math.min(h / 2, 0.8)]} size={6} tone={last ? "accent" : "muted"}>
              {label}
            </IsoFaceText>
          </IsoLift>
        );
      })}

      <IsoLift lift={-6} delay={105}>
        <IsoFlow p={p} points={[...path, [3, -3, 5.9]]} tone="accent" />
      </IsoLift>

      <IsoLift lift={-12} delay={300}>
        <IsoDots p={p} at={[3.6, -6.6, 6.4]} size={[2.8, 2.8]} step={0.32} shape="circle" lit={0.4} seed={13} />
        <IsoLabel p={p} at={[5, -5, 6.4]} dy={-24} size={8} tone="accent">
          Now
        </IsoLabel>
      </IsoLift>
    </>
  );
}

function hashSlug(slug: string) {
  let h = 0;
  for (const ch of slug) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

function BlocksCover({ slug }: { slug: string }) {
  const p = projector(12, 200, 150);
  const seed = hashSlug(slug);
  const blocks = [-4.5, 0, 4.5].map((t, i) => ({ t, h: 1.5 + ((seed >>> (i * 3)) % 5) * 0.7 }));
  return (
    <>
      {blocks.map(({ t, h }, i) => (
        <IsoLift key={t} lift={-8} delay={i * 80}>
          <IsoBox p={p} at={[t - 1.4, -t - 1.4, 0]} size={[2.8, 2.8, h]} tone={i === 1 ? "accent" : "default"} />
          {i === 1 && (
            <IsoDots p={p} at={[t - 1.1, -t - 1.1, h]} size={[2.2, 2.2]} step={0.36} shape="circle" lit={0.35} seed={seed} />
          )}
        </IsoLift>
      ))}
    </>
  );
}

const covers: Record<string, () => ReactNode> = {
  "rcb-tickets-are-broken-so-i-built-an-alert-system-at-4am": AlertCover,
  "the-hidden-architecture-of-emoji": GraphemeCover,
  "making-my-resume-machine-readable": LayersCover,
  "i-never-thought-i-would-code-until-this-one-moment-changed-everything": StairsCover,
};

export function BlogCover({ slug, zoom = false }: { slug: string; zoom?: boolean }) {
  const Cover = covers[slug];
  return (
    <IsoSvg viewBox={zoom ? "40 -8 320 240" : "0 0 400 225"}>
      {Cover ? <Cover /> : <BlocksCover slug={slug} />}
    </IsoSvg>
  );
}

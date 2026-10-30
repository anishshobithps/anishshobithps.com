import { Figure, type Flat, k, pathOf, type Plan, type Projection, type Scene, type V3 } from "../figure";
import { alongY, arc, circleD, D, disc, face, G, L, S } from "../parts";
import * as T from "../tube";

const CLOCK: V3 = [-12, 0, 26];
const R = 15;
const PERIOD = 4;
const RING: [number, number] = [0.6, 1.9];

export function alertScene(width = 400, height = 225): Scene {
  const DESK: Plan = { x: -48, y: -24, w: 96, d: 50, r: 4 };
  const P = k.fitProjection([...k.boxCorners(DESK, -3, 0), [CLOCK[0], 0, CLOCK[2] + R + 14], [CLOCK[0] - R - 8, 0, CLOCK[2] + R]], width, height, { pad: 20, azimuth: 60 }) as Projection;
  const f = new Figure("alarm", P, PERIOD);
  const times = Array.from({ length: 161 }, (_, i) => (i / 160) * PERIOD);
  const ringing = (t: number) => t >= RING[0] && t <= RING[1];

  f.add(f.halo(DESK, -3, 6));
  f.add(S(k.slabOf(DESK, -3, 3, P, 4, 0.5), { tone: "lo", inner: L(k.planOutline(k.insetPlan(DESK, 4), 0, P, 4), { tone: "faint" }) }));

  const BODY = alongY(CLOCK);
  for (const side of [-1, 1]) {
    const foot: V3 = [CLOCK[0] + side * 9, -1, 2.2];
    f.add(
      T.tubePieces([[CLOCK[0] + side * 6.6, 0, CLOCK[2] - R + 2.4], [foot[0], foot[1], foot[2] + 1.6]] as V3[], 0.8, P, { maxLength: 400 })
        .map((piece) => T.tubeSvg(piece, { tone: "mid" }))
        .join(""),
    );
    f.add(S(G.sphereOf(foot, 2.2, P), { tone: "mid" }));
  }
  const bell = (side: number) => {
    const a = side * 0.62;
    const base: V3 = [CLOCK[0] + Math.sin(a) * (R - 1), 0, CLOCK[2] + Math.cos(a) * (R - 1)];
    const F = G.frameAlong(base, [Math.sin(a), 0, Math.cos(a)]);
    f.add(S(G.disc(0, 3, 0.8, F, P), { tone: "mid" }));
    f.add(S(G.solidOf([[3, 8.2, 1], [5, 7.6, 1], [7, 6.2, 1], [8.6, 4, 1], [9.6, 1.6, 1], [9.9, 0, 1]], F, P), { tone: "hi", crease: "lo", inner: L(arc(P, F, 4, 7.9, { slope: -0.25 }), { tone: "faint" }) }));
  };
  bell(-1);
  const handle = T.tubePieces(G.fillet([[CLOCK[0] - 9, -0.5, CLOCK[2] + 9], [CLOCK[0] - 9, -0.5, CLOCK[2] + R + 11], [CLOCK[0] + 9, -0.5, CLOCK[2] + R + 11], [CLOCK[0] + 9, -0.5, CLOCK[2] + 9]] as V3[], 8, 10) as V3[], 1, P, { maxLength: 400 })
    .map((piece) => T.tubeSvg(piece, { tone: "mid" }))
    .join("");
  f.add(handle);
  f.add(S(disc(P, BODY, -5, 3.4, R), { tone: "mid", crease: "lo", inner: L(arc(P, BODY, -1, R), { tone: "faint" }) }));
  f.add(S(G.ringBand(3.4, 4.6, R - 2, R + 0.4, BODY, P), { tone: "hi", crease: "lo" }));

  const dial = f.sidePlane([CLOCK[0], 4.6], CLOCK[2], "left");
  const ticks = Array.from({ length: 60 }, (_, i) => {
    const a = (i / 60) * Math.PI * 2;
    const r0 = i % 5 ? R - 3.6 : R - 5.2;
    return pathOf([[Math.sin(a) * r0, -Math.cos(a) * r0], [Math.sin(a) * (R - 2.8), -Math.cos(a) * (R - 2.8)]]);
  }).join("");
  f.add(f.inPlane(dial, face(circleD(0, 0, R - 2, 64), "top", "lo") + L(ticks, { tone: "mid" })));
  const hand = (len: number, w: number, angle: number) => `<g transform="rotate(${((angle * 180) / Math.PI).toFixed(1)})">${face(`M${-w} 2L0 ${-len}L${w} 2z`, "top", "hi")}</g>`;
  f.add(f.inPlane(dial, hand(7.5, 1.1, (4 / 12) * Math.PI * 2) + hand(11, 0.8, 0)));
  const sweep = f.spinOf("second", Array.from({ length: 61 }, (_, i) => ({ t: i, angle: (i / 60) * Math.PI * 2 })), { period: 60, tolerance: 0.5 });
  f.add(f.inPlane(dial, `${L("M0 3L0 -11.8", { tone: "lit" })}${face(circleD(0, 0, 1, 12), "lit", "lit")}`, sweep));
  f.add(f.inPlane(dial, `<g transform="rotate(120)">${L("M0 0L0 -5.4", { tone: "lit" })}${face(circleD(0, -5.4, 0.7, 10), "lit", "none")}</g>`));

  const shake = f.spinOf(
    "hammer",
    times.map((t) => ({ t, angle: ringing(t) ? Math.sin((t - RING[0]) * Math.PI * 2 * 11) * 0.35 : 0 })),
    { tolerance: 0.5 },
  );
  const stalk = f.sidePlane([CLOCK[0], 0.2], CLOCK[2] + R - 1, "left");
  f.add(f.inPlane(stalk, L("M0 0L0 -8.4", { tone: "hi" }) + face(circleD(0, -9.4, 1.4, 14), "top", "hi"), shake));
  bell(1);

  const PHONE: Plan = { x: 14, y: -10, w: 18, d: 32, r: 3 };
  f.add(S(k.slabOf(PHONE, 0, 1.6, P, 4, 0.4), { tone: "mid" }));
  const screen = f.topPlane([PHONE.x + 1.4, PHONE.y + 3], 1.6);
  f.add(f.inPlane(screen, face("M0 0h15.2v26h-15.2z", "0", "lo")));
  const lit = f.switchOf("screen", times.map((t) => ({ t, on: t >= RING[0] && t <= RING[1] + 1.2 })));
  f.add(`<g ${lit} opacity="0">${f.inPlane(screen, face("M0 0h15.2v26h-15.2z", "sheet", "lit") + face("M1.6 3h12v7.4h-12z", "lit", "lit") + L("M3.2 5.4h6M3.2 7.8h8.6", { tone: "lo" }) + face(circleD(7.6, 21, 2.4, 16), "lit", "lit"))}</g>`);
  f.add(D([f.at([PHONE.x + 9, PHONE.y + 1.6, 1.6])], { size: 0.5, tone: "mid" }));

  const TICKET: Flat = [-22, 14];
  const ticket = f.topPlane(TICKET, 0.3);
  f.add(S(k.slabOf({ x: TICKET[0], y: TICKET[1], w: 26, d: 9, r: 0.6 }, 0, 0.3, P, 2), { tone: "lo", crease: "none", card: true }));
  f.add(f.inPlane(ticket, face("M0 0h4v9h-4z", "lit", "none") + D(Array.from({ length: 7 }, (_, i) => [19, 1 + i * 1.2] as Flat), { size: 0.3, tone: "lo" }) + L("M6.4 3h9M6.4 5.6h6", { tone: "lo" })));

  return f.build({
    width,
    height,
    label: "A twin-bell alarm clock stopped at four o'clock rings in bursts while a phone beside it lights up with a notification; a match ticket lies in front.",
  });
}

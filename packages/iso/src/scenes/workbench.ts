import { Figure, type Flat, k, type Plan, type Projection, type Scene, smoothstep, type V3 } from "../figure";
import { alongY, circleD, D, disc, face, G, gearD, L, S, screwsOnTop } from "../parts";
import * as T from "../tube";

const PERIOD = 8;
const TRAVEL = 6.6;
const X0 = -118;
const X1 = 118;
const BELT = 2;
const STATION = [-62, 0, 64] as const;
const BODY = { w: 18, d: 15, h: 13 };
const TOP = BELT + BODY.h;
const PHASES = [0, PERIOD / 2];
const BELT_SHIFT = 286;
const BELT_PITCH = BELT_SHIFT / 26;
const REACH = 12;

const local = (t: number, phase: number) => (((t - phase) % PERIOD) + PERIOD) % PERIOD;
const xAt = (u: number) => X0 + ((X1 - X0) * Math.min(u, TRAVEL)) / TRAVEL;
const live = (u: number) => u <= TRAVEL;

function near(t: number, at: number) {
  return Math.max(
    ...PHASES.map((phase) => {
      const u = local(t, phase);
      const d = Math.abs(xAt(u) - at);
      return live(u) && d < REACH ? (1 + Math.cos((Math.PI * d) / REACH)) / 2 : 0;
    }),
  );
}

export function workbenchScene(width = 960, height = 230): Scene {
  const TABLE: Plan = { x: -150, y: -20, w: 300, d: 40, r: 3 };
  const P = k.fitProjection([...k.boxCorners(TABLE, -10, 0), [-62, 0, 52], [64, 0, 53], [-138, 0, 36], [138, 0, 36]], width, height, { pad: 16, azimuth: 76 }) as Projection;
  const f = new Figure("bench", P, PERIOD);
  const times = Array.from({ length: 161 }, (_, i) => (i / 160) * PERIOD);

  const tube = (points: V3[], r: number) =>
    T.tubePieces(points, r, P, { maxLength: 400 })
      .map((piece) => T.tubeSvg(piece, { tone: "mid" }))
      .join("");
  const post = (x: number, y: number, h: number) => S(k.slabOf({ x: x - 2.6, y: y - 2.6, w: 5.2, d: 5.2, r: 0.8 }, 0, h, P, 2, 0.3), { tone: "mid", crease: "lo" });
  const lamp = (at: V3) => S(G.sphereOf(at, 2.2, P), { tone: "hi", lit: true });

  f.add(f.halo(TABLE, -10, 6));
  f.add(S(k.slabOf(TABLE, -10, 10, P, 3, 0.6), { tone: "mid", inner: L(k.sideSeam(TABLE, -5, P, 3), { tone: "faint" }) }));
  f.add(screwsOnTop(P, k.corners(TABLE, 4) as Flat[], 0, 1));

  const BED: Plan = { x: -128, y: -12, w: 256, d: 24, r: 2 };
  f.add(S(k.slabOf(BED, 0, BELT, P, 3, 0.4), { tone: "lo", crease: "none" }));
  f.defs.push(`<clipPath id="bench-belt"><path d="${k.planOutline(BED, BELT, P, 3)}"/></clipPath>`);
  const ticks = Array.from({ length: 48 }, (_, i) => BED.x - BELT_SHIFT + i * BELT_PITCH + 6)
    .filter((x) => x < BED.x + BED.w)
    .map((x) => L(k.lineOnTop([x, BED.y + 1.4], [x, BED.y + BED.d - 1.4], BELT, P), { tone: "faint" }))
    .join("");
  const crawl = f.moveOf("belt", [
    { t: 0, by: [0, 0, 0] },
    { t: PERIOD, by: [BELT_SHIFT, 0, 0] },
  ]);
  f.add(`<g clip-path="url(#bench-belt)"><g ${crawl}>${ticks}</g></g>`);

  const S1 = STATION[0];
  const S2 = STATION[1];
  const S3 = STATION[2];

  for (const x of [S1, S2]) f.add(post(x, -16, 40));
  for (const x of [S3 - 10, S3 + 10]) f.add(post(x, -15, 34));
  f.add(S(k.slabOf({ x: S2 - 1.6, y: -16, w: 3.2, d: 7, r: 0.4 }, 25.4, 3.2, P, 2), { tone: "mid", crease: "none" }));
  const HOPPER: Plan = { x: S3 - 14, y: -18, w: 28, d: 16, r: 1.2 };
  f.add(S(k.slabOf(HOPPER, 34, 17, P, 3, 0.5), { tone: "mid", inner: L(k.sideSeam(HOPPER, 42, P, 3), { tone: "faint" }) }));
  f.add(tube([[S3, -10, 34], [S3, -10, 22]] as V3[], 1.4));
  const hopperFace = f.sidePlane([HOPPER.x, HOPPER.y + HOPPER.d], 51, "left");
  const feed = f.switchOf("feed", times.map((t) => ({ t, on: near(t, S3) > 0.15 })));
  f.add(f.inPlane(hopperFace, face("M3 4h22v10h-22z", "2", "lo") + face("M5 7h8v2h-8zM5 10.4h12v2h-12z", "3", "none")));
  f.add(`<g ${feed} opacity="0">${f.inPlane(hopperFace, face("M19.4 6h4.2v4.2h-4.2z", "lit", "lit"))}</g>`);

  const MILL: V3 = [S2, -11, 27];
  f.add(S(disc(P, alongY(MILL), 0, 3.6, 8.4), { tone: "mid", crease: "lo" }));
  const turn = f.spinOf("mill", times.map((t) => ({ t, angle: (t / PERIOD) * Math.PI * 6 })), { tolerance: 0.5 });
  f.add(f.inPlane(f.sidePlane([S2, -7.4], 27, "left"), L(gearD(0, 0, 8, 10, 1.7), { tone: "hi" }) + face(circleD(0, 0, 2, 12), "top", "hi") + L("M0 0L0 -5.6", { tone: "mid" }), turn));

  const item = (phase: number, index: number) => {
    const body: Plan = { x: -BODY.w / 2, y: -BODY.d / 2, w: BODY.w, d: BODY.d, r: 1.4 };
    const at = (t: number) => xAt(local(t, phase));
    const ride = f.moveOf(`ride${index}`, times.map((t) => ({ t, by: [at(t), 0, 0] as V3 })));
    const alive = f.switchOf(`live${index}`, times.map((t) => ({ t, on: live(local(t, phase)) })));
    const given = (name: string, from: number) => f.switchOf(`${name}${index}`, times.map((t) => ({ t, on: at(t) > from + 3 })));
    const eyes = given("eyes", S1);
    const cog = given("cog", S2);
    const mast = given("mast", S3);

    const front = f.sidePlane([body.x, body.y + body.d], TOP, "left");
    const pill = (x: number) => `M${x} 3.8h2.8a1.2 1.2 0 0 1 0 2.4h-2.8a1.2 1.2 0 0 1 0-2.4z`;
    const cap = f.topPlane([body.x + 3, body.y + 3], TOP);
    return `<g ${alive}${index ? ' opacity="0"' : ""}><g ${ride} style="${f.translateCss([90, 0, 0])}">${[
      S(k.slabOf(body, BELT, BODY.h, P, 3, 0.5), { tone: "hi", crease: "lo", inner: L(k.sideSeam(body, BELT + 5, P, 3), { tone: "faint" }) }),
      `<g ${eyes}>${f.inPlane(front, face(pill(3) + pill(10.6), "lit", "lit"))}</g>`,
      `<g ${cog}>${f.inPlane(cap, face(gearD(4.5, 4.5, 4.4, 8, 1), "top", "hi"))}</g>`,
      `<g ${mast}>${tube([[2.4, 1.4, TOP], [2.4, 1.4, TOP + 9]] as V3[], 0.8)}${S(G.sphereOf([2.4, 1.4, TOP + 10.4], 2, P), { tone: "hi", lit: true })}</g>`,
    ].join("")}</g></g>`;
  };

  f.add(item(0, 0), item(PERIOD / 2, 1));

  for (const x of [S1, S2]) f.add(post(x, 16, 40));
  const head = f.moveOf("head", times.map((t) => ({ t, by: [0, 0, -9 * smoothstep(near(t, S1))] as V3 })));
  f.add(`<g ${head}>${S(k.slabOf({ x: S1 - 3.6, y: -5, w: 7.2, d: 10, r: 1 }, 26, 8, P, 2, 0.3), { tone: "hi", crease: "lo" })}${L(k.lineOnTop([S1 - 1.4, 0], [S1 + 1.4, 0], 34, P), { tone: "lo" })}</g>`);
  f.add(S(k.slabOf({ x: S1 - 3.6, y: -18.6, w: 7.2, d: 37.2, r: 0.8 }, 40, 5, P, 2, 0.3), { tone: "mid" }));
  const print = f.switchOf("print", times.map((t) => ({ t, on: near(t, S1) > 0.15 })));
  f.add(S(G.sphereOf([S1, 10, 47.4], 2.2, P), { tone: "mid" }));
  f.add(`<g ${print} opacity="0">${lamp([S1, 10, 47.4])}</g>`);
  for (const x of [S3 - 10, S3 + 10]) f.add(post(x, 15, 34));

  const IN: Plan = { x: -152, y: -14, w: 28, d: 28, r: 1.8 };
  f.add(S(k.slabOf(IN, 0, 34, P, 3, 0.6), { tone: "mid", inner: L(k.sideSeam(IN, 17, P, 3), { tone: "faint" }) }));
  f.add(f.inPlane(f.sidePlane([IN.x, IN.y + IN.d], 34, "left"), face("M3 4h5v3h-5z", "lit", "lit") + L("M3 11h20M3 15h14M3 19h18", { tone: "lo" })));
  const OUT: Plan = { x: 124, y: -14, w: 28, d: 28, r: 1.8 };
  f.add(S(k.slabOf(OUT, 0, 34, P, 3, 0.6), { tone: "mid", inner: L(k.sideSeam(OUT, 17, P, 3), { tone: "faint" }) }));
  f.add(f.inPlane(f.sidePlane([OUT.x, OUT.y + OUT.d], 34, "left"), face("M3 4h5v3h-5z", "lit", "lit") + L("M3 11h20M3 15h14M3 19h18", { tone: "lo" })));
  f.add(D([f.at([IN.x + 14, IN.y + IN.d, 31]), f.at([OUT.x + 14, OUT.y + OUT.d, 31])], { size: 0.5, tone: "mid" }));

  return f.build({
    width,
    height,
    label: "A small assembly line: a blank box rides a conveyor, gets two glowing eyes from a printing gantry, a spinning gear from a mill and an antenna from a hopper, and rolls out the far end as a little bot.",
  });
}

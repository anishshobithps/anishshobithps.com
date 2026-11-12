import { launch } from "chrome-launcher";
import lighthouse, { type Result, type SharedFlagsSettings } from "lighthouse";
import { readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";

type ProfileName = "scan" | "psi";

const PROFILES: Record<ProfileName, NonNullable<SharedFlagsSettings["throttling"]>> = {
  scan: {
    rttMs: 150,
    throughputKbps: 1638.4,
    requestLatencyMs: 600,
    downloadThroughputKbps: 1638.4,
    uploadThroughputKbps: 750,
    cpuSlowdownMultiplier: 1,
  },
  psi: {
    rttMs: 150,
    throughputKbps: 1638.4,
    requestLatencyMs: 562.5,
    downloadThroughputKbps: 1474.56,
    uploadThroughputKbps: 675,
    cpuSlowdownMultiplier: 4,
  },
};

interface Sample {
  score: number;
  lcp: number;
  fcp: number;
  si: number;
  tbt: number;
  cls: number;
  ttfb: number;
  kbBeforeLcp: number;
  kbTotal: number;
}

const BASE_PATHS = [
  "/",
  "/blogs",
  "/projects",
  "/resume",
  "/guestbook",
  "/branding",
  "/privacy-policy",
];

const { values } = parseArgs({
  options: {
    base: { type: "string", default: "https://anishshobithps.com" },
    runs: { type: "string", default: "5" },
    profile: { type: "string", default: "both" },
    path: { type: "string", multiple: true },
    min: { type: "string" },
    out: { type: "string" },
  },
});

const base = values.base.replace(/\/$/, "");
const runs = Math.max(1, Number.parseInt(values.runs, 10) || 5);
const minScore = values.min === undefined ? null : Number(values.min);
const profiles: ProfileName[] =
  values.profile === "scan" || values.profile === "psi"
    ? [values.profile]
    : ["scan", "psi"];

function blogPaths(): string[] {
  const dir = join(import.meta.dirname, "../../apps/web/content/blog");
  return readdirSync(dir)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => `/blog/${file.replace(/\.mdx$/, "")}`);
}

const paths = values.path?.length ? values.path : [...BASE_PATHS, ...blogPaths()];

function median(list: number[]): number {
  const sorted = [...list].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[mid]!
    : (sorted[mid - 1]! + sorted[mid]!) / 2;
}

function toSample(lhr: Result): Sample {
  const audit = (id: string) => lhr.audits[id]?.numericValue ?? 0;
  const metrics = lhr.audits.metrics?.details as
    | { items?: Array<Record<string, number>> }
    | undefined;
  const observedLcp = metrics?.items?.[0]?.observedLargestContentfulPaint;
  const requests =
    (
      lhr.audits["network-requests"]?.details as
        | {
            items?: Array<{
              transferSize?: number;
              networkRequestTime?: number;
            }>;
          }
        | undefined
    )?.items ?? [];
  const kb = (bytes: number) => bytes / 1024;
  const total = requests.reduce((sum, r) => sum + (r.transferSize ?? 0), 0);
  const before = requests.reduce(
    (sum, r) =>
      observedLcp === undefined ||
      (r.networkRequestTime ?? 0) <= observedLcp
        ? sum + (r.transferSize ?? 0)
        : sum,
    0,
  );

  return {
    score: Math.round((lhr.categories.performance?.score ?? 0) * 100),
    lcp: audit("largest-contentful-paint"),
    fcp: audit("first-contentful-paint"),
    si: audit("speed-index"),
    tbt: audit("total-blocking-time"),
    cls: audit("cumulative-layout-shift"),
    ttfb: audit("server-response-time"),
    kbBeforeLcp: kb(before),
    kbTotal: kb(total),
  };
}

function summarise(samples: Sample[]) {
  const pick = (key: keyof Sample) => median(samples.map((s) => s[key]));
  const scores = samples.map((s) => s.score);
  return {
    score: pick("score"),
    min: Math.min(...scores),
    max: Math.max(...scores),
    lcp: pick("lcp"),
    fcp: pick("fcp"),
    si: pick("si"),
    tbt: pick("tbt"),
    cls: pick("cls"),
    ttfb: pick("ttfb"),
    kbBeforeLcp: pick("kbBeforeLcp"),
    kbTotal: pick("kbTotal"),
  };
}

type Summary = ReturnType<typeof summarise>;

function seconds(ms: number): string {
  return `${(ms / 1000).toFixed(1)}s`;
}

function row(path: string, s: Summary): string {
  return [
    path.slice(0, 44).padEnd(44),
    `${s.score}`.padStart(4),
    `${s.min}-${s.max}`.padStart(8),
    seconds(s.lcp).padStart(6),
    seconds(s.fcp).padStart(6),
    seconds(s.si).padStart(6),
    `${Math.round(s.tbt)}ms`.padStart(7),
    s.cls.toFixed(3).padStart(6),
    `${Math.round(s.ttfb)}ms`.padStart(7),
    `${Math.round(s.kbBeforeLcp)}k`.padStart(7),
    `${Math.round(s.kbTotal)}k`.padStart(7),
  ].join(" ");
}

const header = [
  "page".padEnd(44),
  "perf".padStart(4),
  "range".padStart(8),
  "LCP".padStart(6),
  "FCP".padStart(6),
  "SI".padStart(6),
  "TBT".padStart(7),
  "CLS".padStart(6),
  "TTFB".padStart(7),
  "<LCP".padStart(7),
  "total".padStart(7),
].join(" ");

const chrome = await launch({
  chromeFlags: ["--headless=new", "--disable-gpu"],
});

const report: Record<string, Record<string, Summary>> = {};
let failed = false;

try {
  for (const profile of profiles) {
    console.log(`\nprofile ${profile} (cpu ${PROFILES[profile].cpuSlowdownMultiplier}x), ${runs} runs, ${base}`);
    console.log(header);
    report[profile] = {};

    for (const path of paths) {
      const samples: Sample[] = [];
      for (let i = 0; i < runs; i++) {
        const result = await lighthouse(`${base}${path}`, {
          port: chrome.port,
          output: "json",
          logLevel: "error",
          onlyCategories: ["performance"],
          formFactor: "mobile",
          throttlingMethod: "simulate",
          throttling: PROFILES[profile],
        });
        if (result?.lhr) samples.push(toSample(result.lhr));
      }
      if (samples.length === 0) {
        console.log(`${path.padEnd(44)} no result`);
        failed = true;
        continue;
      }
      const summary = summarise(samples);
      report[profile]![path] = summary;
      console.log(row(path, summary));
      if (minScore !== null && summary.score < minScore) failed = true;
    }
  }
} finally {
  await chrome.kill();
}

if (values.out) writeFileSync(values.out, JSON.stringify(report, null, 2));
if (failed) process.exit(1);

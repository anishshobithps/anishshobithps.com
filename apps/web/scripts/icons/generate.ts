import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import { Fragment, type ReactElement } from "react";

const root = join(__dirname, "../../../..");
const require = createRequire(__filename);
const phosphor = dirname(require.resolve("@phosphor-icons/react/package.json"));

const BASE_WEIGHTS = ["regular", "fill"] as const;
const EXTRA_WEIGHTS = ["bold", "duotone"] as const;

const indexSource = readFileSync(join(root, "packages/icons/src/index.tsx"), "utf8");
const names = [...indexSource.matchAll(/^\s+([A-Za-z0-9]+Icon),$/gm)].map((m) => m[1]!);

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    if (entry === "node_modules" || entry === ".next" || entry === "icons") return [];
    const path = join(dir, entry);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const sources = [join(root, "apps/web/src"), ...readdirSync(join(root, "packages")).map((p) => join(root, "packages", p, "src"))]
  .flatMap((dir) => {
    try {
      return walk(dir);
    } catch {
      return [];
    }
  })
  .filter((file) => /\.tsx?$/.test(file) && !file.includes("icons.generated"))
  .map((file) => readFileSync(file, "utf8"));

const weightedSources = sources.filter((text) => /\bweight\b\s*[=:]/.test(text));
const lightOrThin = sources.some((text) => /weight\s*[=:]\s*\{?\s*["'](thin|light)["']/.test(text));
if (lightOrThin) throw new Error("thin or light weights are used; extend the generator");

function weightsFor(name: string): string[] {
  const usedWithWeight = weightedSources.some((text) => text.includes(name));
  return usedWithWeight ? [...BASE_WEIGHTS, ...EXTRA_WEIGHTS] : [...BASE_WEIGHTS];
}

type Node = [string, Record<string, string>];

function shapes(element: ReactElement): Node[] {
  const out: Node[] = [];
  const visit = (node: unknown) => {
    if (Array.isArray(node)) return node.forEach(visit);
    if (!node || typeof node !== "object") return;
    const el = node as ReactElement<{ children?: unknown } & Record<string, string>>;
    if (el.type === Fragment) return visit(el.props.children);
    if (typeof el.type === "string") {
      const { children: _children, ...props } = el.props;
      out.push([el.type, props]);
    }
  };
  visit(element);
  return out;
}

async function main() {
  const lines: string[] = [
    `import { ShapeIcon, type IconShapes, type ShapeIconProps } from "@repo/icons/create-icon";`,
    "",
  ];

  for (const name of names) {
    const base = name.slice(0, -"Icon".length);
    const mod = (await import(pathToFileURL(join(phosphor, "dist/defs", `${base}.es.js`)).href)) as {
      default: Map<string, ReactElement>;
    };
    const wanted = weightsFor(name);
    const entry: Record<string, Node[]> = {};
    for (const weight of wanted) {
      const element = mod.default.get(weight);
      if (!element) throw new Error(`${name} has no ${weight} weight`);
      entry[weight] = shapes(element);
    }
    const constant = `${base.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toUpperCase()}_SHAPES`;
    lines.push(
      `const ${constant}: IconShapes = ${JSON.stringify(entry)};`,
      "",
      `export function ${name}(props: ShapeIconProps) {`,
      `  return <ShapeIcon shapes={${constant}} {...props} />;`,
      `}`,
      "",
    );
  }

  writeFileSync(join(root, "packages/icons/src/icons.generated.tsx"), lines.join("\n"));
  console.log(`icons: ${names.length} generated`);
}

void main();

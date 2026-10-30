import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import { plugin as shadcn } from "@shadcn/lint";

export function createNextConfig({
  vendoredFiles = [],
  noTailwindFiles = [],
  uiGlob = 'src/components/ui/**',
  uiImport = '@repo/ui/components',
  extra = [],
} = {}) {
  return defineConfig([
    ...nextVitals,
    {
      rules: {
        'react-hooks/incompatible-library': 'off',
      },
    },
    ...(vendoredFiles.length
      ? [
          {
            files: vendoredFiles,
            rules: {
              'react-hooks/refs': 'off',
              'react-hooks/purity': 'off',
              'react-hooks/immutability': 'off',
              'react-hooks/use-memo': 'off',
              'react-hooks/set-state-in-effect': 'off',
              'react-hooks/exhaustive-deps': 'off',
              'react-hooks/preserve-manual-memoization': 'off',
              '@next/next/no-img-element': 'off',
            },
          },
        ]
      : []),
    {
      files: ['src/**/*.{ts,tsx}'],
      plugins: { shadcn },
      settings: { shadcn: { ui: uiImport } },
      rules: {
        'shadcn/no-restyle': ['error', { allow: ['layout'] }],
        'shadcn/no-raw-colors': 'error',
        'shadcn/no-arbitrary-values': ['error', { allow: ['layout', 'motion', 'effects'] }],
        'shadcn/no-inline-styles': [
          'error',
          {
            allow: [
              'transform',
              'opacity',
              'top',
              'left',
              'width',
              'height',
              'position',
              'inset-inline',
              'visibility',
              'transition',
              'transition-delay',
              'animation',
              'animation-delay',
              'animation-play-state',
              'background-color',
            ],
          },
        ],
        'shadcn/no-unknown-classes': 'error',
        'shadcn/require-static-classes': 'error',
      },
    },
    {
      files: [uiGlob],
      rules: {
        'shadcn/no-restyle': 'off',
        'shadcn/no-arbitrary-values': 'off',
        'shadcn/require-static-classes': 'off',
      },
    },
    {
      files: ['src/**/*.tsx'],
      ignores: [uiGlob, ...noTailwindFiles],
      rules: {
        'no-restricted-syntax': [
          'error',
          {
            selector: "JSXOpeningElement[name.name='button']",
            message: 'Use <Button> from "@repo/ui/components/button" instead of a raw <button>.',
          },
          {
            selector:
              "JSXOpeningElement[name.name='input']:has(JSXAttribute[name.name='type'][value.value='checkbox'])",
            message: 'Use <Checkbox> from "@repo/ui/components/checkbox" instead of a raw <input type="checkbox">.',
          },
          {
            selector:
              "JSXOpeningElement[name.name='input']:not(:has(JSXAttribute[name.name='type'][value.value='checkbox']))",
            message: 'Use <Input> from "@repo/ui/components/input" instead of a raw <input>.',
          },
          {
            selector: "JSXOpeningElement[name.name='select']",
            message: 'Use <Select> from "@repo/ui/components/select" instead of a raw <select>.',
          },
          {
            selector: "JSXOpeningElement[name.name='textarea']",
            message: 'Use <Textarea> from "@repo/ui/components/textarea" instead of a raw <textarea>.',
          },
          {
            selector: "JSXOpeningElement[name.name='label']",
            message: 'Use <Label> from "@repo/ui/components/label" instead of a raw <label>.',
          },
          {
            selector: "JSXOpeningElement[name.name='hr']",
            message: 'Use <Separator> from "@repo/ui/components/separator" instead of a raw <hr>.',
          },
          {
            selector: "JSXOpeningElement[name.name='kbd']",
            message: 'Use <Kbd> from "@repo/ui/components/kbd" instead of a raw <kbd>.',
          },
          {
            selector: "JSXOpeningElement[name.name='dialog']",
            message: 'Use <Dialog> from "@repo/ui/components/dialog" instead of a raw <dialog>.',
          },
          {
            selector: "JSXOpeningElement[name.name='details']",
            message: 'Use <Collapsible> from "@repo/ui/components/collapsible" instead of a raw <details>.',
          },
          {
            selector: "JSXOpeningElement[name.name='summary']",
            message: 'Use <CollapsibleTrigger> from "@repo/ui/components/collapsible" instead of a raw <summary>.',
          },
          {
            selector: "JSXOpeningElement[name.name='table']",
            message: 'Use <Table> from "@repo/ui/components/table" instead of a raw <table>.',
          },
          {
            selector: "JSXOpeningElement[name.name='thead']",
            message: 'Use <TableHeader> from "@repo/ui/components/table" instead of a raw <thead>.',
          },
          {
            selector: "JSXOpeningElement[name.name='tbody']",
            message: 'Use <TableBody> from "@repo/ui/components/table" instead of a raw <tbody>.',
          },
          {
            selector: "JSXOpeningElement[name.name='tfoot']",
            message: 'Use <TableFooter> from "@repo/ui/components/table" instead of a raw <tfoot>.',
          },
          {
            selector: "JSXOpeningElement[name.name='tr']",
            message: 'Use <TableRow> from "@repo/ui/components/table" instead of a raw <tr>.',
          },
          {
            selector: "JSXOpeningElement[name.name='th']",
            message: 'Use <TableHead> from "@repo/ui/components/table" instead of a raw <th>.',
          },
          {
            selector: "JSXOpeningElement[name.name='td']",
            message: 'Use <TableCell> from "@repo/ui/components/table" instead of a raw <td>.',
          },
          {
            selector: "JSXOpeningElement[name.name='caption']",
            message: 'Use <TableCaption> from "@repo/ui/components/table" instead of a raw <caption>.',
          },
        ],
      },
    },
    ...(noTailwindFiles.length
      ? [
          {
            files: noTailwindFiles,
            rules: {
              'shadcn/no-inline-styles': 'off',
              'shadcn/no-raw-colors': 'off',
              'shadcn/no-arbitrary-values': 'off',
              'shadcn/no-unknown-classes': 'off',
            },
          },
        ]
      : []),
    ...extra,
    globalIgnores([
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
      'env.d.ts',
      'env.ts',
      '.source/**',
      '.unlighthouse/**',
    ]),
  ]);
}

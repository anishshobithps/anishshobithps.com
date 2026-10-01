import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import { plugin as shadcn } from "@shadcn/lint";

const vendoredRegistryFiles = [
  'src/components/ui/media-player.tsx',
  'src/lib/compose-refs.ts',
];

const noTailwindFiles = [
  'src/app/og/route.tsx',
  'src/components/shared/OG.tsx',
  'src/app/icon.tsx',
  'src/app/apple-icon.tsx',
  'src/app/global-error.tsx',
  'src/components/shared/flicker-text.tsx',
];

const eslintConfig = defineConfig([
  ...nextVitals,
  {
    rules: {
      'react-hooks/incompatible-library': 'off',
    },
  },
  {
    files: vendoredRegistryFiles,
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
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { shadcn },
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
    files: ['src/components/ui/**'],
    rules: {
      'shadcn/no-restyle': 'off',
      'shadcn/no-arbitrary-values': 'off',
      'shadcn/require-static-classes': 'off',
    },
  },
  {
    files: ['src/**/*.tsx'],
    ignores: ['src/components/ui/**', ...noTailwindFiles],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "JSXOpeningElement[name.name='button']",
          message: 'Use <Button> from "@/components/ui/button" instead of a raw <button>.',
        },
        {
          selector:
            "JSXOpeningElement[name.name='input']:has(JSXAttribute[name.name='type'][value.value='checkbox'])",
          message: 'Use <Checkbox> from "@/components/ui/checkbox" instead of a raw <input type="checkbox">.',
        },
        {
          selector:
            "JSXOpeningElement[name.name='input']:not(:has(JSXAttribute[name.name='type'][value.value='checkbox']))",
          message: 'Use <Input> from "@/components/ui/input" instead of a raw <input>.',
        },
        {
          selector: "JSXOpeningElement[name.name='select']",
          message: 'Use <Select> from "@/components/ui/select" instead of a raw <select>.',
        },
        {
          selector: "JSXOpeningElement[name.name='textarea']",
          message: 'Use <Textarea> from "@/components/ui/textarea" instead of a raw <textarea>.',
        },
        {
          selector: "JSXOpeningElement[name.name='label']",
          message: 'Use <Label> from "@/components/ui/label" instead of a raw <label>.',
        },
        {
          selector: "JSXOpeningElement[name.name='hr']",
          message: 'Use <Separator> from "@/components/ui/separator" instead of a raw <hr>.',
        },
        {
          selector: "JSXOpeningElement[name.name='kbd']",
          message: 'Use <Kbd> from "@/components/ui/kbd" instead of a raw <kbd>.',
        },
        {
          selector: "JSXOpeningElement[name.name='dialog']",
          message: 'Use <Dialog> from "@/components/ui/dialog" instead of a raw <dialog>.',
        },
        {
          selector: "JSXOpeningElement[name.name='details']",
          message: 'Use <Collapsible> from "@/components/ui/collapsible" instead of a raw <details>.',
        },
        {
          selector: "JSXOpeningElement[name.name='summary']",
          message: 'Use <CollapsibleTrigger> from "@/components/ui/collapsible" instead of a raw <summary>.',
        },
        {
          selector: "JSXOpeningElement[name.name='table']",
          message: 'Use <Table> from "@/components/ui/table" instead of a raw <table>.',
        },
        {
          selector: "JSXOpeningElement[name.name='thead']",
          message: 'Use <TableHeader> from "@/components/ui/table" instead of a raw <thead>.',
        },
        {
          selector: "JSXOpeningElement[name.name='tbody']",
          message: 'Use <TableBody> from "@/components/ui/table" instead of a raw <tbody>.',
        },
        {
          selector: "JSXOpeningElement[name.name='tfoot']",
          message: 'Use <TableFooter> from "@/components/ui/table" instead of a raw <tfoot>.',
        },
        {
          selector: "JSXOpeningElement[name.name='tr']",
          message: 'Use <TableRow> from "@/components/ui/table" instead of a raw <tr>.',
        },
        {
          selector: "JSXOpeningElement[name.name='th']",
          message: 'Use <TableHead> from "@/components/ui/table" instead of a raw <th>.',
        },
        {
          selector: "JSXOpeningElement[name.name='td']",
          message: 'Use <TableCell> from "@/components/ui/table" instead of a raw <td>.',
        },
        {
          selector: "JSXOpeningElement[name.name='caption']",
          message: 'Use <TableCaption> from "@/components/ui/table" instead of a raw <caption>.',
        },
      ],
    },
  },
  {
    files: noTailwindFiles,
    rules: {
      'shadcn/no-inline-styles': 'off',
      'shadcn/no-raw-colors': 'off',
      'shadcn/no-arbitrary-values': 'off',
      'shadcn/no-unknown-classes': 'off',
    },
  },
  {
    files: ['src/components/ui/sonner.tsx'],
    rules: {
      'shadcn/no-unknown-classes': 'off',
    },
  },
  {
    files: ['src/components/diagrams/git-chaos.tsx'],
    rules: {
      'shadcn/no-inline-styles': 'off',
    },
  },
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    '.source/**',
    '.unlighthouse/**',
  ]),
]);

export default eslintConfig;

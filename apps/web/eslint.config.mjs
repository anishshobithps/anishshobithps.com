import { createNextConfig } from '@repo/eslint-config/next';

export default createNextConfig({
  noTailwindFiles: [
    'src/app/og/route.tsx',
    'src/components/shared/OG.tsx',
    'src/lib/svg/**/*.tsx',
    'src/app/icon.tsx',
    'src/app/apple-icon.tsx',
    'src/app/global-error.tsx',
    'src/components/shared/flicker-text.tsx',
  ],
  extra: [
    {
      files: ['src/components/diagrams/git-chaos.tsx'],
      rules: {
        'shadcn/no-inline-styles': 'off',
      },
    },
  ],
});

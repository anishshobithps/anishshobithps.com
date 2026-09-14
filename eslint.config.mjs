import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';

const vendoredRegistryFiles = [
  'src/components/ui/media-player.tsx',
  'src/lib/compose-refs.ts',
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
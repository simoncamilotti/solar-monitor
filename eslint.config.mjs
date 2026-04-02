import nx from '@nx/eslint-plugin';
import simpleImportSort from 'eslint-plugin-simple-import-sort';

export default [
  {
    ignores: ['**/dist', '**/out-tsc', '**/.nx/cache', '**/vite.config.*.timestamp*', '**/vitest.config.*.timestamp*'],
  },
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
          depConstraints: [
            {
              sourceTag: 'scope:api',
              onlyDependOnLibsWithTags: ['scope:api', 'scope:shared'],
            },
            {
              sourceTag: 'scope:web',
              onlyDependOnLibsWithTags: ['scope:web', 'scope:shared'],
            },
            {
              sourceTag: 'scope:shared',
              onlyDependOnLibsWithTags: ['scope:shared'],
            },
          ],
        },
      ],
      '@typescript-eslint/array-type': [
        'error',
        {
          default: 'array-simple',
        },
      ],
      '@typescript-eslint/no-restricted-types': ['error'],
      '@typescript-eslint/consistent-indexed-object-style': ['error'],
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/consistent-type-imports': ['error'],
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'variable',
          format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
        },
        {
          selector: 'classProperty',
          format: ['camelCase', 'UPPER_CASE'],
        },
        {
          selector: 'classProperty',
          modifiers: ['private'],
          format: ['camelCase', 'UPPER_CASE'],
          leadingUnderscore: 'require',
        },
        {
          selector: 'memberLike',
          modifiers: ['private'],
          format: ['camelCase'],
          leadingUnderscore: 'require',
        },
        {
          selector: 'typeLike',
          format: ['PascalCase'],
        },
      ],
      eqeqeq: ['error', 'smart'],
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.cts', '**/*.mts', '**/*.js', '**/*.jsx', '**/*.cjs', '**/*.mjs'],
    // Override or add rules here
    rules: {},
  },
];

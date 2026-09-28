import nx from '@nx/eslint-plugin';
import prettier from 'eslint-config-prettier';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: [
      '**/dist',
      '**/out-tsc',
      '**/coverage',
      '**/vite.config.*.timestamp*',
      'starter/**',
      '**/src/generated/**',
    ],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx', '**/*.mjs', '**/*.cjs'],
    rules: {
      // Module boundaries (ADR 0005)
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
          depConstraints: [
            // A lib never imports an app; nothing imports an e2e project.
            { sourceTag: 'type:lib', onlyDependOnLibsWithTags: ['type:lib'] },
            { sourceTag: 'type:app', onlyDependOnLibsWithTags: ['type:lib'] },
            { sourceTag: 'type:tool', onlyDependOnLibsWithTags: ['type:lib', 'type:tool'] },
            {
              sourceTag: 'type:e2e',
              onlyDependOnLibsWithTags: ['type:app', 'type:lib', 'type:tool'],
            },
            // Platforms
            { sourceTag: 'platform:universal', onlyDependOnLibsWithTags: ['platform:universal'] },
            { sourceTag: 'platform:browser', notDependOnLibsWithTags: ['platform:node'] },
            { sourceTag: 'platform:mobile', notDependOnLibsWithTags: ['platform:node'] },
          ],
        },
      ],
    },
  },
  prettier,
];

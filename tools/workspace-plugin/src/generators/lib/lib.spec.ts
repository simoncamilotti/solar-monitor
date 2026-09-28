import { readJson, type Tree, workspaceRoot } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { libGenerator } from './lib.ts';

describe('lib generator', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    tree.write('tsconfig.json', JSON.stringify({ files: [], references: [] }));
    tree.write('.prettierrc', readFileSync(join(workspaceRoot, '.prettierrc'), 'utf-8'));
  });

  it.each([
    ['shared', 'universal'],
    ['web', 'browser'],
    ['api', 'node'],
  ] as const)('tags a %s lib platform:%s', async (scope, platform) => {
    await libGenerator(tree, { name: 'billing', scope });

    const root = `libs/${scope}/billing`;
    expect(readJson(tree, `${root}/package.json`)).toMatchObject({
      name: '@repo/billing',
      nx: { tags: ['type:lib', `platform:${platform}`] },
    });
    expect(readJson(tree, 'tsconfig.json').references).toEqual([{ path: `./${root}` }]);
    expect(tree.exists(`${root}/src/index.ts`)).toBe(true);
    expect(tree.exists(`${root}/src/lib/billing.spec.ts`)).toBe(true);
  });

  it('compiles JSX in a web lib only', async () => {
    await libGenerator(tree, { name: 'charts', scope: 'web' });
    await libGenerator(tree, { name: 'money', scope: 'shared' });

    expect(readJson(tree, 'libs/web/charts/tsconfig.lib.json').compilerOptions.jsx).toBe(
      'react-jsx',
    );
    expect(
      readJson(tree, 'libs/shared/money/tsconfig.lib.json').compilerOptions.jsx,
    ).toBeUndefined();
  });

  it('refuses an existing lib', async () => {
    await libGenerator(tree, { name: 'billing', scope: 'shared' });
    await expect(libGenerator(tree, { name: 'billing', scope: 'shared' })).rejects.toThrow(
      /already exists/,
    );
  });

  it('rejects an invalid name', async () => {
    await expect(libGenerator(tree, { name: 'Billing', scope: 'shared' })).rejects.toThrow(
      /Invalid library name/,
    );
  });
});

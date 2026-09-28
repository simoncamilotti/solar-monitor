import { type Tree, workspaceRoot } from '@nx/devkit';
import { createTree } from '@nx/devkit/testing';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { apiModuleGenerator } from './api-module.ts';

// The real AppModule and contracts index: a change that breaks the registration fails here.
const FILES = ['.prettierrc', 'apps/api/src/app.module.ts', 'libs/shared/contracts/src/index.ts'];

describe('api-module generator', () => {
  let tree: Tree;

  beforeEach(async () => {
    tree = createTree();
    for (const file of FILES) {
      tree.write(file, readFileSync(join(workspaceRoot, file), 'utf-8'));
    }
    await apiModuleGenerator(tree, { name: 'payment-methods' });
  });

  it('creates the module, its controller, service and test', () => {
    const dir = 'apps/api/src/modules/payment-methods';
    for (const file of ['module', 'controller', 'service', 'controller.spec']) {
      expect(tree.exists(`${dir}/payment-methods.${file}.ts`), file).toBe(true);
    }
    expect(tree.read(`${dir}/payment-methods.controller.ts`, 'utf-8')).toContain(
      "@Controller('payment-methods')",
    );
  });

  it('adds the contract to @repo/contracts', () => {
    expect(tree.read('libs/shared/contracts/src/lib/payment-methods.ts', 'utf-8')).toContain(
      'export const paymentMethodsItemSchema',
    );
    expect(tree.read('libs/shared/contracts/src/index.ts', 'utf-8')).toMatch(
      /export \* from '\.\/lib\/payment-methods\.js';\n$/,
    );
  });

  it('registers the module in AppModule', () => {
    const appModule = tree.read('apps/api/src/app.module.ts', 'utf-8') ?? '';
    expect(appModule).toContain(
      "import { PaymentMethodsModule } from './modules/payment-methods/payment-methods.module.js';",
    );
    expect(appModule).toMatch(/\n\s*PaymentMethodsModule,\n\s*\],\n\s*providers:/);
  });

  it('refuses an existing module', async () => {
    await expect(apiModuleGenerator(tree, { name: 'payment-methods' })).rejects.toThrow(
      /already exists/,
    );
  });
});

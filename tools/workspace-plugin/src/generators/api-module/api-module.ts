import { formatFiles, names, type Tree } from '@nx/devkit';
import { assertKebabCase } from '../../utils/names.ts';
import { apiModuleFiles } from './files.ts';

export interface ApiModuleGeneratorSchema {
  name: string;
}

const APP_MODULE = 'apps/api/src/app.module.ts';
const CONTRACTS_INDEX = 'libs/shared/contracts/src/index.ts';

/**
 * Creates a domain module in the API (ADR 0007 of the starter): its contract in @repo/contracts,
 * a controller, a service and a test, then registers the module in AppModule.
 */
export async function apiModuleGenerator(
  tree: Tree,
  options: ApiModuleGeneratorSchema,
): Promise<void> {
  assertKebabCase(options.name, 'module name');
  const { className, fileName } = names(options.name);
  const dir = `apps/api/src/modules/${fileName}`;
  if (tree.exists(dir)) {
    throw new Error(`${dir} already exists.`);
  }

  for (const [path, content] of Object.entries(apiModuleFiles(options.name))) {
    tree.write(path, content);
  }
  appendLine(tree, CONTRACTS_INDEX, `export * from './lib/${fileName}.js';`);
  registerModule(tree, `${className}Module`, `./modules/${fileName}/${fileName}.module.js`);

  await formatFiles(tree);
}

function appendLine(tree: Tree, path: string, line: string): void {
  const content = tree.read(path, 'utf-8');
  if (content === null) {
    throw new Error(`${path} not found.`);
  }
  tree.write(path, `${content.trimEnd()}\n${line}\n`);
}

/** Adds the import after the last one, and the module at the end of `imports: [...]`. */
function registerModule(tree: Tree, moduleClass: string, importPath: string): void {
  const content = tree.read(APP_MODULE, 'utf-8');
  if (content === null) {
    throw new Error(`${APP_MODULE} not found.`);
  }
  const lastImport = [...content.matchAll(/^import .*;$/gm)].at(-1);
  const importsArray = /(\n\s*imports: \[[\s\S]*?)(\n\s*\],)/.exec(content);
  if (!lastImport || !importsArray) {
    throw new Error(`${APP_MODULE}: import statements or \`imports: [...]\` not found.`);
  }

  const importEnd = lastImport.index + lastImport[0].length;
  const withImport = `${content.slice(0, importEnd)}\nimport { ${moduleClass} } from '${importPath}';${content.slice(importEnd)}`;
  tree.write(
    APP_MODULE,
    withImport.replace(
      /(\n\s*imports: \[[\s\S]*?)(,?)(\n\s*\],)/,
      (_match, body: string, _comma: string, end: string) => `${body},\n    ${moduleClass},${end}`,
    ),
  );
}

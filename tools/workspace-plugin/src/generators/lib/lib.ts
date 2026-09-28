import {
  formatFiles,
  type GeneratorCallback,
  installPackagesTask,
  type Tree,
  updateJson,
} from '@nx/devkit';
import { assertKebabCase } from '../../utils/names.ts';
import { type LibScope, libFiles } from './files.ts';

export interface LibGeneratorSchema {
  name: string;
  scope: LibScope;
}

/**
 * Creates `libs/<scope>/<name>`, package `@repo/<name>`, tagged for the module boundaries
 * (ADR 0005 of the starter): shared → platform:universal, web → browser, api → node.
 */
export async function libGenerator(
  tree: Tree,
  options: LibGeneratorSchema,
): Promise<GeneratorCallback> {
  assertKebabCase(options.name, 'library name');
  if (!['shared', 'web', 'api'].includes(options.scope)) {
    throw new Error(`Invalid scope "${options.scope}": shared, web or api.`);
  }
  const root = `libs/${options.scope}/${options.name}`;
  if (tree.exists(root)) {
    throw new Error(`${root} already exists.`);
  }

  for (const [path, content] of Object.entries(libFiles(options.name, options.scope))) {
    tree.write(`${root}/${path}`, content);
  }
  updateJson(tree, 'tsconfig.json', (json) => {
    json.references = [...(json.references ?? []), { path: `./${root}` }];
    return json;
  });

  await formatFiles(tree);
  // Links the new workspace package.
  return () => installPackagesTask(tree, true);
}

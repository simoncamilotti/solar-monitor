import { names } from '@nx/devkit';

export type LibScope = 'shared' | 'web' | 'api';

const PLATFORMS: Record<LibScope, string> = {
  shared: 'universal',
  web: 'browser',
  api: 'node',
};

/** The files of a library, keyed by path relative to its root. */
export function libFiles(name: string, scope: LibScope): Record<string, string> {
  const { propertyName } = names(name);
  const packageName = `@repo/${name}`;
  const web = scope === 'web';

  const packageJson = {
    name: packageName,
    version: '0.0.0',
    private: true,
    type: 'module',
    exports: {
      './package.json': './package.json',
      '.': {
        '@repo/source': './src/index.ts',
        types: './dist/index.d.ts',
        import: './dist/index.js',
        default: './dist/index.js',
      },
    },
    nx: { tags: ['type:lib', `platform:${PLATFORMS[scope]}`] },
  };

  const libCompilerOptions = {
    rootDir: 'src',
    outDir: 'dist',
    tsBuildInfoFile: 'dist/tsconfig.lib.tsbuildinfo',
    emitDeclarationOnly: false,
    ...(web
      ? {
          jsx: 'react-jsx',
          module: 'esnext',
          moduleResolution: 'bundler',
          lib: ['es2024', 'dom', 'dom.iterable'],
          types: [],
        }
      : { types: scope === 'api' ? ['node'] : [] }),
  };

  const sources = web ? ['src/**/*.ts', 'src/**/*.tsx'] : ['src/**/*.ts'];
  const specs = web
    ? ['src/**/*.spec.ts', 'src/**/*.spec.tsx', 'src/**/*.test.ts', 'src/**/*.test.tsx']
    : ['src/**/*.spec.ts', 'src/**/*.test.ts'];

  return {
    'package.json': json(packageJson),
    'tsconfig.json': json({
      extends: '../../../tsconfig.base.json',
      files: [],
      include: [],
      references: [{ path: './tsconfig.lib.json' }, { path: './tsconfig.spec.json' }],
    }),
    'tsconfig.lib.json': json({
      extends: '../../../tsconfig.base.json',
      compilerOptions: libCompilerOptions,
      include: sources,
      exclude: specs,
    }),
    'tsconfig.spec.json': json({
      extends: '../../../tsconfig.base.json',
      compilerOptions: {
        outDir: './out-tsc/vitest',
        types: ['vitest/globals', 'node'],
        ...(web ? { jsx: 'react-jsx', module: 'esnext', moduleResolution: 'bundler' } : {}),
      },
      include: ['vitest.config.ts', ...specs],
      references: [{ path: './tsconfig.lib.json' }],
    }),
    'eslint.config.mjs': `import baseConfig from '../../../eslint.config.mjs';

export default [...baseConfig];
`,
    'vitest.config.ts': `import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: import.meta.dirname,
  cacheDir: '../../../node_modules/.vite/libs/${scope}/${name}',
  test: {
    name: '${packageName}',
    globals: true,
    environment: 'node',
    include: ['src/**/*.{spec,test}.${web ? '{ts,tsx}' : 'ts'}'],
    coverage: {
      provider: 'v8',
      reportsDirectory: './test-output/coverage',
    },
  },
});
`,
    'src/index.ts': `export * from './lib/${name}.js';\n`,
    [`src/lib/${name}.ts`]: `export function ${propertyName}(): string {
  return '${name}';
}
`,
    [`src/lib/${name}.spec.ts`]: `import { ${propertyName} } from './${name}.js';

describe('${propertyName}', () => {
  it('works', () => {
    expect(${propertyName}()).toBe('${name}');
  });
});
`,
  };
}

function json(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

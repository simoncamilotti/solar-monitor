const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('path');

module.exports = {
  output: {
    path: join(__dirname, '../../dist/apps/api'),
    clean: true,
    ...(process.env.NODE_ENV !== 'production' && {
      devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    }),
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      assets: ['./src/assets', { input: './src/swagger', glob: '**/*', output: 'swagger' }],
      optimization: process.env.NODE_ENV === 'production',
      outputHashing: 'none',
      generatePackageJson: true,
      sourceMap: process.env.NODE_ENV !== 'production',
    }),
  ],
};

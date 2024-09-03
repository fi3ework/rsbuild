import { type LibConfig, defineConfig } from '@rslib/core';
import prebundleConfig from './prebundle.config.mjs';
import {
  define,
  requireShim,
  cjsBuildConfig,
  commonExternals,
  emitTypePkgJsonPlugin,
} from '@rsbuild/config/modern.config.ts';

export const BUILD_TARGET = {
  node: 'es2021',
  client: 'es2017',
} as const;

export const esmBuildConfig: Partial<LibConfig> = {
  //   format: 'esm',
  //   syntax: BUILD_TARGET.node,
  //   source: {
  //     define,
  //   },
  //   autoExtension: true,
  // shims: true, // TODO:
  // externals: commonExternals, // Done.
  // banner: requireShim, // TODO:
  //   dts: false,
};

const compiledDepsExternals = (() => {
  const { dependencies } = prebundleConfig;
  const externals: Record<string, string> = {};
  for (const item of dependencies) {
    const depName = typeof item === 'string' ? item : item.name;
    externals[depName] = `../compiled/${depName}/index.js`;
  }
  return externals;
})();

const externals = [
  ...commonExternals,
  compiledDepsExternals,
  '@rsbuild/core/client/hmr',
  '@rsbuild/core/client/overlay',
];

// console.log('🧶', externals);

export default defineConfig({
  lib: [
    {
      format: 'esm',
      autoExtension: true,
      dts: false,
      syntax: BUILD_TARGET.node,
      source: {
        define,
        entry: {
          index: './src/index.ts',
        },
        alias: {},
      },
      output: {
        externals,
        target: 'node',
      },
    },
  ],
  output: {
    distPath: {
      root: './dist-rslib',
    },
  },
});

import path from 'node:path';
import prebundleConfig from './prebundle.config.mjs';
import { fileURLToPath } from 'node:url';
// import CircularDependencyPlugin from 'circular-dependency-plugin';

const commonExternals = {
  webpack: 'webpack',
  '@rspack/core': 'import @rspack/core',
  '@rsbuild/core': '@rsbuild/core',
  // /[\\/]compiled[\\/]/,
  // /node:/,
};

const __filename = fileURLToPath(import.meta.url);

const compiledDepsExternals = (() => {
  const { dependencies } = prebundleConfig;

  const externals = {};
  for (const item of dependencies) {
    const depName = typeof item === 'string' ? item : item.name;
    externals[depName] = `../compiled/${depName}/index.js`;
  }

  return externals;
})();

const externals = [
  /@rspack\/core/,
  {
    react: 'react',
    angular: 'angular',
    ...commonExternals,
    ...compiledDepsExternals,
  },
  /@rspack\/core/,
];
// }
//   /@rspack\/core/,
//   commonExternals,
//   compiledDepsExternals,
//   '@rsbuild/core/client/hmr',
//   '@rsbuild/core/client/overlay',
// ];

console.log('💍', externals);

export default {
  mode: 'none',
  target: 'node',
  devtool: false,
  entry: {
    main: './src/index.ts',
  },
  plugins: [
    // new CircularDependencyPlugin({
    //   // 排除一些文件
    //   exclude: /node_modules/,
    //   // 发现循环依赖时抛出错误
    //   failOnError: true,
    // }),
  ],
  externalsType: 'module',
  externals,
  module: {
    parser: {
      javascript: {
        dynamicImportMode: 'eager',
      },
    },
    rules: [
      {
        test: /\.(j|t)sx?$/,
        exclude: [/node_modules/],
        loader: 'builtin:swc-loader',
        options: {
          sourceMap: true,
          jsc: {
            parser: {
              syntax: 'typescript',
            },
          },
          env: {
            targets: ['chrome >= 107'],
          },
        },
        type: 'javascript/auto',
      },
    ],
  },
  output: {
    clean: true,
    module: true,
    path: path.resolve(__filename, '../dist/rspack-dist'),
    // chunkLoading: 'import', // implied to `import` by `output.ChunkFormat`
    chunkFormat: 'module',
    library: {
      type: 'modern-module',
    },
  },
  optimization: {
    concatenateModules: true,
    minimize: false,
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  experiments: {
    outputModule: true,
    rspackFuture: {
      bundlerInfo: {
        force: false,
      },
    },
  },
};

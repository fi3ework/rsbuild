import {
  pickRsbuildConfig,
  type CreateCompiler,
  type RsbuildProvider,
  type PreviewServerOptions,
} from '@rsbuild/shared';
import { createContext, createPublicContext } from './core/createContext';
import { initConfigs, initRsbuildConfig } from './core/initConfigs';
import { getPluginAPI } from './core/initPlugins';
import { applyDefaultPlugins } from './shared';

export const rspackProvider: RsbuildProvider = async ({
  pluginStore,
  rsbuildOptions,
  plugins,
}) => {
  const rsbuildConfig = pickRsbuildConfig(rsbuildOptions.rsbuildConfig);

  const context = await createContext(rsbuildOptions, rsbuildConfig, 'rspack');
  const pluginAPI = getPluginAPI({ context, pluginStore });

  context.pluginAPI = pluginAPI;

  const createCompiler = (async () => {
    const { createCompiler } = await import('./core/createCompiler');
    const { rspackConfigs } = await initConfigs({
      context,
      pluginStore,
      rsbuildOptions,
    });

    return createCompiler({
      context,
      rspackConfigs,
    });
  }) as CreateCompiler;

  return {
    bundler: 'rspack',

    pluginAPI,

    createCompiler,

    publicContext: createPublicContext(context),

    async applyDefaultPlugins() {
      pluginStore.addPlugins(await applyDefaultPlugins(plugins));
    },

    async getServerAPIs(options) {
      const { getServerAPIs } = await import('../server/devServer');
      const { createDevMiddleware } = await import('./core/createCompiler');
      await initRsbuildConfig({ context, pluginStore });
      return getServerAPIs(
        { context, pluginStore, rsbuildOptions },
        createDevMiddleware,
        options,
      );
    },

    async startDevServer(options) {
      const { startDevServer } = await import('../server/devServer');
      const { createDevMiddleware } = await import('./core/createCompiler');
      await initRsbuildConfig({ context, pluginStore });
      return startDevServer(
        { context, pluginStore, rsbuildOptions },
        createDevMiddleware,
        options,
      );
    },

    async preview(options?: PreviewServerOptions) {
      const { startProdServer } = await import('../server/prodServer');
      await initRsbuildConfig({ context, pluginStore });
      return startProdServer(context, context.config, options);
    },

    async build(options) {
      const { build } = await import('./core/build');
      return build({ context, pluginStore, rsbuildOptions }, options);
    },

    async initConfigs() {
      const { rspackConfigs } = await initConfigs({
        context,
        pluginStore,
        rsbuildOptions,
      });
      return rspackConfigs;
    },

    async inspectConfig(inspectOptions) {
      const { inspectConfig } = await import('./core/inspectConfig');
      return inspectConfig({
        context,
        pluginStore,
        rsbuildOptions,
        inspectOptions,
      });
    },
  };
};

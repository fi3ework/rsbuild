import { createContext } from './createContext';
// import { getNodeEnv, pick, setNodeEnv } from './helpers';
import { initPluginAPI } from './initPlugins';
// import { initRsbuildConfig } from './internal';
import { logger } from './logger';
import { setCssExtractPlugin } from './pluginHelper';
import { createPluginManager } from './pluginManager';
import type {
  // Build,
  // CreateDevServer,
  CreateRsbuildOptions,
  // InternalContext,
  // PluginManager,
  // PreviewServerOptions,
  ResolvedCreateRsbuildOptions,
  RsbuildInstance,
  RsbuildProvider,
  // StartDevServer,
} from './types';

const getRspackProvider = async () => {
  // const { rspackProvider } = await import('./provider/provider');
  // return rspackProvider;
};

export async function createRsbuild(
  options: CreateRsbuildOptions = {},
): Promise<RsbuildInstance> {
  const { rsbuildConfig = {} } = options;

  const rsbuildOptions: ResolvedCreateRsbuildOptions = {
    cwd: process.cwd(),
    rsbuildConfig,
    ...options,
  };

  const pluginManager = createPluginManager();

  const context = await createContext(
    rsbuildOptions,
    rsbuildOptions.rsbuildConfig,
    rsbuildConfig.provider ? 'webpack' : 'rspack',
  );

  const getPluginAPI = initPluginAPI({ context, pluginManager });
  context.getPluginAPI = getPluginAPI;
  const globalPluginAPI = getPluginAPI();

  logger.debug('add default plugins');
  // await applyDefaultPlugins(pluginManager, context);
  logger.debug('add default plugins done');

  const provider = (rsbuildConfig.provider ||
    (await getRspackProvider())) as RsbuildProvider;

  const providerInstance = await provider({
    context,
    pluginManager,
    rsbuildOptions,
    setCssExtractPlugin,
  });

  // const preview = async (options?: PreviewServerOptions) => {
  //   if (!getNodeEnv()) {
  //     setNodeEnv('production');
  //   }
  //   // const { startProdServer } = await import('./server/prodServer');
  //   const config = await initRsbuildConfig({ context, pluginManager });
  //   // return startProdServer(context, config, options);
  // };

  // const build: Build = (...args) => {
  //   if (!getNodeEnv()) {
  //     setNodeEnv('production');
  //   }
  //   return providerInstance.build(...args);
  // };

  // const startDevServer: StartDevServer = (...args) => {
  //   if (!getNodeEnv()) {
  //     setNodeEnv('development');
  //   }
  //   return providerInstance.startDevServer(...args);
  // };

  // const createDevServer: CreateDevServer = (...args) => {
  //   if (!getNodeEnv()) {
  //     setNodeEnv('development');
  //   }
  //   return providerInstance.createDevServer(...args);
  // };

  const rsbuild = {
    // build,
    // preview,
    // startDevServer,
    // createDevServer,
    // ...pick(pluginManager, [
    //   'addPlugins',
    //   'getPlugins',
    //   'removePlugins',
    //   'isPluginExists',
    // ]),
    // ...pick(globalPluginAPI, [
    //   'context',
    //   'onBeforeBuild',
    //   'onBeforeCreateCompiler',
    //   'onBeforeStartDevServer',
    //   'onBeforeStartProdServer',
    //   'onAfterBuild',
    //   'onAfterCreateCompiler',
    //   'onAfterStartDevServer',
    //   'onAfterStartProdServer',
    //   'onCloseDevServer',
    //   'onDevCompileDone',
    //   'onExit',
    //   'getRsbuildConfig',
    //   'getNormalizedConfig',
    // ]),
    // ...pick(providerInstance, [
    //   'initConfigs',
    //   'inspectConfig',
    //   'createCompiler',
    // ]),
  };

  // if (rsbuildConfig.plugins) {
  //   const plugins = await Promise.all(rsbuildConfig.plugins);
  //   rsbuild.addPlugins(plugins);
  // }

  // Register environment plugin
  // if (rsbuildConfig.environments) {
  //   await Promise.all(
  //     Object.entries(rsbuildConfig.environments).map(async ([name, config]) => {
  //       const isEnvironmentEnabled =
  //         !rsbuildOptions.environment ||
  //         rsbuildOptions.environment.includes(name);
  //       if (config.plugins && isEnvironmentEnabled) {
  //         const plugins = await Promise.all(config.plugins);
  //         rsbuild.addPlugins(plugins, {
  //           environment: name,
  //         });
  //       }
  //     }),
  //   );
  // }

  return rsbuild;
}

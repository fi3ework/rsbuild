import { join } from 'path';
import { existsSync } from 'fs';
import { color, isDev, logger } from '@rsbuild/shared';
import { program } from '@rsbuild/shared/commander';
import { loadEnv } from '../loadEnv';
import { loadConfig } from './config';
import type { RsbuildMode } from '..';
import { onBeforeRestartServer } from 'src/server/restart';

export type CommonOptions = {
  config?: string;
  open?: boolean | string;
  host?: string;
  port?: number;
};

export type BuildOptions = CommonOptions & {
  watch?: boolean;
};

export type InspectOptions = CommonOptions & {
  env: RsbuildMode;
  output: string;
  verbose?: boolean;
};

export type DevOptions = CommonOptions;

export type PreviewOptions = CommonOptions;

let commonOpts: CommonOptions = {};

export async function init({
  cliOptions,
  isRestart,
}: {
  cliOptions?: CommonOptions;
  isRestart?: boolean;
}) {
  if (cliOptions) {
    commonOpts = cliOptions;
  }

  try {
    const root = process.cwd();
    const envs = loadEnv({ cwd: root });
    isDev() && onBeforeRestartServer(envs.cleanup);

    const config = await loadConfig({
      cwd: root,
      path: commonOpts.config,
    });
    const { createRsbuild } = await import('../createRsbuild');

    config.source ||= {};
    config.source.define = {
      ...envs.publicVars,
      ...config.source.define,
    };

    if (commonOpts.open && !config.dev?.startUrl) {
      config.dev ||= {};
      config.dev.startUrl = commonOpts.open;
    }

    if (commonOpts.host) {
      config.server ||= {};
      config.server.host = commonOpts.host;
    }

    if (commonOpts.port) {
      config.server ||= {};
      config.server.port = commonOpts.port;
    }

    return await createRsbuild({
      cwd: root,
      rsbuildConfig: config,
    });
  } catch (err) {
    if (isRestart) {
      logger.error(err);
    } else {
      throw err;
    }
  }
}

export function runCli() {
  program.name('rsbuild').usage('<command> [options]').version(RSBUILD_VERSION);

  program
    .command('dev')
    .option('-o --open [url]', 'open the page in browser on startup')
    .option(
      '--port <port>',
      'specify a port number for Rsbuild Server to listen',
    )
    .option(
      '--host <host>',
      'specify the host that the Rsbuild Server listens to',
    )
    .option(
      '-c --config <config>',
      'specify the configuration file, can be a relative or absolute path',
    )
    .description('starting the dev server')
    .action(async (options: DevOptions) => {
      try {
        const rsbuild = await init({ cliOptions: options });
        await rsbuild?.startDevServer();
      } catch (err) {
        logger.error('Failed to start dev server.');
        logger.error(err);
        process.exit(1);
      }
    });

  program
    .command('build')
    .option('-w --watch', 'turn on watch mode, watch for changes and rebuild')
    .option(
      '-c --config <config>',
      'specify the configuration file, can be a relative or absolute path',
    )
    .description('build the app for production')
    .action(async (options: BuildOptions) => {
      try {
        const rsbuild = await init({ cliOptions: options });
        await rsbuild?.build({
          watch: options.watch,
        });
      } catch (err) {
        logger.error('Failed to build.');
        logger.error(err);
        process.exit(1);
      }
    });

  program
    .command('preview')
    .option('-o --open [url]', 'open the page in browser on startup')
    .option(
      '--port <port>',
      'specify a port number for Rsbuild Server to listen',
    )
    .option(
      '--host <host>',
      'specify the host that the Rsbuild Server listens to',
    )
    .option(
      '-c --config <config>',
      'specify the configuration file, can be a relative or absolute path',
    )
    .description('preview the production build locally')
    .action(async (options: PreviewOptions) => {
      try {
        const rsbuild = await init({ cliOptions: options });

        if (rsbuild && !existsSync(rsbuild.context.distPath)) {
          throw new Error(
            `The output directory ${color.yellow(
              rsbuild.context.distPath,
            )} does not exist, please build the project before previewing.`,
          );
        }

        await rsbuild?.preview();
      } catch (err) {
        logger.error('Failed to start preview server.');
        logger.error(err);
        process.exit(1);
      }
    });

  program
    .command('inspect')
    .description('inspect the Rspack and Rsbuild configs')
    .option('--env <env>', 'specify env mode', 'development')
    .option('--output <output>', 'specify inspect content output path', '/')
    .option('--verbose', 'show full function definitions in output')
    .option(
      '-c --config <config>',
      'specify the configuration file, can be a relative or absolute path',
    )
    .action(async (options: InspectOptions) => {
      try {
        const rsbuild = await init({ cliOptions: options });
        await rsbuild?.inspectConfig({
          env: options.env,
          verbose: options.verbose,
          outputPath: join(rsbuild.context.distPath, options.output),
          writeToDisk: true,
        });
      } catch (err) {
        logger.error('Failed to inspect config.');
        logger.error(err);
        process.exit(1);
      }
    });

  program.parse();
}

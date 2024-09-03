/**
 * The methods and types exported from this file are considered as
 * the public API of @rsbuild/core.
 */
import { rspack } from '@rspack/core';
// import type * as Rspack from '@rspack/core';
// import * as __internalHelper from './internal';

// Core methods
// export { loadEnv } from './loadEnv';
export { createRsbuild } from './createRsbuild';
// export { loadConfig, defineConfig } from './config';

// Rsbuild version
export const version: string = RSBUILD_VERSION;

// Rspack instance
export { rspack };
//   OnAfterStartProdServerFn

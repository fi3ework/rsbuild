import path from 'path';
import {
  getDistPath,
  getFilename,
  MEDIA_EXTENSIONS,
  FONT_EXTENSIONS,
  IMAGE_EXTENSIONS,
  chainStaticAssetRule,
} from '@rsbuild/shared';
import type { RsbuildPlugin } from '../types';

export function getRegExpForExts(exts: string[]): RegExp {
  const matcher = exts
    .map((ext) => ext.trim())
    .map((ext) => (ext.startsWith('.') ? ext.slice(1) : ext))
    .join('|');

  return new RegExp(
    exts.length === 1 ? `\\.${matcher}$` : `\\.(?:${matcher})$`,
    'i',
  );
}

export const pluginAsset = (): RsbuildPlugin => ({
  name: 'rsbuild:asset',

  setup(api) {
    api.modifyBundlerChain((chain, { isProd }) => {
      const config = api.getNormalizedConfig();

      const createAssetRule = (
        assetType: 'image' | 'media' | 'font' | 'svg',
        exts: string[],
      ) => {
        const regExp = getRegExpForExts(exts);
        const distDir = getDistPath(config, assetType);
        const filename = getFilename(config, assetType, isProd);
        const maxSize = config.output.dataUriLimit[assetType];
        const rule = chain.module.rule(assetType).test(regExp);

        chainStaticAssetRule({
          rule,
          maxSize,
          filename: path.posix.join(distDir, filename),
          assetType,
        });
      };

      createAssetRule('image', IMAGE_EXTENSIONS);
      createAssetRule('svg', ['svg']);
      createAssetRule('media', MEDIA_EXTENSIONS);
      createAssetRule('font', FONT_EXTENSIONS);
    });
  },
});

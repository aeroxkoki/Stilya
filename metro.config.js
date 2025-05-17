// Expoのシリアライズ問題用に修正されたメトロ設定
const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

// 修正されたシリアライザーを取得
const createFixedSerializer = require('./patches/patched-serializer');

// デフォルト設定を取得
const config = getDefaultConfig(__dirname);

// シリアライザーのカスタマイズ
config.serializer = {
  ...config.serializer,
  getModulesRunBeforeMainModule: () => [],
  getPolyfills: () => [],
  getRunModuleStatement: (moduleId) => `globalThis.__r(${moduleId});`,
  createModuleIdFactory: () => (path) => {
    const projectRootPath = __dirname;
    if (path.includes('node_modules')) {
      const moduleName = path.split('node_modules/').pop().split('/')[0];
      return `node_modules/${moduleName}`;
    }
    return path.replace(projectRootPath, '');
  },
  // 修正されたシリアライザーを使用
  getSerializers: () => createFixedSerializer()
};

// その他の設定
config.resolver.sourceExts.push('cjs');
config.resolver.extraNodeModules = {
  '@': `${__dirname}/src`,
};

// GitHub Actions互換性
config.transformer.minifierPath = require.resolve('metro-minify-terser');
config.transformer.minifierConfig = {};

// キャッシュを無効化（ビルド時のみ）
const args = process.argv || [];
if (args.includes('export:embed') || args.includes('--non-interactive')) {
  console.log('[Metro Config] Building with cache disabled for export:embed');
  config.cacheStores = [];
  config.resetCache = true;
} 

module.exports = config;

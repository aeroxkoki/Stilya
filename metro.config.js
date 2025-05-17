// Expo export:embed用に修正したMetro設定
const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

// デフォルト設定を取得
const config = getDefaultConfig(__dirname);

// 直接修正したシリアライザーを使用
const createFixedSerializer = require('./patches/metro-direct-fix/serializer-fix');

// シリアライザー設定を修正
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
  // 修正したシリアライザーを使用
  getSerializers: () => createFixedSerializer()
};

// その他の設定
config.resolver.sourceExts.push('cjs');
config.resolver.extraNodeModules = {
  '@': `${__dirname}/src`,
};

// GitHub Actions互換性のため
config.transformer.minifierPath = require.resolve('metro-minify-terser');
config.transformer.minifierConfig = {};

module.exports = config;

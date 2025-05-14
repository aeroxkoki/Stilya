// metro.config.js
const { getDefaultConfig } = require('@expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

// TypeScriptのトランスパイル設定をカスタマイズ
defaultConfig.resolver.sourceExts = [
  'js', 'jsx', 'json', 'ts', 'tsx', 'cjs', 'mjs'
];

// キャッシュ設定の最適化
defaultConfig.cacheStores = [];

module.exports = defaultConfig;

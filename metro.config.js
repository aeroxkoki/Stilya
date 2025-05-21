// Metro configuration
const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

// 基本設定を取得
const config = getDefaultConfig(__dirname);

// パッケージエクスポートフィールド対応（問題が発生する場合のオプトアウト用）
if (config.resolver) {
  config.resolver.unstable_enablePackageExports = false;
}

// GitHub Actions環境向けの最適化設定
if (process.env.CI || process.env.EAS_BUILD) {
  // EASビルド用のMinifier設定
  config.transformer.minifierPath = require.resolve('metro-minify-terser');
  config.transformer.minifierConfig = {};
  
  // バンドル時の安定性向上
  config.maxWorkers = 2;
  config.resetCache = true;
}

// プラットフォーム固有の拡張子を確実に対応
config.resolver.sourceExts = [
  'js', 'jsx', 'ts', 'tsx', 'json', 'cjs', 'mjs'
];

// Hermes対応
config.transformer.hermesEnabled = true;

module.exports = config;

const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// 開発サーバーの設定を明示的に指定
config.server = {
  ...config.server,
  port: 8081,
};

// watchmanの設定（ファイル監視の安定化）
config.watchFolders = [__dirname];
config.resolver.nodeModulesPaths = [__dirname];

// Expo SDK 53.0.7の推奨設定
config.resolver = {
  ...config.resolver,
  // ESモジュール解決を無効化（Hermesエラー対策）
  unstable_enablePackageExports: false,
  unstable_enableSymlinks: true,
  // CommonJSサポートを追加
  sourceExts: [...config.resolver.sourceExts, 'cjs'],
};

// Metroのデフォルトキャッシュ設定を使用（カスタムキャッシュストアを削除）
// config.cacheStores は設定しない（デフォルトを使用）

module.exports = config;

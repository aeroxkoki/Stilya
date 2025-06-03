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

// React Native 0.74.xの互換性のための設定
config.resolver = {
  ...config.resolver,
  unstable_enablePackageExports: true,
  unstable_enableSymlinks: true,
};

// Metroのデフォルトキャッシュ設定を使用（カスタムキャッシュストアを削除）
// config.cacheStores は設定しない（デフォルトを使用）

module.exports = config;

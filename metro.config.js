const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// シンプルな最適化設定
config.resolver = {
  ...config.resolver,
  // テストファイルを除外
  blacklistRE: /.*\.(test|spec)\.(js|ts|tsx)$/,
};

// 並列処理の最適化
config.maxWorkers = 4;

module.exports = config;

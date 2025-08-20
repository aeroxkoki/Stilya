const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// カスタム設定を追加
config.resolver = {
  ...config.resolver,
  sourceExts: [...config.resolver.sourceExts, 'cjs'],
};

// キャッシュをリセット
config.resetCache = true;

module.exports = config;

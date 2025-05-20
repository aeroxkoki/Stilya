const { getDefaultConfig } = require('@expo/metro-config');
const config = getDefaultConfig(__dirname);

// パッケージエクスポートフィールド対応（問題が発生する場合のオプトアウト用）
if (config.resolver) {
  config.resolver.unstable_enablePackageExports = false;
}

module.exports = config;

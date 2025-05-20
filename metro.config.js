// metro.config.js
const { getDefaultConfig } = require('@expo/metro-config');

// デフォルト設定を取得
const config = getDefaultConfig(__dirname);

// パッケージエクスポートフィールド対応（問題が発生する場合のオプトアウト用）
// Expo SDK 53 / React Native 0.79 では特に重要
if (config.resolver) {
  config.resolver.unstable_enablePackageExports = false;
  config.resolver.disableHierarchicalLookup = true;
}

// 共通設定（Supabaseなどのライブラリの問題に対応）
if (config.resolver) {
  // Node.js標準ライブラリへのアクセス互換性問題を解決
  config.resolver.extraNodeModules = {
    ...config.resolver.extraNodeModules,
    crypto: require.resolve('expo-crypto'),
    stream: require.resolve('stream-browserify'),
    path: require.resolve('path-browserify'),
    url: require.resolve('url'),
    fs: require.resolve('react-native-fs'),
  };
}

// Hermes最適化（jsEngineがhermesに設定されている場合）
if (config.transformer) {
  config.transformer.minifierConfig = {
    ...config.transformer.minifierConfig,
    // Hermes互換性のための設定
    mangle: {
      ...config.transformer.minifierConfig?.mangle,
      keep_classnames: true,
      keep_fnames: true,
    },
    compress: {
      ...config.transformer.minifierConfig?.compress,
      keep_infinity: true,
      passes: 2,
    },
  };
}

// キャッシュ設定を最適化
config.cacheStores = [
  config.cacheStores[0], // メモリキャッシュは常に使用
];

// DEV環境用の設定
if (__DEV__) {
  // 開発環境での最適化
  config.resetCache = false;
  config.maxWorkers = Math.max(2, (require('os').cpus().length / 2)); // 効率的なワーカー数
}

// GitHub Actions / CI環境での設定
if (process.env.CI || process.env.GITHUB_ACTIONS) {
  // CI環境ではキャッシュリセットを避ける
  config.resetCache = false;
  // パフォーマンス最適化
  config.maxWorkers = 2;
  // ウォッチモードを無効化
  config.watchFolders = [];
  // Package Exportsを確実に無効化
  if (config.resolver) {
    config.resolver.unstable_enablePackageExports = false;
    config.resolver.disableHierarchicalLookup = true;
  }
}

module.exports = config;

const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Hermesエンジンとの互換性を向上させるための設定
config.resolver = {
  ...config.resolver,
  // モジュール解決の最適化
  unstable_enablePackageExports: true,
  // シンボリックリンクを有効にする
  unstable_enableSymlinks: true,
  // プラットフォーム固有のファイル拡張子
  sourceExts: [...config.resolver.sourceExts, 'cjs'],
};

// トランスフォーマーの設定
config.transformer = {
  ...config.transformer,
  // Hermesバイトコードの生成を最適化
  minifierConfig: {
    keep_fnames: true,
    mangle: {
      keep_fnames: true,
    },
  },
  // 実験的な設定を有効にする
  unstable_allowRequireContext: true,
};

// キャッシュのリセット（開発時のみ）
if (process.env.NODE_ENV !== 'production') {
  config.resetCache = true;
}

module.exports = config;

// metro.config.js - 最適化バージョン
const { getDefaultConfig } = require('@expo/metro-config');
const config = getDefaultConfig(__dirname);

// パフォーマンス向上設定
config.transformer = {
  ...config.transformer,
  // トランスフォーム結果をキャッシュすることでビルド時間を短縮
  asyncTransformBabelPath: require.resolve('metro-transform-worker'),
  // ファイル監視の排他設定
  watchFolders: [__dirname],
  // バンドルの高速化
  minifierPath: require.resolve('metro-minify-terser'),
  minifierConfig: {
    // 本番環境でのみ完全な圧縮を行う
    compress: { unused: true, drop_console: process.env.NODE_ENV === 'production' },
    mangle: true,
    output: { comments: false }
  }
};

// リゾルバの最適化
config.resolver = {
  ...config.resolver,
  // Watchmanが利用可能な場合のみ使用
  useWatchman: process.env.CI !== 'true',
  // 追加の拡張子サポート
  sourceExts: [...config.resolver.sourceExts, 'cjs', 'mjs'],
  // 高速解決のための設定
  disableHierarchicalLookup: true,
  // モジュールキャッシュの改善
  enableGlobalPackages: false
};

// キャッシュの最適化
config.cacheStores = [
  // メモリキャッシュを優先
  require('metro-cache').FileStore,
];

// CI環境ではキャッシュを無効化
if (process.env.CI === 'true' || 
    process.env.EXPO_NO_CACHE === 'true' || 
    process.env.EAS_BUILD === 'true') {
  console.log('[Metro Config] Running in CI/EAS environment, disabling cache');
  config.resetCache = true;
}

// サーバーの設定を最適化
config.server = {
  ...config.server,
  port: 8081,
  // HMR の高速化
  enhanceMiddleware: (middleware) => middleware,
};

// シリアライザの設定
config.serializer = {
  ...config.serializer,
  // シリアライズ処理の軽量化
  createModuleIdFactory: () => path => path,
};

module.exports = config;

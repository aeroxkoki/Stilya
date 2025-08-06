const { getDefaultConfig } = require('expo/metro-config');
const { FileStore } = require('metro-cache');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Metro設定のカスタマイズ
config.resolver = {
  ...config.resolver,
  // SVGサポートの追加
  assetExts: config.resolver.assetExts.filter(ext => ext !== 'svg'),
  sourceExts: [...config.resolver.sourceExts, 'svg'],
  // キャッシュの改善
  blockList: [],
  resolverMainFields: ['react-native', 'browser', 'main'],
};

// キャッシュ設定の改善
config.cacheStores = [
  new FileStore({
    root: path.join(__dirname, '.metro-cache'),
  }),
];

// 開発サーバー設定
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // CORS ヘッダーの追加
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      // 開発ビルド用の最適化
      if (req.url && req.url.includes('bundle')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      }
      
      return middleware(req, res, next);
    };
  },
};

// watchman設定の最適化
config.watchFolders = [__dirname];

// transformer設定
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    keep_fnames: true,
    mangle: {
      keep_fnames: true,
    },
  },
};

module.exports = config;

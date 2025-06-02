// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// サーバー設定
config.server = {
  ...config.server,
  port: 8081,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // CORS headers for development
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
      return middleware(req, res, next);
    };
  },
};

// Node.jsモジュールの解決設定
config.resolver = {
  ...config.resolver,
  // wsモジュールはReact Nativeでは使用しない（WebSocketは組み込み）
  resolveRequest: (context, moduleName, platform) => {
    // wsモジュールを無視
    if (moduleName === 'ws') {
      return { type: 'empty' };
    }
    
    // デフォルトの解決を使用
    return context.resolveRequest(context, moduleName, platform);
  },
  // Node.jsモジュールのポリフィル設定
  extraNodeModules: {
    ...config.resolver.extraNodeModules,
    stream: require.resolve('stream-browserify'),
    buffer: require.resolve('buffer/'),
  },
};

// Watchmanの監視フォルダ設定
config.watchFolders = [__dirname];

// キャッシュをクリア
config.resetCache = true;

module.exports = config;

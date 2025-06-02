// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// «¹¿à-š’ı 
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

// Node.js³¢â¸åüënİêÕ£ë-š
config.resolver = {
  ...config.resolver,
  // wsÑÃ±ü¸’¹­Ã×WReact NativenÍ¤Æ£ÖWebSocket’(
  resolveRequest: (context, moduleName, platform) => {
    // wsâ¸åüë’¹­Ã×
    if (moduleName === 'ws') {
      return { type: 'empty' };
    }
    
    // ÇÕ©ëÈnãz’(
    return context.resolveRequest(context, moduleName, platform);
  },
  // Node.js³¢â¸åüën¨¤ê¢¹-š
  extraNodeModules: {
    ...config.resolver.extraNodeModules,
    stream: require.resolve('stream-browserify'),
    buffer: require.resolve('buffer/'),
  },
};

// Watchmann-š’ı ª×·çó	
config.watchFolders = [__dirname];

// ­ãÃ·å’¯ê¢Y‹_n-š
config.resetCache = true;

module.exports = config;

// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// ����-����
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

// Node.js������n��գ�-�
config.resolver = {
  ...config.resolver,
  // ws�ñ�������WReact Nativenͤƣ�WebSocket�(
  resolveRequest: (context, moduleName, platform) => {
    // ws���뒹���
    if (moduleName === 'ws') {
      return { type: 'empty' };
    }
    
    // �թ��n�z�(
    return context.resolveRequest(context, moduleName, platform);
  },
  // Node.js������n��ꢹ-�
  extraNodeModules: {
    ...config.resolver.extraNodeModules,
    stream: require.resolve('stream-browserify'),
    buffer: require.resolve('buffer/'),
  },
};

// Watchmann-�����׷��	
config.watchFolders = [__dirname];

// ��÷咯�Y�_�n-�
config.resetCache = true;

module.exports = config;

// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// WebSocketエラーを解消するための設定
config.resolver = {
  ...config.resolver,
  resolveRequest: (context, moduleName, platform) => {
    // wsモジュールを空モジュールとして解決
    if (moduleName === 'ws') {
      return { type: 'empty' };
    }
    // デフォルトの解決方法を使用
    return context.resolveRequest(context, moduleName, platform);
  },
};

// React Native Reanimated用の設定
config.transformer = {
  ...config.transformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};

module.exports = config;

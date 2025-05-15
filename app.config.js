const { withPlugins } = require('@expo/config-plugins');
const appJson = require('./app.json');

// app.jsonの内容を使用する統合設定
module.exports = () => {
  const config = withPlugins(appJson.expo, [
    // expo-linkingプラグインを明示的に設定
    ['expo-linking', {
      prefixes: ['stilya://', 'https://stilya.app']
    }]
  ]);

  return config;
};

// metro.config.js
const { getDefaultConfig } = require('@expo/metro-config');
const config = getDefaultConfig(__dirname);

// CI/EAS環境ではキャッシュを無効化
if (process.env.CI === 'true' || 
    process.env.EXPO_NO_CACHE === 'true' || 
    process.env.EAS_BUILD === 'true') {
  console.log('[Metro Config] Running in CI/EAS environment, disabling cache');
  config.resetCache = true;
}

module.exports = config;

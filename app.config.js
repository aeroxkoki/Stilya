const appJson = require('./app.json');

module.exports = ({ config }) => {
  // app.jsonの設定をベースにする
  config = { ...appJson.expo };
  
  // Deep linking configuration without using it as a plugin
  if (!config.plugins) {
    config.plugins = [];
  }
  
  // Ensure expo-linking is not referenced as a plugin
  config.plugins = config.plugins.filter(plugin => 
    typeof plugin === 'string' ? plugin !== 'expo-linking' : true
  );
  
  // Add scheme configuration directly
  if (!config.scheme) {
    config.scheme = 'stilya';
  }
  
  // CI環境特別設定
  if (process.env.CI === 'true' || process.env.EAS_BUILD === 'true') {
    // CI環境用の特別設定があれば追加
    config.jsEngine = 'hermes'; // 確実にHermesを使用
    
    // CI用ログレベル設定
    config.updates = {
      ...config.updates,
      checkAutomatically: 'ON_ERROR_RECOVERY',
      fallbackToCacheTimeout: 0,
    };
  }
  
  return config;
};

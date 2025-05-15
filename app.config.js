const { withPlugins } = require('@expo/config-plugins');

module.exports = ({ config }) => {
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
  
  return config;
};

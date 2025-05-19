// @ts-check
// Babel configuration for Expo with enhanced runtime support
module.exports = function(api) {
  // This caches the Babel config for better performance
  api.cache.forever();
  
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Explicitly enable reanimated plugin
      'react-native-reanimated/plugin',
      
      // Add runtime transformer for proper interop helpers
      ['@babel/plugin-transform-runtime', {
        helpers: true,
        regenerator: true,
        corejs: false
      }]
    ],
  };
};

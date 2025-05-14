module.exports = function(api) {
  const isTest = api.env('test');
  api.cache(true);
  
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Conditional plugins - in test env we need to use different settings
      ...(isTest ? [] : ['nativewind/babel']),
      // Always included plugins
      'react-native-reanimated/plugin',
    ],
    env: {
      test: {
        plugins: [
          // Plugins for test environment only
          ['@babel/plugin-transform-runtime', { regenerator: true }],
          '@babel/plugin-transform-template-literals',
        ],
      },
    },
  };
};

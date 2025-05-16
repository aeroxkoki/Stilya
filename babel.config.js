module.exports = function(api) {
  api.cache(true);
  
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['module-resolver', {
        root: ['.'],
        alias: {
          '@': './src',
        },
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
      }],
      'nativewind/babel',
      'react-native-reanimated/plugin',
    ],
    env: {
      production: {
        plugins: [
          'transform-remove-console',
          'transform-remove-debugger',
        ],
      },
    },
  };
};

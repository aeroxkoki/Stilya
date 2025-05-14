module.exports = function(api) {
  api.cache(true);
  const isTest = api.env('test');
  
  return {
    presets: ['babel-preset-expo'],
    plugins: isTest 
      ? [] 
      : [
          'nativewind/babel',
          'react-native-reanimated/plugin'
        ]
  };
};

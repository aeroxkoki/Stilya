module.exports = function(api) {
  api.cache(true);
  
  // 環境に応じて設定を変更
  const env = api.env();
  // console.log(`Babel環境: ${env}`);
  
  // 基本設定
  const config = {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
    ],
    env: {
      production: {
        plugins: ['transform-remove-console'],
      },
      test: {
        // テスト環境用の特別設定
        presets: [
          ['babel-preset-expo', {
            lazyImports: false,
            disableImportExportTransform: false,
            unstable_enablePackageExports: false,
          }]
        ],
        plugins: [
          '@babel/plugin-transform-runtime',
          'babel-plugin-transform-react-jsx',
        ]
      }
    },
  };
  
  return config;
};

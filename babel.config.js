module.exports = function(api) {
  // キャッシュ設定の強化
  api.cache.forever();
  
  const isProd = process.env.NODE_ENV === 'production';
  const isTest = process.env.NODE_ENV === 'test';
  
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Reanimatedプラグイン
      'react-native-reanimated/plugin',
      
      // バンドルサイズ最適化
      isProd && [
        'transform-remove-console',
        { exclude: ['error', 'warn'] }
      ],
      
      // インポート最適化
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@': './src',
          },
          extensions: ['.js', '.jsx', '.ts', '.tsx']
        }
      ],
      
      // ビルド時間短縮のための機能無効化
      !isTest && ['@babel/plugin-transform-runtime', { helpers: true }],
    ].filter(Boolean),
    env: {
      production: {
        // 本番ビルド最適化
        minified: true,
        compact: true,
      },
    },
  };
};

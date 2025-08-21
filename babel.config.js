module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // パスエイリアスの設定
      [
        'module-resolver',
        {
          root: ['./'],
          extensions: [
            '.ios.ts',
            '.android.ts',
            '.ts',
            '.ios.tsx',
            '.android.tsx',
            '.tsx',
            '.jsx',
            '.js',
            '.json',
          ],
          alias: {
            // 既存のコードとの互換性を保つため、両方の形式をサポート
            '@/components': './src/components',
            '@/screens': './src/screens',
            '@/services': './src/services',
            '@/utils': './src/utils',
            '@/hooks': './src/hooks',
            '@/contexts': './src/contexts',
            '@/navigation': './src/navigation',
            '@/types': './src/types',
            '@/assets': './src/assets',
            '@/constants': './src/constants',
            '@/styles': './src/styles',
            '@/store': './src/store',
            '@/lib': './src/lib',
            '@/batch': './src/batch',
            '@/scripts': './src/scripts',
            '@/tests': './src/tests',
            // ルートエイリアス
            '@': './src',
          },
        },
      ],
      // react-native-reanimatedプラグインは必ず最後に配置
      'react-native-reanimated/plugin',
    ],
  };
};

module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      "nativewind/babel",
      [
        "module-resolver",
        {
          alias: {
            "@": "./src",
          },
          extensions: [
            ".js",
            ".jsx",
            ".ts",
            ".tsx",
          ],
        },
      ],
      // パフォーマンス最適化のための追加プラグイン
      ["transform-remove-console", { "exclude": ["error", "warn", "info"] }],
      // 空の引数やデバッグステートメントを削除
      process.env.NODE_ENV === 'production' && 'transform-remove-debugger',
      // Hermes エンジン向け最適化 
      "@babel/plugin-transform-react-jsx-source",
    ].filter(Boolean),
  };
};

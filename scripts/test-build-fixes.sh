#!/bin/bash
# test-build-fixes.sh
# GitHub Actionsビルド修正点をテストするスクリプト

set -e  # エラー時に停止

# 現在の作業ディレクトリを表示
echo "📂 現在のディレクトリ: $(pwd)"

# 環境設定
export CI=true
export NODE_ENV=test
export NODE_OPTIONS="--no-warnings --experimental-vm-modules"
export EAS_SKIP_JAVASCRIPT_BUNDLING=1
export EXPO_USE_NATIVE_MODULES=false
export RCT_NEW_ARCH_ENABLED=false
export EX_DEV_CLIENT_NETWORK_INSPECTOR=false
export EX_USE_METRO_LITE_SERVER=false
export unstable_enablePackageExports=false

# キャッシュクリア
echo "🧹 キャッシュをクリアします..."
rm -rf node_modules/.cache
rm -rf ~/.expo/cache
rm -rf .expo
rm -rf .expo-shared
rm -rf .metro-cache

# テスト用パッケージの確認
if ! npm list jest-environment-node --depth=0 >/dev/null 2>&1; then
  echo "📦 jest-environment-node をインストールしています..."
  npm install --save-dev jest-environment-node
fi

# babel.config.test.jsの確認
echo "📝 babel.config.test.jsの確認..."
if [ ! -f babel.config.test.js ]; then
  echo "babel.config.test.jsが存在しません。作成します..."
  cat << EOF > babel.config.test.js
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Bridgeless モードを無効化するプラグイン設定
      ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }],
      ['module-resolver', {
        alias: {
          // 問題のモジュールをダミーに置き換え
          'react-native/Libraries/TurboModule': './src/__mocks__/emptyModule',
          'react-native/src/private/devmenu': './src/__mocks__/emptyModule',
          'react-native/src/private/specs_DEPRECATED': './src/__mocks__/emptyModule',
          // expo-image のモック
          'expo-image': './src/__mocks__/expo-image.js',
        },
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      }],
    ],
    // 統合されたenv設定
    env: {
      test: {
        plugins: [
          // テスト環境専用の設定
          'react-native-reanimated/plugin',
          // バベルキャッシュの無効化（テスト時）
          'transform-react-jsx',
        ],
        presets: [
          ['babel-preset-expo', {
            // テスト用に最適化
            lazyImports: false,
            disableImportExportTransform: true,
            unstable_enablePackageExports: false,
          }]
        ],
        // テスト用にPackage Exports を無効化
        unstable_enablePackageExports: false,
      },
      production: {
        plugins: ['transform-remove-console'],
      },
    },
  };
};
EOF
  echo "✅ babel.config.test.js を作成しました"
fi

# Metro依存関係の修正
echo "🔧 Metro依存関係を修正します..."
chmod +x ./scripts/fix-metro-dependencies.sh
./scripts/fix-metro-dependencies.sh

# テスト実行
echo "🧪 テストを実行します..."
npm run test:basic
npm run test:simple
npm run test:authstore

# 成功した場合のメッセージ
if [ $? -eq 0 ]; then
  echo "✅ テストに成功しました！GitHub Actionsでも動作する可能性が高いです。"
else
  echo "❌ テストに失敗しました。エラーログを確認してください。"
  exit 1
fi

echo "🚀 テスト完了"

#!/bin/bash
# test-build-fixes.sh
# GitHub Actionsビルド修正点をテストするスクリプト

set -e  # エラー時に停止

# 現在の作業ディレクトリを表示
echo "📂 現在のディレクトリ: $(pwd)"

# 環境設定
export CI=true
export NODE_OPTIONS="--max-old-space-size=4096"
export EAS_SKIP_JAVASCRIPT_BUNDLING=1

# キャッシュクリア
echo "🧹 キャッシュをクリアします..."
rm -rf node_modules/.cache
rm -rf ~/.expo/cache
rm -rf .expo
rm -rf .expo-shared
rm -rf .metro-cache

# babel.config.jsを簡素化
echo "📝 babel.config.jsの簡素化..."
cp babel.config.js babel.config.js.bak
cat << EOF > babel.config.js
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin'],
  };
};
EOF

# Metro依存関係の修正
echo "🔧 Metro依存関係を修正します..."
chmod +x ./scripts/fix-metro-dependencies.sh
./scripts/fix-metro-dependencies.sh

# テストビルドを実行
echo "🏗️ Expoテストビルドを開始します..."
npx expo export --dump-sourcemap --clear

# 成功した場合のメッセージ
if [ $? -eq 0 ]; then
  echo "✅ テストビルドに成功しました！GitHub Actionsでも動作する可能性が高いです。"
else
  echo "❌ テストビルドに失敗しました。エラーログを確認してください。"
  # バックアップから元に戻す
  mv babel.config.js.bak babel.config.js
  exit 1
fi

# クリーンアップ
rm -f babel.config.js.bak
echo "🚀 テスト完了"

#!/bin/bash
# Jest環境でのExpo SDK 53互換性問題を解決するスクリプト

echo "🔧 Expoモジュールの互換性問題を解決するスクリプトを実行しています..."

# 実行ディレクトリをプロジェクトルートに設定
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$SCRIPT_DIR/.."

# jest-expoのsetupファイルを上書き
JEST_EXPO_SETUP="./node_modules/jest-expo/src/preset/setup.js"
if [ -f "$JEST_EXPO_SETUP" ]; then
  echo "🔍 jest-expoのsetupファイルを修正しています..."
  
  # バックアップを作成
  cp "$JEST_EXPO_SETUP" "$JEST_EXPO_SETUP.bak"
  
  # 問題箇所を修正 - expo-modules-coreのインポートをモックに変更
  sed -i'.tmp' 's/import.*expo-modules-core.*//g' "$JEST_EXPO_SETUP"
  sed -i'.tmp' 's/from "expo-modules-core".*//g' "$JEST_EXPO_SETUP"
  
  # モック追加
  echo "
// 自動生成されたモック - expo-modules-core
global.ExpoModules = {
  PlatformInfo: { platform: 'web' },
  devMenuManager: { openMenu: jest.fn() },
};
" >> "$JEST_EXPO_SETUP"
  
  echo "✅ jest-expoのsetupファイルを修正しました"
else
  echo "⚠️ jest-expoのsetupファイルが見つかりません"
fi

# expo-modules-coreのモックディレクトリを確認
MOCK_DIR="./src/__mocks__/expo-modules-core"
if [ ! -d "$MOCK_DIR" ]; then
  echo "🔍 expo-modules-coreのモックディレクトリを作成しています..."
  mkdir -p "$MOCK_DIR/web"
fi

echo "✅ スクリプトの実行が完了しました"

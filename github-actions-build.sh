#!/bin/bash
# GitHub Actions用ビルドスクリプト

echo "===== GitHub Actionsでのビルド実行 ====="

# スクリプトに実行権限を付与
chmod +x *.sh run-patched-expo-direct.js run-expo-export.js patch-expo-cli.js

# キャッシュをクリア
echo "キャッシュをクリアしています..."
rm -rf node_modules/.cache
rm -rf $HOME/.expo
rm -rf $HOME/.metro

# 強化されたパッチを適用
echo "強化されたExpoパッチを適用しています..."
./fix-expo-deep.sh

# EASバリデーション
echo "EAS設定を検証しています..."
npx jsonlint-cli eas.json || echo "eas.jsonの検証に失敗しました"
npx jsonlint-cli app.json || echo "app.jsonの検証に失敗しました"

# 直接ビルドを実行
echo "パッチ適用済みのExpoビルドを実行しています..."
node run-patched-expo-direct.js
BUILD_RESULT=$?

if [ $BUILD_RESULT -ne 0 ]; then
  echo "エラー: Expoビルドに失敗しました"
  echo "代替手段を試みます..."
  
  # 代替アプローチを試行
  export NODE_OPTIONS="--require $PWD/patches/deep-fixes/enhance-json-parser.js --no-warnings --max-old-space-size=8192"
  export EXPO_PATCH_APPLIED=true
  export EXPO_NO_CACHE=true
  
  echo "NODE_OPTIONS=$NODE_OPTIONS"
  
  # 直接コマンドを実行
  expo export:embed --eager --platform android --dev false
  FINAL_RESULT=$?
  
  if [ $FINAL_RESULT -ne 0 ]; then
    echo "最終的なビルドも失敗しました"
    exit $FINAL_RESULT
  else
    echo "代替アプローチでのビルドに成功しました"
    exit 0
  fi
else
  echo "パッチ適用済みのExpoビルドに成功しました"
  exit 0
fi

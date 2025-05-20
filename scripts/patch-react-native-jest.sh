#!/bin/bash

# React Native のsetupファイルを直接パッチするスクリプト
# GitHub Actions環境でのJestテスト実行時のESM互換性問題を解決します
# 作成日: 2025-05-20

echo "React Native Jest Setup パッチングスクリプトを実行します"

# node_modulesのパスを設定
RN_PATH="./node_modules/react-native"
RN_JEST_SETUP="$RN_PATH/jest/setup.js"

if [ -f "$RN_JEST_SETUP" ]; then
  echo "React Native Jest Setup ファイルが見つかりました: $RN_JEST_SETUP"

  # バックアップを作成
  cp "$RN_JEST_SETUP" "${RN_JEST_SETUP}.bak"
  echo "バックアップを作成しました: ${RN_JEST_SETUP}.bak"

  # ESM importを CommonJS requireに変換
  echo "ESM importを CommonJS requireに変換します..."
  sed -i 's/import \([a-zA-Z_]*\) from "\(.*\)";/var \1 = require("\2");/g' "$RN_JEST_SETUP"
  
  # export defaultを module.exports に変換
  echo "export defaultを module.exports に変換します..."
  sed -i 's/export default \(.*\);/module.exports = \1;/g' "$RN_JEST_SETUP"
  
  # 単純なexport文を修正
  echo "その他のexport文を修正します..."
  sed -i 's/export const/const/g' "$RN_JEST_SETUP"
  sed -i 's/export function/function/g' "$RN_JEST_SETUP"
  sed -i 's/export var/var/g' "$RN_JEST_SETUP"
  
  # モジュール末尾に exports 追加
  echo "モジュールエクスポートを追加します..."
  echo -e "\n// Add exports for CommonJS compatibility" >> "$RN_JEST_SETUP"
  grep -o "export const [a-zA-Z_][a-zA-Z0-9_]*" "$RN_JEST_SETUP.bak" | sed 's/export const \(.*\)/module.exports.\1 = \1;/g' >> "$RN_JEST_SETUP"
  grep -o "export function [a-zA-Z_][a-zA-Z0-9_]*" "$RN_JEST_SETUP.bak" | sed 's/export function \(.*\)/module.exports.\1 = \1;/g' >> "$RN_JEST_SETUP"
  grep -o "export var [a-zA-Z_][a-zA-Z0-9_]*" "$RN_JEST_SETUP.bak" | sed 's/export var \(.*\)/module.exports.\1 = \1;/g' >> "$RN_JEST_SETUP"
  
  echo "React Native Jestのパッチング完了"
  
  # babel-runtimeのヘルパーモジュールをシンボリックリンクで追加
  echo "babel-runtimeのヘルパーモジュールをリンクします..."
  HELPERS_DIR="./node_modules/@babel/runtime/helpers"
  ESM_HELPERS_DIR="$HELPERS_DIR/esm"
  
  if [ -d "$HELPERS_DIR" ] && [ -d "$ESM_HELPERS_DIR" ]; then
    for file in $HELPERS_DIR/*.js; do
      BASENAME=$(basename $file .js)
      if [ -f "$ESM_HELPERS_DIR/$BASENAME.js" ] && [ ! -f "$ESM_HELPERS_DIR/$BASENAME.cjs" ]; then
        # ESM版のCJSバージョンを作成
        cp "$HELPERS_DIR/$BASENAME.js" "$ESM_HELPERS_DIR/$BASENAME.cjs"
        echo "Created: $ESM_HELPERS_DIR/$BASENAME.cjs"
      fi
    done
    echo "babel-runtimeヘルパーの準備完了"
  else
    echo "警告: @babel/runtime/helpers ディレクトリが見つかりません"
  fi
  
else
  echo "エラー: React Native Jest Setup ファイルが見つかりません: $RN_JEST_SETUP"
  exit 1
fi

# 環境変数の設定を表示
echo "環境変数を確認..."
echo "NODE_ENV: $NODE_ENV"
echo "NODE_OPTIONS: $NODE_OPTIONS"
echo "EAS_SKIP_JAVASCRIPT_BUNDLING: $EAS_SKIP_JAVASCRIPT_BUNDLING"
echo "METRO_CONFIG_FIX: $METRO_CONFIG_FIX"
echo "EXPO_USE_NATIVE_MODULES: $EXPO_USE_NATIVE_MODULES"
echo "RCT_NEW_ARCH_ENABLED: $RCT_NEW_ARCH_ENABLED"

echo "パッチスクリプトの実行完了"
exit 0

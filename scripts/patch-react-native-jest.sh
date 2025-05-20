#!/bin/bash

# React Native のsetupファイルを直接パッチするスクリプト
# GitHub Actions環境でのJestテスト実行時のESM互換性問題を解決します
# 作成日: 2025-05-20

echo "React Native Jest Setup パッチングスクリプトを実行します"

# node_modulesのパスを設定
RN_PATH="./node_modules/react-native"
RN_JEST_SETUP="$RN_PATH/jest/setup.js"

# キャッシュディレクトリを作成して確実に存在するようにする
mkdir -p .jest

if [ -f "$RN_JEST_SETUP" ]; then
  echo "React Native Jest Setup ファイルが見つかりました: $RN_JEST_SETUP"

  # バックアップを作成
  cp "$RN_JEST_SETUP" "${RN_JEST_SETUP}.bak"
  echo "バックアップを作成しました: ${RN_JEST_SETUP}.bak"

  # ESM importを CommonJS requireに変換
  echo "ESM importを CommonJS requireに変換します..."
  sed -i 's/import \([a-zA-Z_][a-zA-Z0-9_]*\) from "\([^"]*\)";/var \1 = require("\2");/g' "$RN_JEST_SETUP"
  sed -i "s/import \([a-zA-Z_][a-zA-Z0-9_]*\) from '\([^']*\)';/var \1 = require('\2');/g" "$RN_JEST_SETUP"
  
  # destructuring importsを変換
  sed -i 's/import {[ ]*\([^}]*\)[ ]*} from "\([^"]*\)";/var _temp = require("\2"); var \1 = _temp.\1;/g' "$RN_JEST_SETUP"
  sed -i "s/import {[ ]*\([^}]*\)[ ]*} from '\([^']*\)';/var _temp = require('\2'); var \1 = _temp.\1;/g" "$RN_JEST_SETUP"
  
  # export defaultを module.exports に変換
  echo "export defaultを module.exports に変換します..."
  sed -i 's/export default \(.*\);/module.exports = \1;/g' "$RN_JEST_SETUP"
  
  # 単純なexport文を修正
  echo "その他のexport文を修正します..."
  sed -i 's/export const/const/g' "$RN_JEST_SETUP"
  sed -i 's/export function/function/g' "$RN_JEST_SETUP"
  sed -i 's/export var/var/g' "$RN_JEST_SETUP"
  sed -i 's/export let/let/g' "$RN_JEST_SETUP"
  sed -i 's/export class/class/g' "$RN_JEST_SETUP"
  
  # モジュール末尾に exports 追加
  echo "モジュールエクスポートを追加します..."
  echo -e "\n// Add exports for CommonJS compatibility" >> "$RN_JEST_SETUP"
  
  # コンテンツを一時ファイルに保存
  TEMP_FILE=".jest/temp_exports.js"
  grep -o "export const [a-zA-Z_][a-zA-Z0-9_]*" "${RN_JEST_SETUP}.bak" 2>/dev/null | sed 's/export const \(.*\)/module.exports.\1 = \1;/g' > "$TEMP_FILE"
  grep -o "export function [a-zA-Z_][a-zA-Z0-9_]*" "${RN_JEST_SETUP}.bak" 2>/dev/null | sed 's/export function \(.*\)/module.exports.\1 = \1;/g' >> "$TEMP_FILE"
  grep -o "export var [a-zA-Z_][a-zA-Z0-9_]*" "${RN_JEST_SETUP}.bak" 2>/dev/null | sed 's/export var \(.*\)/module.exports.\1 = \1;/g' >> "$TEMP_FILE"
  grep -o "export let [a-zA-Z_][a-zA-Z0-9_]*" "${RN_JEST_SETUP}.bak" 2>/dev/null | sed 's/export let \(.*\)/module.exports.\1 = \1;/g' >> "$TEMP_FILE"
  grep -o "export class [a-zA-Z_][a-zA-Z0-9_]*" "${RN_JEST_SETUP}.bak" 2>/dev/null | sed 's/export class \(.*\)/module.exports.\1 = \1;/g' >> "$TEMP_FILE"
  
  # 重複を削除して追加
  if [ -s "$TEMP_FILE" ]; then
    sort -u "$TEMP_FILE" >> "$RN_JEST_SETUP"
  fi
  
  # モジュールの互換性確保のための追加コード
  echo -e "// Ensure CommonJS compatibility" >> "$RN_JEST_SETUP"
  echo -e "if (typeof module !== 'undefined' && module.exports) {" >> "$RN_JEST_SETUP"
  echo -e "  module.exports.__esModule = true;" >> "$RN_JEST_SETUP"
  echo -e "}" >> "$RN_JEST_SETUP"
  
  echo "React Native Jestのパッチング完了"
  
  # babel-runtimeのヘルパーモジュールをシンボリックリンクで追加
  echo "babel-runtimeのヘルパーモジュールをリンクします..."
  HELPERS_DIR="./node_modules/@babel/runtime/helpers"
  ESM_HELPERS_DIR="$HELPERS_DIR/esm"
  
  if [ -d "$HELPERS_DIR" ] && [ -d "$ESM_HELPERS_DIR" ]; then
    for file in "$ESM_HELPERS_DIR"/*.js; do
      BASENAME=$(basename "$file" .js)
      if [ ! -f "$ESM_HELPERS_DIR/$BASENAME.cjs" ]; then
        # ESM版のファイルをコピーしてCJSバージョンを作成
        cp "$file" "$ESM_HELPERS_DIR/$BASENAME.cjs"
        
        # CJSに変換（ESM構文をCommonJSに置き換え）
        sed -i 's/export default/module.exports =/g' "$ESM_HELPERS_DIR/$BASENAME.cjs"
        sed -i 's/export //g' "$ESM_HELPERS_DIR/$BASENAME.cjs"
        sed -i 's/import \([a-zA-Z_][a-zA-Z0-9_]*\) from "\([^"]*\)";/var \1 = require("\2");/g' "$ESM_HELPERS_DIR/$BASENAME.cjs"
        sed -i "s/import \([a-zA-Z_][a-zA-Z0-9_]*\) from '\([^']*\)';/var \1 = require('\2');/g" "$ESM_HELPERS_DIR/$BASENAME.cjs"
        
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

# パッチ対象の node_modules の検証
for module_path in \
  "./node_modules/react-native/Libraries/Animated/NativeAnimatedHelper.js" \
  "./node_modules/react-native/Libraries/Components/View/ViewNativeComponent.js" \
  "./node_modules/react-native/Libraries/TurboModule/TurboModuleRegistry.js"; do
  
  if [ -f "$module_path" ] && grep -q "export " "$module_path"; then
    # バックアップを作成
    if [ ! -f "${module_path}.bak" ]; then
      cp "$module_path" "${module_path}.bak"
    fi
    
    # 簡易パッチ - CommonJS変換
    echo "Patching $module_path..."
    sed -i 's/export default/module.exports =/g' "$module_path"
    sed -i 's/export const/const/g' "$module_path"
    sed -i 's/export function/function/g' "$module_path"
    
    # エクスポート追加
    grep -o "const [a-zA-Z_][a-zA-Z0-9_]*" "$module_path" | sed 's/const \(.*\)/module.exports.\1 = \1;/g' >> "$module_path"
  fi
done

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
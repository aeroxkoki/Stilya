#!/bin/bash
# GitHub Actions環境でのJestテスト向けのヘルパースクリプト
# Expo SDK 53 / React Native 0.79での互換性問題を直接解決

# 問題の場所を特定
JEST_EXPO_SETUP="node_modules/jest-expo/src/preset/setup.js"

echo "🔍 GitHub Actions環境のJest問題を修正します..."

if [ -f "$JEST_EXPO_SETUP" ]; then
  # uuidの重複宣言問題を直接修正
  echo "📝 uuid宣言の問題を修正しています..."
  
  # sed -iでの置換が失敗する場合に備えて直接置換
  UUID_LINE_NUM=$(grep -n "const uuid = require(\"uuid\");" "$JEST_EXPO_SETUP" | cut -d: -f1)
  
  if [ -n "$UUID_LINE_NUM" ]; then
    echo "🎯 Line $UUID_LINE_NUM で uuid 宣言を見つけました"
    
    # ファイル内容を一時ファイルに保存
    cat "$JEST_EXPO_SETUP" > jest-expo-setup.temp
    
    # 置換処理
    awk -v line="$UUID_LINE_NUM" '{
      if (NR == line) {
        print "let uuid; try { uuid = require(\"uuid\"); } catch(e) { console.warn(\"uuid already loaded or not available\"); }";
      } else {
        print $0;
      }
    }' jest-expo-setup.temp > "$JEST_EXPO_SETUP"
    
    # 一時ファイルを削除
    rm jest-expo-setup.temp
    
    echo "✅ uuid宣言の問題を修正しました"
  else
    echo "⚠️ uuid宣言の行が見つかりません。ファイル構造が変わった可能性があります。"
  fi
  
  # ExpoModulesCore.uuid 関連の修正も行う
  UUID_ASSIGN_LINE=$(grep -n "ExpoModulesCore.uuid.v4 = uuid.default.v4;" "$JEST_EXPO_SETUP" | cut -d: -f1)
  
  if [ -n "$UUID_ASSIGN_LINE" ]; then
    echo "🎯 Line $UUID_ASSIGN_LINE で uuid.v4 の割り当てを見つけました"
    
    # ファイル内容を一時ファイルに保存
    cat "$JEST_EXPO_SETUP" > jest-expo-setup.temp
    
    # AWKでより安全な置換処理を行う
    awk -v line="$UUID_ASSIGN_LINE" '{
      if (NR == line) {
        print "// Ensure uuid is safely initialized";
        print "if (uuid && uuid.default && uuid.default.v4) {";
        print "  ExpoModulesCore.uuid = uuid;";
        print "  ExpoModulesCore.uuid.v4 = uuid.default.v4;";
        print "} else if (uuid && uuid.v4) {";
        print "  ExpoModulesCore.uuid = uuid;";
        print "  ExpoModulesCore.uuid.v4 = uuid.v4;";
        print "} else {";
        print "  ExpoModulesCore.uuid = {";
        print "    v4: () => {";
        print "      return \"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx\".replace(/[xy]/g, function(c) {";
        print "        var r = Math.random() * 16 | 0, v = c == \"x\" ? r : (r & 0x3 | 0x8);";
        print "        return v.toString(16);";
        print "      });";
        print "    }";
        print "  };";
        print "}";
      } else {
        print $0;
      }
    }' jest-expo-setup.temp > "$JEST_EXPO_SETUP"
    
    # 一時ファイルを削除
    rm jest-expo-setup.temp
    
    echo "✅ uuid.v4 割り当ての問題を修正しました"
  else
    echo "⚠️ uuid.v4の割り当て行が見つかりません。"
  fi
  
else
  echo "❌ jest-expo のセットアップファイルが見つかりません: $JEST_EXPO_SETUP"
  exit 1
fi

echo "🔄 適用した変更内容を確認します..."
grep -A 3 -B 3 "uuid.*require" "$JEST_EXPO_SETUP" || echo "uuid require パターンが見つかりません"
grep -A 10 -B 2 "ExpoModulesCore.uuid" "$JEST_EXPO_SETUP" || echo "ExpoModulesCore.uuid パターンが見つかりません"

echo "✅ GitHub Actions環境向けのJest修正が完了しました！"

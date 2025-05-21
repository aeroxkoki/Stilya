#!/bin/bash
# jest-expoのsetupファイルをパッチして直接修正するスクリプト
# Expo SDK 53 / React Native 0.79での互換性問題を修正
# 2025-05 アップデート: patch-packageを使用したアプローチを追加

JEST_EXPO_SETUP="node_modules/jest-expo/src/preset/setup.js"

echo "🩹 jest-expo のセットアップファイルをパッチします..."

# 先に patch-package が使用可能かをチェック
if command -v npx > /dev/null && npx --no-install patch-package --help > /dev/null 2>&1; then
  echo "✅ patch-package を使用してパッチを適用します"
  
  # パッチディレクトリが存在するかチェック
  if [ -d "patches" ] && [ -f "patches/jest-expo+50.0.0.patch" ]; then
    echo "✅ 既存のパッチファイルを使用します"
    npx --no-install patch-package
    echo "✅ patch-package によるパッチが完了しました！"
    exit 0
  else
    echo "⚠️ patches ディレクトリが見つからないため、従来の方法でパッチを適用します"
  fi
else
  echo "⚠️ patch-package が見つからないため、従来の方法でパッチを適用します"
fi

# 従来の直接編集によるパッチ処理
if [ -f "$JEST_EXPO_SETUP" ]; then
  # バックアップを作成
  cp "$JEST_EXPO_SETUP" "${JEST_EXPO_SETUP}.bak"
  echo "✅ バックアップを作成しました: ${JEST_EXPO_SETUP}.bak"
  
  # 初期化コードを確認
  # ファイルの先頭にcodeを追加する方法（windowの初期化の後に追加）
  if ! grep -q "if (!globalThis.expo)" "$JEST_EXPO_SETUP"; then
    # 17行目に初期化コードを挿入
    LINE_NUM=17
    # 一時ファイルに書き出し
    head -n $LINE_NUM "$JEST_EXPO_SETUP" > "${JEST_EXPO_SETUP}.insert.tmp"
    echo -e "
// Ensure globalThis.expo exists with proper interfaces for EventEmitter, NativeModule, SharedObject
if (!globalThis.expo) {
  globalThis.expo = {
    EventEmitter: class {
      constructor() {
        this.listeners = {};
      }
      addListener(eventName, listener) {
        if (!this.listeners[eventName]) {
          this.listeners[eventName] = [];
        }
        this.listeners[eventName].push(listener);
        return { remove: () => this.removeListener(eventName, listener) };
      }
      removeListener(eventName, listener) {
        if (this.listeners[eventName]) {
          this.listeners[eventName] = this.listeners[eventName].filter(l => l !== listener);
        }
      }
      removeAllListeners(eventName) {
        if (eventName) {
          delete this.listeners[eventName];
        } else {
          this.listeners = {};
        }
      }
      emit(eventName, ...args) {
        if (this.listeners[eventName]) {
          this.listeners[eventName].forEach(listener => {
            listener(...args);
          });
        }
      }
    },
    NativeModule: class {
      constructor(name) {
        this.name = name || 'MockNativeModule';
      }
    },
    SharedObject: class {
      constructor(id) {
        this.id = id || 'MockSharedObject';
      }
    }
  };
}

// Ensure ExpoModulesCore is defined to avoid undeclared reference errors
if (!globalThis.ExpoModulesCore) {
  globalThis.ExpoModulesCore = {
    uuid: { v4: () => 'mock-uuid-v4', v5: () => 'mock-uuid-v5' }
  };
}" >> "${JEST_EXPO_SETUP}.insert.tmp"
    tail -n +$(($LINE_NUM+1)) "$JEST_EXPO_SETUP" >> "${JEST_EXPO_SETUP}.insert.tmp"
    mv "${JEST_EXPO_SETUP}.insert.tmp" "$JEST_EXPO_SETUP"
    echo "✅ ファイル先頭付近にglobalThis.expoの初期化コードを追加しました"
  fi
  
  # UUID関連の問題を修正
  # 行番号223付近の「const uuid = jest.requireActual(...)」という行が問題
  if grep -q "const uuid = jest.requireActual" "$JEST_EXPO_SETUP"; then
    # 問題のある行を修正
    sed -i'' 's/const uuid = jest.requireActual.*$/\/\/ Use our custom UUID mock instead of requiring it again\n    const customUuid = jest.requireActual("..\/..\/..\/src\/__mocks__\/uuid");/' "$JEST_EXPO_SETUP"
    echo "✅ UUID の重複宣言問題を修正しました"
    
    # ExpoModulesCore.uuidの参照も修正
    sed -i'' 's/ExpoModulesCore.uuid.v4 = uuid.default.v4;/ExpoModulesCore.uuid.v4 = customUuid.v4;/' "$JEST_EXPO_SETUP"
    sed -i'' 's/ExpoModulesCore.uuid.v5 = uuid.default.v5;/ExpoModulesCore.uuid.v5 = customUuid.v5;/' "$JEST_EXPO_SETUP"
    echo "✅ UUID メソッドの参照を修正しました"
  elif grep -q "const uuid = require(\"uuid\");" "$JEST_EXPO_SETUP"; then
    # 問題のある行を条件付き宣言に置き換える
    sed -i'' 's/const uuid = require("uuid");/let uuid; try { uuid = require("uuid"); } catch(e) { console.warn("uuid already loaded or not available"); }/' "$JEST_EXPO_SETUP"
    echo "✅ UUID の重複宣言問題を修正しました - 代替方法"
  fi

  # globalThis.expoが未定義の問題を修正
  if grep -q "const { EventEmitter, NativeModule, SharedObject } = globalThis.expo;" "$JEST_EXPO_SETUP" && ! grep -q "if (!globalThis.expo)" "$JEST_EXPO_SETUP"; then
    # globalThis.expoの初期化コードを追加
    EXPO_MOCK='\/\/ Ensure globalThis.expo exists\nif (!globalThis.expo) {\n  globalThis.expo = {\n    EventEmitter: class {\n      constructor() {\n        this.listeners = {};\n      }\n      addListener(eventName, listener) {\n        if (!this.listeners[eventName]) {\n          this.listeners[eventName] = [];\n        }\n        this.listeners[eventName].push(listener);\n        return { remove: () => this.removeListener(eventName, listener) };\n      }\n      removeListener(eventName, listener) {\n        if (this.listeners[eventName]) {\n          this.listeners[eventName] = this.listeners[eventName].filter(l => l !== listener);\n        }\n      }\n      removeAllListeners(eventName) {\n        if (eventName) {\n          delete this.listeners[eventName];\n        } else {\n          this.listeners = {};\n        }\n      }\n      emit(eventName, ...args) {\n        if (this.listeners[eventName]) {\n          this.listeners[eventName].forEach(listener => {\n            listener(...args);\n          });\n        }\n      }\n    },\n    NativeModule: class {\n      constructor(name) {\n        this.name = name;\n      }\n    },\n    SharedObject: class {\n      constructor(id) {\n        this.id = id;\n      }\n    }\n  };\n}\nconst { EventEmitter, NativeModule, SharedObject } = globalThis.expo;'
    
    # sedコマンドの互換性問題を回避するアプローチ
    grep -v "const { EventEmitter, NativeModule, SharedObject } = globalThis.expo;" "$JEST_EXPO_SETUP" > "${JEST_EXPO_SETUP}.new"
    # 元のファイルから特定の行を検索して、その行の場所に挿入
    LINE_NUM=$(grep -n "const { EventEmitter, NativeModule, SharedObject } = globalThis.expo;" "$JEST_EXPO_SETUP" | cut -d':' -f1)
    if [ -n "$LINE_NUM" ]; then
      head -n $(($LINE_NUM-1)) "$JEST_EXPO_SETUP" > "${JEST_EXPO_SETUP}.new.tmp"
      echo -e "$EXPO_MOCK" >> "${JEST_EXPO_SETUP}.new.tmp"
      tail -n +$(($LINE_NUM+1)) "$JEST_EXPO_SETUP" >> "${JEST_EXPO_SETUP}.new.tmp"
      mv "${JEST_EXPO_SETUP}.new.tmp" "${JEST_EXPO_SETUP}.new"
    fi
    
    mv "${JEST_EXPO_SETUP}.new" "$JEST_EXPO_SETUP"
    echo "✅ globalThis.expo のモックを追加しました"
  fi

else
  echo "❌ jest-expo のセットアップファイルが見つかりません: $JEST_EXPO_SETUP"
  exit 1
fi

echo "✅ パッチが完了しました！テストを再実行してください。"

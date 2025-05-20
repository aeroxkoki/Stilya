#!/bin/bash
# jest-expoのsetupファイルをパッチして直接修正するスクリプト
# Expo SDK 53 / React Native 0.79での互換性問題を修正

JEST_EXPO_SETUP="node_modules/jest-expo/src/preset/setup.js"

echo "🩹 jest-expo のセットアップファイルをパッチします..."

if [ -f "$JEST_EXPO_SETUP" ]; then
  # バックアップを作成
  cp "$JEST_EXPO_SETUP" "${JEST_EXPO_SETUP}.bak"
  echo "✅ バックアップを作成しました: ${JEST_EXPO_SETUP}.bak"
  
  # UUID関連の問題を修正
  # 行番号278付近の「const uuid = require("uuid");」という行が問題
  if grep -q "const uuid = require(\"uuid\");" "$JEST_EXPO_SETUP"; then
    # 問題のある行を条件付き宣言に置き換える
    sed -i'.tmp' 's/const uuid = require("uuid");/let uuid; try { uuid = require("uuid"); } catch(e) { console.warn("uuid already loaded or not available"); }/' "$JEST_EXPO_SETUP"
    echo "✅ UUID の重複宣言問題を修正しました"
    
    # 一時ファイルを削除
    rm -f "${JEST_EXPO_SETUP}.tmp"
  fi

  # globalThis.expoが未定義の問題を修正
  if grep -q "const { EventEmitter, NativeModule, SharedObject } = globalThis.expo;" "$JEST_EXPO_SETUP" && ! grep -q "if (!globalThis.expo)" "$JEST_EXPO_SETUP"; then
    # globalThis.expoの初期化コードを追加
    sed -i'.tmp2' 's/const { EventEmitter, NativeModule, SharedObject } = globalThis.expo;/\/\/ Ensure globalThis.expo exists\nif (!globalThis.expo) {\n  globalThis.expo = {\n    EventEmitter: class {\n      constructor() {\n        this.listeners = {};\n      }\n      addListener(eventName, listener) {\n        if (!this.listeners[eventName]) {\n          this.listeners[eventName] = [];\n        }\n        this.listeners[eventName].push(listener);\n        return { remove: () => this.removeListener(eventName, listener) };\n      }\n      removeListener(eventName, listener) {\n        if (this.listeners[eventName]) {\n          this.listeners[eventName] = this.listeners[eventName].filter(l => l !== listener);\n        }\n      }\n      removeAllListeners(eventName) {\n        if (eventName) {\n          delete this.listeners[eventName];\n        } else {\n          this.listeners = {};\n        }\n      }\n      emit(eventName, ...args) {\n        if (this.listeners[eventName]) {\n          this.listeners[eventName].forEach(listener => {\n            listener(...args);\n          });\n        }\n      }\n    },\n    NativeModule: class {\n      constructor(name) {\n        this.name = name;\n      }\n    },\n    SharedObject: class {\n      constructor(id) {\n        this.id = id;\n      }\n    }\n  };\n}\nconst { EventEmitter, NativeModule, SharedObject } = globalThis.expo;/' "$JEST_EXPO_SETUP"
    echo "✅ globalThis.expo のモックを追加しました"
    
    # 一時ファイルを削除
    rm -f "${JEST_EXPO_SETUP}.tmp2"
  fi

  # ExpoModulesCore.uuid 関連の修正
  if grep -q "ExpoModulesCore.uuid.v4 = uuid.default.v4;" "$JEST_EXPO_SETUP"; then
    # より堅牢なUUID処理を追加
    sed -i'.tmp3' 's/ExpoModulesCore.uuid.v4 = uuid.default.v4;/\/\/ Ensure uuid methods are available\nif (uuid) {\n  ExpoModulesCore.uuid = uuid;\n  if (uuid.default && uuid.default.v4) {\n    ExpoModulesCore.uuid.v4 = uuid.default.v4;\n  } else if (uuid.v4) {\n    ExpoModulesCore.uuid.v4 = uuid.v4;\n  } else {\n    ExpoModulesCore.uuid.v4 = () => {\n      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(\/[xy]\/g, function(c) {\n        var r = Math.random() * 16 | 0, v = c == "x" ? r : (r & 0x3 | 0x8);\n        return v.toString(16);\n      });\n    };\n  }\n} else {\n  ExpoModulesCore.uuid = {\n    v4: () => {\n      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(\/[xy]\/g, function(c) {\n        var r = Math.random() * 16 | 0, v = c == "x" ? r : (r & 0x3 | 0x8);\n        return v.toString(16);\n      });\n    }\n  };\n}/' "$JEST_EXPO_SETUP"
    echo "✅ UUID 関連の処理を強化しました"
    
    # 一時ファイルを削除
    rm -f "${JEST_EXPO_SETUP}.tmp3"
  fi

else
  echo "❌ jest-expo のセットアップファイルが見つかりません: $JEST_EXPO_SETUP"
  exit 1
fi

echo "✅ パッチが完了しました！テストを再実行してください。"

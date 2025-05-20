#!/bin/bash
# jest-expoのsetupファイルをパッチして直接修正するスクリプト

JEST_EXPO_SETUP="node_modules/jest-expo/src/preset/setup.js"

echo "🩹 jest-expo のセットアップファイルをパッチします..."

if [ -f "$JEST_EXPO_SETUP" ]; then
  # バックアップを作成
  cp "$JEST_EXPO_SETUP" "${JEST_EXPO_SETUP}.bak"
  echo "✅ バックアップを作成しました: ${JEST_EXPO_SETUP}.bak"
  
  # 問題の行を特定して修正
  STEP1_DONE=false
  if grep -q "globalThis.expo" "$JEST_EXPO_SETUP"; then
    # globalThis.expoが未定義の問題を修正
    sed -i'.tmp1' 's/const { EventEmitter, NativeModule, SharedObject } = globalThis.expo;/\/\/ Ensure globalThis.expo exists\nif (!globalThis.expo) {\n  globalThis.expo = {\n    EventEmitter: class {\n      constructor() {\n        this.listeners = {};\n      }\n      addListener(eventName, listener) {\n        if (!this.listeners[eventName]) {\n          this.listeners[eventName] = [];\n        }\n        this.listeners[eventName].push(listener);\n        return { remove: () => this.removeListener(eventName, listener) };\n      }\n      removeListener(eventName, listener) {\n        if (this.listeners[eventName]) {\n          this.listeners[eventName] = this.listeners[eventName].filter(l => l !== listener);\n        }\n      }\n      removeAllListeners(eventName) {\n        if (eventName) {\n          delete this.listeners[eventName];\n        } else {\n          this.listeners = {};\n        }\n      }\n      emit(eventName, ...args) {\n        if (this.listeners[eventName]) {\n          this.listeners[eventName].forEach(listener => {\n            listener(...args);\n          });\n        }\n      }\n    },\n    NativeModule: class {\n      constructor(name) {\n        this.name = name;\n      }\n    },\n    SharedObject: class {\n      constructor(id) {\n        this.id = id;\n      }\n    }\n  };\n}\nconst { EventEmitter, NativeModule, SharedObject } = globalThis.expo;/' "$JEST_EXPO_SETUP"
    echo "✅ globalThis.expo のモックを追加しました"
    STEP1_DONE=true
    
    # 一時ファイルを削除
    rm -f "${JEST_EXPO_SETUP}.tmp1"
  fi

  # UUID関連の修正
  STEP2_DONE=false
  if grep -q "uuid.v4" "$JEST_EXPO_SETUP"; then
    # UUIDが未定義の問題を修正
    sed -i'.tmp2' 's/ExpoModulesCore.uuid.v4 = uuid.default.v4;/\/\/ Ensure uuid is available\nconst uuid = require("uuid");\nif (!uuid || !uuid.v4) {\n  uuid = {\n    v4: () => {\n      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(\/[xy]\/g, function(c) {\n        var r = Math.random() * 16 | 0, v = c == "x" ? r : (r & 0x3 | 0x8);\n        return v.toString(16);\n      });\n    },\n    default: { v4: () => uuid.v4() }\n  };\n}\nExpoModulesCore.uuid = uuid;\nExpoModulesCore.uuid.v4 = uuid.v4;/' "$JEST_EXPO_SETUP"
    echo "✅ UUID モジュールのモックを追加しました"
    STEP2_DONE=true
    
    # 一時ファイルを削除
    rm -f "${JEST_EXPO_SETUP}.tmp2"
  fi

  if [ "$STEP1_DONE" = false ] && [ "$STEP2_DONE" = false ]; then
    echo "⚠️ 予期しないファイル構造です。手動での確認が必要かもしれません。"
  fi
else
  echo "❌ jest-expo のセットアップファイルが見つかりません: $JEST_EXPO_SETUP"
  exit 1
fi

echo "✅ パッチが完了しました！"

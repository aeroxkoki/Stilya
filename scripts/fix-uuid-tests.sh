#!/bin/bash

echo "🧹 キャッシュクリア..."
# Clean caches
rm -rf node_modules/.cache .expo/cache .metro-cache .jest

echo "🔧 jest-expoのパッチをチェック..."
# Apply patch-package patches if available
if command -v npx > /dev/null && [ -d "patches" ] && [ -f "patches/jest-expo+50.0.0.patch" ]; then
  echo "✅ patch-packageを使用してパッチを適用します..."
  npx patch-package
else
  echo "⚠️ 従来のスクリプトでパッチを適用します..."
  # Run the direct patching script
  chmod +x ./scripts/patch-jest-expo.sh
  ./scripts/patch-jest-expo.sh
fi

# Add debug info
echo "🔍 globalThis.expo確認パッチを追加..."
JEST_EXPO_SETUP="node_modules/jest-expo/src/preset/setup.js"

if [ -f "$JEST_EXPO_SETUP" ]; then
  # Check if globalThis.expo initialization exists
  if ! grep -q "if (!globalThis.expo)" "$JEST_EXPO_SETUP"; then
    # Insert globalThis.expo initialization at line 17 (after window initialization)
    sed -i'' '17i\
// Ensure globalThis.expo exists with proper interfaces for EventEmitter, NativeModule, SharedObject\
if (!globalThis.expo) {\
  globalThis.expo = {\
    EventEmitter: class {\
      constructor() {\
        this.listeners = {};\
      }\
      addListener(eventName, listener) {\
        if (!this.listeners[eventName]) {\
          this.listeners[eventName] = [];\
        }\
        this.listeners[eventName].push(listener);\
        return { remove: () => this.removeListener(eventName, listener) };\
      }\
      removeListener(eventName, listener) {\
        if (this.listeners[eventName]) {\
          this.listeners[eventName] = this.listeners[eventName].filter(l => l !== listener);\
        }\
      }\
      removeAllListeners(eventName) {\
        if (eventName) {\
          delete this.listeners[eventName];\
        } else {\
          this.listeners = {};\
        }\
      }\
      emit(eventName, ...args) {\
        if (this.listeners[eventName]) {\
          this.listeners[eventName].forEach(listener => {\
            listener(...args);\
          });\
        }\
      }\
    },\
    NativeModule: class {\
      constructor(name) {\
        this.name = name || "MockNativeModule";\
      }\
    },\
    SharedObject: class {\
      constructor(id) {\
        this.id = id || "MockSharedObject";\
      }\
    }\
  };\
}\
' "$JEST_EXPO_SETUP"
    echo "✅ globalThis.expoの初期化コードを追加しました"
  else
    echo "✅ globalThis.expoの初期化コードは既に存在します"
  fi
else
  echo "❌ jest-expoのセットアップファイルが見つかりません"
fi

echo "🧪 テスト実行..."
# Run basic tests
echo "Running basic tests..."
npm run test:basic || echo "Basic tests failed but continuing..."

# Run authstore tests 
echo "Running authstore tests..."
npm run test:authstore || echo "Auth tests failed but continuing..."

# Run all other tests
echo "Running other tests..."
npm run test:optional || echo "Optional tests failed but continuing..."


#\!/bin/bash
# direct-patch-jest-expo.sh
# patch-packageを使わずに直接jest-expoをパッチするスクリプト

set -e
echo "🛠️ jest-expoの直接パッチを適用します..."

# jest-expoのsetupファイルのパス
SETUP_FILE="node_modules/jest-expo/src/preset/setup.js"

# ファイルが存在するか確認
if [ \! -f "$SETUP_FILE" ]; then
  echo "⚠️ $SETUP_FILE が見つかりません。jest-expoがインストールされているか確認してください。"
  exit 1
fi

# ファイルのバックアップを作成
cp "$SETUP_FILE" "${SETUP_FILE}.bak"
echo "📁 元のファイルをバックアップしました: ${SETUP_FILE}.bak"

# パッチの内容を直接適用
cat > "$SETUP_FILE" << 'PATCH_CONTENT'
// Jest Expo setup file
// Modified by direct-patch-jest-expo.sh

// Create a window object if it doesn't exist yet
if (typeof window \!== 'object') {
  global.window = global;
  global.window.navigator = {};
}

// Ensure globalThis.expo exists with proper interfaces for EventEmitter, NativeModule, SharedObject
if (\!globalThis.expo) {
  globalThis.expo = {
    EventEmitter: class {
      constructor() {
        this.listeners = {};
      }
      addListener(eventName, listener) {
        if (\!this.listeners[eventName]) {
          this.listeners[eventName] = [];
        }
        this.listeners[eventName].push(listener);
        return { remove: () => this.removeListener(eventName, listener) };
      }
      removeListener(eventName, listener) {
        if (this.listeners[eventName]) {
          this.listeners[eventName] = this.listeners[eventName].filter(l => l \!== listener);
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
if (\!globalThis.ExpoModulesCore) {
  globalThis.ExpoModulesCore = {
    uuid: { 
      v4: () => {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
          var r = Math.random() * 16 | 0, v = c == "x" ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      },
      v5: () => 'mock-uuid-v5' 
    }
  };
}

if (typeof globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__ === 'undefined') {
  // RN 0.74 checks for the __REACT_DEVTOOLS_GLOBAL_HOOK__ on startup if getInspectorDataForViewAtPoint is used
  // React Navigation uses getInspectorDataForViewAtPoint() for improved log box integration in non-production builds
  globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__ = { isDisabled: true };
}

jest.mock('react-native/Libraries/EventEmitter/RCTDeviceEventEmitter', () => ({
  default: {
    addListener: jest.fn(),
    removeListeners: jest.fn(),
  },
}));

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

jest.doMock('expo-modules-core', () => {
  const ExpoModulesCore = jest.requireActual('expo-modules-core');
  const uuid = {
    default: {
      v4: () => {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
          var r = Math.random() * 16 | 0, v = c == "x" ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      },
      v5: () => 'mock-uuid-v5'
    }
  };
  
  const { EventEmitter, NativeModule, SharedObject } = globalThis.expo;
  
  const { NativeModulesProxy } = ExpoModulesCore;
  
  // Mock the `uuid` object with the implementation for web.
  ExpoModulesCore.uuid = ExpoModulesCore.uuid || {};
  ExpoModulesCore.uuid.v4 = uuid.default.v4;
  ExpoModulesCore.uuid.v5 = uuid.default.v5;
  
  // After the NativeModules mock is set up, we can mock NativeModuleProxy's functions that call
  // into the native proxy module. We're not really interested in checking whether the underlying
  // method is called, just that the proxy method is called, since we have unit tests for the
  // adapter and believe it works correctly.
  //
  // NOTE: The adapter validates the number of arguments, which we don't do in the mocked functions.
  // This means the mock functions will not throw validation errors the way they would in an app.
  for (const moduleName of Object.keys(NativeModulesProxy)) {
    const module = NativeModulesProxy[moduleName];
    for (const methodName of Object.keys(module)) {
      const method = module[methodName];
      if (typeof method === 'function') {
        module[methodName] = jest.fn();
      }
    }
  }
  
  return {
    ...ExpoModulesCore,
    NativeModulesProxy,
    EventEmitter,
    NativeModuleProxy: {
      hostFunction: jest.fn(),
      getConstant: jest.fn(),
      getString: jest.fn(() => ''),
      getNumber: jest.fn(() => 0),
      getBoolean: jest.fn(() => false),
      getObject: jest.fn(() => ({})),
      getTypedArray: jest.fn(() => new Uint8Array()),
      addListener: jest.fn(),
      removeListeners: jest.fn(),
      sendEvent: jest.fn(),
    },
    CodedError: ExpoModulesCore.CodedError || class CodedError extends Error {},
    SharedObject,
    NativeModule,
  };
});

for (const builtinModule of ['Permission', 'SharedObject', 'NativeModule', 'PermissionsInterface', 'PermissionsService']) {
  jest.doMock(`expo-modules-core/${builtinModule}`, () => {
    const actual = jest.requireActual(`expo-modules-core/${builtinModule}`);
    return actual;
  });
}

// Force requiring the bare form of RN's render component, as opposed to the native form.
// Jest tests should work with minimal dependencies on native code.
jest.doMock('react-native/Libraries/ReactNative/AppRegistry', () => {
  return jest.requireActual('react-native/Libraries/ReactNative/AppRegistry');
});
PATCH_CONTENT

echo "✅ jest-expoのパッチを直接適用しました"

# uuid用のモックディレクトリ作成
mkdir -p src/__mocks__

# uuidのモックファイル作成
UUID_MOCK="src/__mocks__/uuid.js"
if [ \! -f "$UUID_MOCK" ]; then
  cat > "$UUID_MOCK" << 'UUID_MOCK_CONTENT'
// uuid mock for testing
// Generated by direct-patch-jest-expo.sh

// Simple UUID v4 generator for testing
function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == "x" ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

module.exports = {
  v4: uuidv4,
  v5: () => 'mock-uuid-v5'
};
UUID_MOCK_CONTENT

  echo "✅ UUIDモックファイルを作成しました: $UUID_MOCK"
fi

# patches ディレクトリ内のjest-expoパッチファイルを修正
mkdir -p patches
PATCH_FILE="patches/jest-expo+50.0.0.patch"

# 有効な空パッチファイルを作成（patch-packageが存在確認をするため）
cat > "$PATCH_FILE" << 'EMPTY_PATCH'
diff --git a/node_modules/jest-expo/src/preset/setup.js b/node_modules/jest-expo/src/preset/setup.js
index 00000000..11111111 100644
--- a/node_modules/jest-expo/src/preset/setup.js
+++ b/node_modules/jest-expo/src/preset/setup.js
@@ -1,0 +1,1 @@
+// このパッチファイルは直接パッチスクリプトによって置き換えられました
EMPTY_PATCH

echo "✅ 有効なパッチファイルを作成しました: $PATCH_FILE"
echo "🎉 jest-expoの直接パッチ適用が完了しました！"

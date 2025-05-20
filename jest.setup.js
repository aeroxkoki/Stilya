/**
 * Stilya Jest セットアップファイル
 * Expo SDK 53 / React Native 0.79との互換性対応
 * 更新日: 2025-05-21
 */

// globalThis.expo を事前に設定
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
        this.name = name;
      }
    },
    SharedObject: class {
      constructor(id) {
        this.id = id;
      }
    }
  };
}

// ExpoModulesCoreを設定
if (!globalThis.ExpoModulesCore) {
  globalThis.ExpoModulesCore = {
    uuid: require('./src/__mocks__/uuid'),
  };
}

// expo-modules-core を明示的にモック
jest.mock('expo-modules-core', () => {
  const mockExports = {
    EventEmitter: globalThis.expo.EventEmitter,
    NativeModulesProxy: {},
    Platform: {
      OS: 'web',
      select: jest.fn((obj) => obj.web || obj.default),
    },
    NativeModules: {},
    requireOptionalNativeModule: jest.fn(() => null),
    __esModule: true,
    uuid: require('./src/__mocks__/uuid'),
  };
  return mockExports;
}, { virtual: true });

// expo-modules-core/web 関連のモック
jest.mock('expo-modules-core/web/index.web', () => {
  return {
    EventEmitter: jest.fn(),
    NativeModule: {
      createNativeModuleProxy: jest.fn(),
    },
    SharedObject: {
      create: jest.fn(),
    },
    SharedRef: {
      create: jest.fn(),
    },
    __esModule: true,
  };
}, { virtual: true });

// expo-modules-core/web/CoreModule のモック
jest.mock('expo-modules-core/web/CoreModule', () => {
  return {
    EventEmitter: jest.fn(),
    NativeModule: {
      createNativeModuleProxy: jest.fn(),
    },
    SharedObject: {
      create: jest.fn(),
    },
    SharedRef: {
      create: jest.fn(),
    },
    __esModule: true,
  };
}, { virtual: true });

// New Architecture関連の無効化
global.RN$Bridgeless = false;
global.__DEV__ = true;
global.window = {};

// Reanimatedサポート
global.__reanimatedWorkletInit = jest.fn();
global._WORKLET = false;

// エラーハンドリングの強化
const originalConsoleError = console.error;
console.error = (...args) => {
  // @babel/runtime 関連のエラーを抑制
  if (args[0] && typeof args[0] === 'string' && 
     (args[0].includes('@babel/runtime') || 
      args[0].includes('Cannot find module'))) {
    return;
  }
  originalConsoleError(...args);
};

// PanResponder モック
jest.mock('react-native/Libraries/Interaction/PanResponder', () => ({
  create: jest.fn(() => ({
    panHandlers: {
      onStartShouldSetResponder: jest.fn(),
      onMoveShouldSetResponder: jest.fn(),
      onStartShouldSetResponderCapture: jest.fn(),
      onMoveShouldSetResponderCapture: jest.fn(),
      onResponderGrant: jest.fn(),
      onResponderReject: jest.fn(),
      onResponderMove: jest.fn(),
      onResponderRelease: jest.fn(),
      onResponderTerminationRequest: jest.fn(),
      onResponderTerminate: jest.fn(),
    },
  })),
}), { virtual: true });

// NativeAnimatedHelper モック
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper', () => ({
  API: {
    createAnimatedNode: jest.fn(),
    connectAnimatedNodes: jest.fn(),
    disconnectAnimatedNodes: jest.fn(),
    startAnimatingNode: jest.fn(),
    stopAnimation: jest.fn(),
    setAnimatedNodeValue: jest.fn(),
    createAnimatedComponent: jest.fn(),
  },
  setWaitingForIdentifier: jest.fn(),
  unsetWaitingForIdentifier: jest.fn(),
  disableQueue: jest.fn(),
}), { virtual: true });

// TurboModuleRegistry モック (New Architecture対応)
jest.mock('react-native/Libraries/TurboModule/TurboModuleRegistry', () => {
  const DevMenuMock = {
    reload: jest.fn(),
    debugRemotely: jest.fn(),
    show: jest.fn(),
    hide: jest.fn(),
    devMenu: jest.fn(),
  };
  
  return {
    get: jest.fn((name) => {
      if (name === 'DevMenu') {
        return DevMenuMock;
      }
      return null;
    }),
    getEnforcing: jest.fn((name) => {
      // DevMenu特別処理
      if (name === 'DevMenu') {
        return DevMenuMock;
      }
      // その他のデフォルトモック
      return {
        install: jest.fn(),
        get: jest.fn(),
        getConstantsForViewManager: jest.fn(),
        getViewManagerConfig: jest.fn(),
        then: jest.fn((cb) => cb && cb()),
        catch: jest.fn(),
      };
    }),
  };
}, { virtual: true });

// DevMenu モック
jest.mock('react-native/src/private/specs_DEPRECATED/modules/NativeDevMenu', () => ({
  reload: jest.fn(),
  debugRemotely: jest.fn(),
  devMenu: jest.fn(),
}), { virtual: true });

// React Native関連のモック
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    StyleSheet: {
      create: jest.fn(styles => styles),
      flatten: jest.fn(styles => styles),
    },
    Animated: {
      ...RN.Animated,
      Value: jest.fn(() => ({
        interpolate: jest.fn(() => ({
          interpolate: jest.fn(),
        })),
        setValue: jest.fn(),
        setOffset: jest.fn(),
        flattenOffset: jest.fn(),
        extractOffset: jest.fn(),
        addListener: jest.fn(),
        removeListener: jest.fn(),
        stopAnimation: jest.fn(),
        resetAnimation: jest.fn(),
      })),
      ValueXY: jest.fn(() => ({
        x: new RN.Animated.Value(0),
        y: new RN.Animated.Value(0),
        setValue: jest.fn(),
        setOffset: jest.fn(),
        flattenOffset: jest.fn(),
        extractOffset: jest.fn(),
        addListener: jest.fn(() => 1),
        removeListener: jest.fn(),
        getLayout: jest.fn(() => ({ left: 0, top: 0 })),
        getTranslateTransform: jest.fn(() => []),
        stopAnimation: jest.fn(),
        resetAnimation: jest.fn(),
      })),
      View: jest.fn(({children}) => children),
      Text: jest.fn(({children}) => children),
      Image: jest.fn(({children}) => children),
      createAnimatedComponent: jest.fn(comp => comp),
      timing: jest.fn(() => ({
        start: jest.fn(cb => cb && cb({ finished: true })),
        stop: jest.fn(),
        reset: jest.fn(),
      })),
      spring: jest.fn(() => ({
        start: jest.fn(cb => cb && cb({ finished: true })),
        stop: jest.fn(),
        reset: jest.fn(),
      })),
      decay: jest.fn(() => ({
        start: jest.fn(),
        stop: jest.fn(),
        reset: jest.fn(),
      })),
      sequence: jest.fn(() => ({
        start: jest.fn(),
      })),
      parallel: jest.fn(() => ({
        start: jest.fn(),
      })),
      stagger: jest.fn(() => ({
        start: jest.fn(),
      })),
      loop: jest.fn(() => ({
        start: jest.fn(),
      })),
      delay: jest.fn(() => ({
        start: jest.fn(),
      })),
      add: jest.fn(() => new RN.Animated.Value(0)),
      subtract: jest.fn(() => new RN.Animated.Value(0)),
      divide: jest.fn(() => new RN.Animated.Value(0)),
      multiply: jest.fn(() => new RN.Animated.Value(0)),
      modulo: jest.fn(() => new RN.Animated.Value(0)),
      diffClamp: jest.fn(() => new RN.Animated.Value(0)),
      delay: jest.fn(() => new RN.Animated.Value(0)),
      event: jest.fn(() => jest.fn()),
    },
    Dimensions: {
      get: jest.fn(() => ({ width: 390, height: 844 })),
      addEventListener: jest.fn(() => ({ remove: jest.fn() })),
      removeEventListener: jest.fn(),
    },
    // InteractionManagerのモック
    InteractionManager: {
      runAfterInteractions: jest.fn(callback => {
        if (callback && typeof callback === 'function') {
          callback();
        }
        return { cancel: jest.fn() };
      }),
      createInteractionHandle: jest.fn(() => 1),
      clearInteractionHandle: jest.fn(),
      setDeadline: jest.fn(),
    },
    PanResponder: {
      create: jest.fn(() => ({
        panHandlers: {
          onStartShouldSetResponder: jest.fn(),
          onMoveShouldSetResponder: jest.fn(),
          onStartShouldSetResponderCapture: jest.fn(),
          onMoveShouldSetResponderCapture: jest.fn(),
          onResponderGrant: jest.fn(),
          onResponderReject: jest.fn(),
          onResponderMove: jest.fn(),
          onResponderRelease: jest.fn(),
          onResponderTerminationRequest: jest.fn(),
          onResponderTerminate: jest.fn(),
        },
      })),
    },
    LayoutAnimation: {
      configureNext: jest.fn(),
      create: jest.fn(),
      Types: {},
      Properties: {},
      checkConfig: jest.fn(),
      Presets: {
        easeInEaseOut: {},
        linear: {},
        spring: {},
      },
    },
    TurboModuleRegistry: {
      get: jest.fn((name) => {
        if (name === 'DevMenu') {
          return {
            reload: jest.fn(),
            debugRemotely: jest.fn(),
            show: jest.fn(),
            hide: jest.fn(),
            devMenu: jest.fn(),
          };
        }
        return null;
      }),
      getEnforcing: jest.fn((name) => {
        if (name === 'DevMenu') {
          return {
            reload: jest.fn(),
            debugRemotely: jest.fn(),
            show: jest.fn(),
            hide: jest.fn(),
            devMenu: jest.fn(),
          };
        }
        return {
          install: jest.fn(),
          get: jest.fn(),
          getConstantsForViewManager: jest.fn(),
          getViewManagerConfig: jest.fn(),
          then: jest.fn((cb) => cb && cb()),
          catch: jest.fn(),
        };
      }),
    },
  };
});

// Asyncストレージのモック
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve(null)),
  clear: jest.fn(() => Promise.resolve(null)),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve(null)),
  multiRemove: jest.fn(() => Promise.resolve(null)),
}));

// Reanimated のモック
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

// NetInfo のモック
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  fetch: jest.fn(() => Promise.resolve({ isConnected: true, isInternetReachable: true })),
}));

// Expoアイコンのモック
jest.mock('@expo/vector-icons', () => ({
  Feather: 'Feather',
  MaterialIcons: 'MaterialIcons',
  Ionicons: 'Ionicons',
  FontAwesome: 'FontAwesome',
  FontAwesome5: 'FontAwesome5',
  AntDesign: 'AntDesign',
}));

// Expo Image モック
jest.mock('expo-image', () => ({
  Image: {
    prefetch: jest.fn(() => Promise.resolve(true)),
    clearMemoryCache: jest.fn(() => Promise.resolve()),
    clearDiskCache: jest.fn(() => Promise.resolve()),
  },
  ImageBackground: jest.fn(({children}) => children),
  ImageProgress: jest.fn(({children}) => children),
}));

// テスト環境の設定
global.__DEV__ = true;
global.window = {};
global.__reanimatedWorkletInit = jest.fn();
global._WORKLET = false;

// New Architecture関連の設定
global.RN$Bridgeless = false;
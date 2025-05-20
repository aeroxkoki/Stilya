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

// テスト環境の設定
global.__DEV__ = true;
global.window = {};
global.__reanimatedWorkletInit = jest.fn();
global._WORKLET = false;
// AsyncStorage のモック設定
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve(null)),
    removeItem: jest.fn(() => Promise.resolve(null)),
    multiGet: jest.fn(() => Promise.resolve([])),
    multiSet: jest.fn(() => Promise.resolve(null)),
    multiRemove: jest.fn(() => Promise.resolve(null)),
    getAllKeys: jest.fn(() => Promise.resolve([])),
    clear: jest.fn(() => Promise.resolve(null)),
  },
}));

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

// Reanimated の設定
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

// NetInfo モック
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(() => jest.fn()),
  fetch: jest.fn(() => Promise.resolve({ isConnected: true, isInternetReachable: true })),
}));

// React 関連のモック
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  RN.NativeModules = {
    ...RN.NativeModules,
    UIManager: {
      RCTView: {},
      createView: jest.fn(),
      updateView: jest.fn(),
      getViewManagerConfig: jest.fn(() => ({ Commands: {} })),
    },
  };
  
  // Image コンポーネントのモック
  RN.Image = jest.fn(({ testID, source, onLoad }) => {
    if (onLoad) {
      setTimeout(() => {
        onLoad({ nativeEvent: { source: { width: 100, height: 100 } } });
      }, 10);
    }
    return {
      type: 'Image',
      props: { testID, source }
    };
  });
  
  return RN;
});

// Expo Image モック
jest.mock('expo-image', () => {
  const { View } = jest.requireActual('react-native');
  return {
    Image: jest.fn(props => ({
      type: 'ExpoImage',
      props: {
        ...props,
        testID: 'expo-image'
      }
    }))
  };
});

// グローバル設定
global.__reanimatedWorkletInit = jest.fn();
global._WORKLET = false;
global.window = {};
global.__DEV__ = true;
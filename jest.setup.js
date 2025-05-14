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
  
  return {
    ...RN,
    NativeModules: {
      ...RN.NativeModules,
      UIManager: {
        RCTView: {},
        createView: jest.fn(),
        updateView: jest.fn(),
        getViewManagerConfig: jest.fn(() => ({ Commands: {} })),
      },
      DevMenu: {
        reload: jest.fn(),
        debugRemotely: jest.fn(),
        devMenu: jest.fn(),
      },
      StatusBarManager: {
        getHeight: jest.fn(),
        setStyle: jest.fn(),
        setHidden: jest.fn(),
      },
      BlobModule: {
        ...RN.NativeModules?.BlobModule,
        addNetworkingHandler: jest.fn(),
        createFromParts: jest.fn(),
        release: jest.fn(),
      },
      ImageLoader: {
        getSize: jest.fn((uri, success) => success(100, 100)),
        prefetchImage: jest.fn(),
      },
      RNGestureHandlerModule: {
        attachGestureHandler: jest.fn(),
        createGestureHandler: jest.fn(),
        dropGestureHandler: jest.fn(),
        updateGestureHandler: jest.fn(),
        State: {},
        Directions: {},
      },
    },
    PanResponder: {
      create: jest.fn(() => ({
        panHandlers: {},
      })),
    },
    Animated: {
      ...RN.Animated,
      Value: jest.fn(() => ({
        interpolate: jest.fn(),
        setValue: jest.fn(),
        setOffset: jest.fn(),
        addListener: jest.fn(),
        removeListener: jest.fn(),
        extractOffset: jest.fn(),
        flattenOffset: jest.fn(),
      })),
      timing: jest.fn(() => ({
        start: jest.fn(cb => cb && cb()),
      })),
      spring: jest.fn(() => ({
        start: jest.fn(cb => cb && cb()),
      })),
      decay: jest.fn(() => ({
        start: jest.fn(cb => cb && cb()),
      })),
      sequence: jest.fn(() => ({
        start: jest.fn(cb => cb && cb()),
      })),
      parallel: jest.fn(() => ({
        start: jest.fn(cb => cb && cb()),
      })),
      event: jest.fn(() => jest.fn()),
      add: jest.fn(),
      multiply: jest.fn(),
      divide: jest.fn(),
      modulo: jest.fn(),
      diffClamp: jest.fn(),
    },
    // Image コンポーネントのモック
    Image: jest.fn(({ testID, source, onLoad }) => {
      if (onLoad) {
        setTimeout(() => {
          onLoad({ nativeEvent: { source: { width: 100, height: 100 } } });
        }, 10);
      }
      return {
        type: 'Image',
        props: { testID, source }
      };
    }),
    Dimensions: {
      get: jest.fn().mockImplementation((dim) => {
        if (dim === 'window' || dim === 'screen') {
          return { width: 390, height: 844, scale: 2, fontScale: 1 };
        }
        return { width: 390, height: 844 };
      }),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    },
    // タイマー関連
    InteractionManager: {
      runAfterInteractions: jest.fn(cb => cb && cb()),
      createInteractionHandle: jest.fn(),
      clearInteractionHandle: jest.fn(),
      setDeadline: jest.fn(),
    },
  };
});

// Expoアイコンのモック
jest.mock('@expo/vector-icons', () => {
  const { View } = jest.requireActual('react-native');
  return {
    Feather: jest.fn(props => ({
      type: 'Feather',
      props: {
        ...props,
        testID: 'feather-icon'
      }
    })),
    MaterialIcons: jest.fn(props => ({
      type: 'MaterialIcons',
      props: {
        ...props,
        testID: 'material-icon'
      }
    })),
    Ionicons: jest.fn(props => ({
      type: 'Ionicons',
      props: {
        ...props,
        testID: 'ionicons-icon'
      }
    })),
    FontAwesome: jest.fn(props => ({
      type: 'FontAwesome',
      props: {
        ...props,
        testID: 'fontawesome-icon'
      }
    })),
    FontAwesome5: jest.fn(props => ({
      type: 'FontAwesome5',
      props: {
        ...props,
        testID: 'fontawesome5-icon'
      }
    })),
    AntDesign: jest.fn(props => ({
      type: 'AntDesign',
      props: {
        ...props,
        testID: 'antdesign-icon'
      }
    })),
  };
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
// テスト環境用のSupabase設定
process.env.SUPABASE_URL = 'https://ddypgpljprljqrblpuli.supabase.co';
process.env.SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkeXBncGxqcHJsanFyYmxwdWxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxMDMwOTcsImV4cCI6MjA2MjY3OTA5N30.u4310NL9FYdxcMSrGxEzEXP0M5y5pDuG3_mz7IRAhMU';
process.env.LINKSHARE_API_TOKEN = 'test-linkshare-token';
process.env.LINKSHARE_MERCHANT_ID = 'test-merchant-id';
process.env.RAKUTEN_APP_ID = 'test-rakuten-app-id';
process.env.RAKUTEN_AFFILIATE_ID = 'test-rakuten-affiliate-id';

// @testing-library/jest-native のモック
jest.mock('@testing-library/jest-native', () => ({
  ...jest.requireActual('@testing-library/jest-native'),
  'toBeVisible': jest.fn().mockReturnValue(true),
}));

// @testing-library/jest-native/extend-expect のモック
jest.mock('@testing-library/jest-native/extend-expect', () => ({
  ...jest.requireActual('@testing-library/jest-native/extend-expect'),
}));

// グローバル関数のセットアップ
// analyzeUserPreferences関数のモック
global.analyzeUserPreferences = jest.fn().mockResolvedValue({
  userId: 'test-user-123',
  tagScores: { 'casual': 2.0, 'cotton': 1.5, 'formal': 1.0 },
  topTags: ['casual', 'cotton', 'formal']
});

// グローバル設定
global.__reanimatedWorkletInit = jest.fn();
global._WORKLET = false;
global.window = {};
global.__DEV__ = true;
// jest.setup.js
// This file configures necessary mocks before jest-expo's setup runs

// Required globals
global.window = {};
global.__DEV__ = true;

// Mock Reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  // The mock for `call` immediately calls the callback with an empty first argument 
  // which is not how the Reanimated call() behaves. Fix it to preserve the call stack.
  Reanimated.default.call = function(cb) {
    return cb(null);
  };
  return Reanimated;
});

// Mock NativeModules before they are used
jest.mock('react-native', () => {
  const reactNative = jest.requireActual('react-native');
  
  // Extend NativeModules for animations and gesture handling
  reactNative.NativeModules = {
    ...reactNative.NativeModules,
    UIManager: {
      ...reactNative.NativeModules.UIManager,
      RCTView: {},
      createView: jest.fn(),
      updateView: jest.fn(),
      getViewManagerConfig: jest.fn(() => ({ Commands: {} })),
    },
    RNGestureHandlerModule: {
      State: { BEGAN: 'BEGAN', ACTIVE: 'ACTIVE', END: 'END' },
      attachGestureHandler: jest.fn(),
      createGestureHandler: jest.fn(),
      dropGestureHandler: jest.fn(),
      updateGestureHandler: jest.fn(),
    },
    ReanimatedModule: {
      installTurboModule: jest.fn(),
    },
    PlatformConstants: {
      forceTouchAvailable: false,
    },
    I18nManager: {
      localeIdentifier: 'en_US',
    },
    DevSettings: {
      reload: jest.fn(),
    },
    DeviceInfo: {
      getConstants: jest.fn(() => ({})),
    },
    ExpoModulesCore: {
      createViewForNativeId: jest.fn(),
    },
  };
  
  return reactNative;
});

// Mock Expo modules
jest.mock('expo-status-bar', () => ({
  StatusBar: jest.fn(() => null),
}));

jest.mock('expo-font', () => ({
  useFonts: () => [true, null],
  loadAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  setItemAsync: jest.fn(() => Promise.resolve(null)),
  deleteItemAsync: jest.fn(() => Promise.resolve(null)),
}));

jest.mock('expo-application', () => ({
  applicationId: 'test.expo.app',
  applicationName: 'TestApp',
  nativeApplicationVersion: '1.0.0',
  nativeBuildVersion: '1',
}));

jest.mock('expo-device', () => ({
  isDevice: true,
  brand: 'Apple',
  manufacturer: 'Apple',
  modelName: 'iPhone 13',
  deviceYearClass: 2021,
  totalMemory: 6144,
  osName: 'iOS',
  osVersion: '16.0',
}));

// Mock react-native modules
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native').View;
  return {
    Swipeable: View,
    DrawerLayout: View,
    GestureHandlerRootView: View,
    State: {},
    ScrollView: View,
    PanGestureHandler: View,
    TapGestureHandler: View,
    TouchableOpacity: View,
    PinchGestureHandler: View,
    createNativeWrapper: jest.fn(() => View),
  };
});

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve(null)),
  clear: jest.fn(() => Promise.resolve(null)),
}));

jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(() => jest.fn()),
  fetch: jest.fn(() => Promise.resolve({
    isConnected: true,
    isInternetReachable: true,
  })),
}));

// Add Navigation Mocks
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    reset: jest.fn(),
    setParams: jest.fn(),
    addListener: jest.fn(() => jest.fn()),
    removeListener: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
  useFocusEffect: jest.fn((callback) => {
    callback();
    return jest.fn();
  }),
}));

// Mock @supabase/supabase-js
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signInWithPassword: jest.fn(() => Promise.resolve({ data: {}, error: null })),
      signUp: jest.fn(() => Promise.resolve({ data: {}, error: null })),
      signOut: jest.fn(() => Promise.resolve({ error: null })),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
      getSession: jest.fn(() => Promise.resolve({ data: { session: null }, error: null })),
      getUser: jest.fn(() => Promise.resolve({ data: { user: null }, error: null })),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          data: [],
          error: null,
        })),
        data: [],
        error: null,
      })),
      insert: jest.fn(() => Promise.resolve({ data: {}, error: null })),
      update: jest.fn(() => Promise.resolve({ data: {}, error: null })),
      delete: jest.fn(() => Promise.resolve({ data: {}, error: null })),
    })),
  })),
}));

// Silence warnings for NativeAnimated
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock NativeWind
jest.mock('nativewind', () => ({
  styled: (component) => component,
}));

// Mock react-native-toast-message
jest.mock('react-native-toast-message', () => ({
  show: jest.fn(),
  hide: jest.fn(),
}));

// Handle custom dimensions for testing
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  
  // Override the Dimensions to provide test values
  RN.Dimensions.get = jest.fn().mockImplementation((dim) => {
    if (dim === 'window' || dim === 'screen') {
      return { width: 390, height: 844, scale: 2, fontScale: 1 };
    }
    return jest.requireActual('react-native').Dimensions.get(dim);
  });
  
  return RN;
});

// Make sure we have a properly mocked Image component
const MockImage = ({source, style, onLoad, onError, testID}) => {
  const sourceUri = source && source.uri ? source.uri : (typeof source === 'string' ? source : undefined);
  
  // Simulate load event after a small timeout
  if (onLoad) {
    setTimeout(() => {
      onLoad({ nativeEvent: { source: { width: 100, height: 100 } } });
    }, 10);
  }
  
  return jest.requireActual('react-native').View;
};

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  RN.Image = MockImage;
  return RN;
});

// Mock Expo Image component
jest.mock('expo-image', () => ({
  Image: require('react-native').View,
  ImageBackground: require('react-native').View,
  ContentFit: {
    COVER: 'cover',
    CONTAIN: 'contain',
    FILL: 'fill',
    NONE: 'none',
    SCALE_DOWN: 'scale-down',
  },
}));

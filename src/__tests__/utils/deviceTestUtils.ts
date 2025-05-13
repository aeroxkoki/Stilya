import { Dimensions, Platform, AccessibilityInfo, NativeModules } from 'react-native';

// デバイス形状のモックタイプ
type DeviceShape = {
  width: number;
  height: number;
  scale: number;
  fontScale: number;
  platform: 'ios' | 'android';
  isTablet: boolean;
  notchHeight: number;
  isRTL: boolean;
  isScreenReaderEnabled: boolean;
};

// 一般的なデバイスのプリセット
const devicePresets: Record<string, DeviceShape> = {
  // iPhones
  'iphone-se': {
    width: 375,
    height: 667,
    scale: 2,
    fontScale: 1,
    platform: 'ios',
    isTablet: false,
    notchHeight: 0,
    isRTL: false,
    isScreenReaderEnabled: false,
  },
  'iphone-13-mini': {
    width: 375,
    height: 812,
    scale: 3,
    fontScale: 1,
    platform: 'ios',
    isTablet: false,
    notchHeight: 44,
    isRTL: false,
    isScreenReaderEnabled: false,
  },
  'iphone-14-plus': {
    width: 428,
    height: 926,
    scale: 3,
    fontScale: 1,
    platform: 'ios',
    isTablet: false,
    notchHeight: 47,
    isRTL: false,
    isScreenReaderEnabled: false,
  },
  'iphone-14-pro-max': {
    width: 430,
    height: 932,
    scale: 3,
    fontScale: 1,
    platform: 'ios',
    isTablet: false,
    notchHeight: 54, // Dynamic Island
    isRTL: false,
    isScreenReaderEnabled: false,
  },

  // Androids
  'android-small': {
    width: 360,
    height: 640,
    scale: 2,
    fontScale: 1,
    platform: 'android',
    isTablet: false,
    notchHeight: 0,
    isRTL: false,
    isScreenReaderEnabled: false,
  },
  'android-medium': {
    width: 412,
    height: 892,
    scale: 2.6,
    fontScale: 1,
    platform: 'android',
    isTablet: false,
    notchHeight: 32,
    isRTL: false,
    isScreenReaderEnabled: false,
  },
  'android-large': {
    width: 432,
    height: 936,
    scale: 2.8,
    fontScale: 1,
    platform: 'android',
    isTablet: false,
    notchHeight: 32,
    isRTL: false,
    isScreenReaderEnabled: false,
  },

  // Tablets
  'ipad': {
    width: 834,
    height: 1194,
    scale: 2,
    fontScale: 1,
    platform: 'ios',
    isTablet: true,
    notchHeight: 0,
    isRTL: false,
    isScreenReaderEnabled: false,
  },
  'android-tablet': {
    width: 800,
    height: 1280,
    scale: 1.5,
    fontScale: 1,
    platform: 'android',
    isTablet: true,
    notchHeight: 0,
    isRTL: false,
    isScreenReaderEnabled: false,
  },

  // アクセシビリティ設定
  'large-font': {
    width: 375,
    height: 812,
    scale: 2,
    fontScale: 1.6, // 大きいフォントサイズ
    platform: 'ios',
    isTablet: false,
    notchHeight: 44,
    isRTL: false,
    isScreenReaderEnabled: false,
  },
  'rtl-device': {
    width: 375,
    height: 812,
    scale: 2,
    fontScale: 1,
    platform: 'ios',
    isTablet: false,
    notchHeight: 44,
    isRTL: true, // 右から左への表示
    isScreenReaderEnabled: false,
  },
  'screen-reader': {
    width: 375,
    height: 812,
    scale: 2,
    fontScale: 1,
    platform: 'ios',
    isTablet: false,
    notchHeight: 44,
    isRTL: false,
    isScreenReaderEnabled: true, // スクリーンリーダー有効
  },
};

// 元のディメンション・プラットフォーム設定を保存
let originalDimensions: { width: number; height: number; scale: number; fontScale: number };
let originalPlatform: any;
let originalI18nManager: { isRTL: boolean };
let originalIsScreenReaderEnabled: boolean = false;

/**
 * デバイスの形状をモックする関数
 * @param deviceName デバイスプリセット名、またはカスタム設定オブジェクト
 */
export const mockDeviceShape = (deviceNameOrShape: string | Partial<DeviceShape>): void => {
  // 元の設定を保存
  if (!originalDimensions) {
    originalDimensions = {
      width: Dimensions.get('window').width,
      height: Dimensions.get('window').height,
      scale: Dimensions.get('window').scale,
      fontScale: Dimensions.get('window').fontScale,
    };
    originalPlatform = { ...Platform };
    originalI18nManager = { isRTL: NativeModules.I18nManager?.isRTL || false };
    AccessibilityInfo.isScreenReaderEnabled().then(enabled => {
      originalIsScreenReaderEnabled = enabled;
    });
  }

  // デバイス設定を取得
  let deviceShape: DeviceShape;
  if (typeof deviceNameOrShape === 'string') {
    const presetName = deviceNameOrShape as string;
    if (!devicePresets[presetName]) {
      throw new Error(`デバイスプリセット "${presetName}" が見つかりません。`);
    }
    deviceShape = devicePresets[presetName];
  } else {
    deviceShape = { ...devicePresets['iphone-13-mini'], ...deviceNameOrShape };
  }

  // Dimensionsのモック
  const mockDimensions = {
    window: {
      width: deviceShape.width,
      height: deviceShape.height,
      scale: deviceShape.scale,
      fontScale: deviceShape.fontScale,
    },
    screen: {
      width: deviceShape.width,
      height: deviceShape.height,
      scale: deviceShape.scale,
      fontScale: deviceShape.fontScale,
    },
  };

  // Dimensions.getをモック
  jest.spyOn(Dimensions, 'get').mockImplementation((dim: 'window' | 'screen') => mockDimensions[dim]);

  // Platformのモック
  jest.spyOn(Platform, 'OS', 'get').mockImplementation(() => deviceShape.platform);
  jest.spyOn(Platform, 'isPad', 'get').mockImplementation(() => deviceShape.isTablet);

  // SafeAreaのモック（ノッチの高さを考慮）
  if (deviceShape.platform === 'ios' && deviceShape.notchHeight > 0) {
    NativeModules.RNCSafeAreaProvider = {
      initialWindowMetrics: {
        insets: {
          top: deviceShape.notchHeight,
          bottom: 34, // ホームインジケーターエリア（iPhone X以降）
          left: 0,
          right: 0,
        },
      },
    };
  } else {
    NativeModules.RNCSafeAreaProvider = {
      initialWindowMetrics: {
        insets: {
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
        },
      },
    };
  }

  // RTL設定のモック
  NativeModules.I18nManager = {
    ...NativeModules.I18nManager,
    isRTL: deviceShape.isRTL,
  };

  // スクリーンリーダー設定のモック
  jest.spyOn(AccessibilityInfo, 'isScreenReaderEnabled').mockImplementation(
    () => Promise.resolve(deviceShape.isScreenReaderEnabled)
  );
};

/**
 * モックを元の設定に戻す
 */
export const resetDeviceMock = (): void => {
  if (originalDimensions) {
    jest.spyOn(Dimensions, 'get').mockRestore();
    
    // Platformのモックを復元
    jest.spyOn(Platform, 'OS', 'get').mockRestore();
    jest.spyOn(Platform, 'isPad', 'get').mockRestore();
    
    // RTL設定を復元
    NativeModules.I18nManager = {
      ...NativeModules.I18nManager,
      isRTL: originalI18nManager.isRTL,
    };
    
    // スクリーンリーダー設定を復元
    jest.spyOn(AccessibilityInfo, 'isScreenReaderEnabled').mockImplementation(
      () => Promise.resolve(originalIsScreenReaderEnabled)
    );
    
    originalDimensions = undefined;
  }
};

/**
 * 横向き（ランドスケープ）画面をモック
 * @param deviceName デバイスプリセット名
 */
export const mockLandscapeOrientation = (deviceName: string = 'iphone-13-mini'): void => {
  const device = devicePresets[deviceName];
  if (!device) {
    throw new Error(`デバイスプリセット "${deviceName}" が見つかりません。`);
  }
  
  // 幅と高さを入れ替えて横向きに
  mockDeviceShape({
    ...device,
    width: device.height,
    height: device.width,
  });
};

/**
 * 指定したデバイスでのスナップショットテストを実行する
 * @param component テスト対象のコンポーネント
 * @param devices テストするデバイスプリセット名の配列
 */
export const testOnMultipleDevices = (
  component: React.ReactElement,
  devices: string[] = ['iphone-se', 'iphone-14-plus', 'android-medium', 'ipad']
): void => {
  devices.forEach(deviceName => {
    it(`renders correctly on ${deviceName}`, () => {
      mockDeviceShape(deviceName);
      
      // ここでスナップショットテストを実行
      const tree = renderer.create(component).toJSON();
      expect(tree).toMatchSnapshot();
      
      resetDeviceMock();
    });
  });
};

// エクスポート
export default {
  mockDeviceShape,
  resetDeviceMock,
  mockLandscapeOrientation,
  testOnMultipleDevices,
  devicePresets,
};

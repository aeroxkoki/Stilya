/**
 * jest-expo のセットアップファイルをパッチするためのカスタムスクリプト
 * Expo SDK 53 / Jest環境のために作成
 */

// 必要なモックエクスポートを行う
const expoModulesCore = require('./expo-modules-core/index');

// グローバル変数を設定
if (!global.expo) {
  global.expo = {
    EventEmitter: expoModulesCore.EventEmitter,
    NativeModule: expoModulesCore.NativeModule,
    SharedObject: expoModulesCore.SharedObject,
  };
}

// React Nativeのモックを行う
global.__DEV__ = true;
global.performance = global.performance || {
  now: () => Date.now(),
};
global.HermesInternal = null;
global.window = global;

// モック化が必要なReact Nativeコンポーネント
jest.mock('react-native/Libraries/Components/View/ViewNativeComponent', () => {
  return {
    default: { uiViewClassName: 'RCTView' },
  };
});

// expo関連のモック
jest.mock('expo-modules-core', () => require('./expo-modules-core/index'));
jest.mock('expo-modules-core/web', () => require('./expo-modules-core/web/index.web'));
jest.mock('expo-modules-core/web/CoreModule', () => require('./expo-modules-core/web/CoreModule'));

// グローバルオブジェクトの設定
globalThis.expo = global.expo;

// モジュールをエクスポート
module.exports = {
  // モックコンポーネント
  mockComponent: name => props => {
    return {
      ...props,
      type: name,
    };
  },
};

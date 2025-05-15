/**
 * React Nativeのjest/setup.jsをモックするファイル
 * Object.defineProperty called on non-objectエラーを解決
 */

// safe mockオブジェクトを作成
const mockSetup = {
  // 基本メソッド
  mockComponent: function() { return {}; },
  mockFunction: function() { return function() {}; },
  
  // テスト用メソッド
  unmock: function() {},
  mock: function() {},
  
  // プロパティアクセスに安全な対応
  get AccessibilityInfo() { return {}; },
  get Alert() { return {}; },
  get Animated() { return {}; },
  get AppRegistry() { return {}; },
  get AppState() { return {}; },
  get AsyncStorage() { return {}; },
  get BackHandler() { return {}; },
  get Dimensions() { return {}; },
  get Image() { return {}; },
  get Linking() { return {}; },
  get NativeModules() { return {}; },
  get Platform() { return { OS: 'ios', select: () => {} }; },
  get StyleSheet() { return { create: () => ({}) }; },
  get Text() { return {}; },
  get TouchableOpacity() { return {}; },
  get View() { return {}; },
  
  // その他必要なプロパティやメソッド
  createMockComponent: function() { return function() { return null; }; }
};

// デフォルトエクスポート
module.exports = mockSetup;

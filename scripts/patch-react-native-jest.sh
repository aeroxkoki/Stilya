#\!/bin/bash
# React Native Jest setup.jsファイルを直接パッチするスクリプト
# Expo SDK 53 / React Native 0.79用
# 最終更新: 2025-05-21

set -e
echo "🩹 React Native Jest setupファイルをパッチします..."

# react-native/jest/setup.jsファイルのパス
SETUP_FILE="node_modules/react-native/jest/setup.js"

if [ -f "$SETUP_FILE" ]; then
  echo "✅ React Native Jest setupファイルを検出しました: $SETUP_FILE"
  
  # ファイルのバックアップを作成
  cp "$SETUP_FILE" "${SETUP_FILE}.bak"
  echo "📦 オリジナルファイルをバックアップしました: ${SETUP_FILE}.bak"
  
  # 直接ファイルを修正（ESM importをCommonJSに変換）
  echo "🔧 ESM importをCommonJSに変換しています..."
  sed -i.temp 's/import \([A-Za-z_]*\) from \([@A-Za-z0-9/_.-]*\);/const \1 = require(\2);/g' "$SETUP_FILE"
  rm -f "${SETUP_FILE}.temp"
  
  # export defaultをmodule.exportsに変換
  echo "🔧 export defaultをmodule.exportsに変換しています..."
  sed -i.temp 's/export default \([A-Za-z_]*\);/module.exports = \1;/g' "$SETUP_FILE"
  rm -f "${SETUP_FILE}.temp"
  
  # named exportsを処理
  echo "🔧 named exportsを処理しています..."
  sed -i.temp 's/export { \([A-Za-z_, ]*\) };/module.exports = { \1 };/g' "$SETUP_FILE"
  rm -f "${SETUP_FILE}.temp"
  
  # ESM importとexportsの冒頭に検出用コメントを追加
  echo "🔍 未変換のimport/export文をチェック中..."
  grep -n "import " "$SETUP_FILE" || echo "✅ すべてのimport文が変換されました"
  grep -n "export " "$SETUP_FILE" || echo "✅ すべてのexport文が変換されました"
  
  echo "✅ React Native Jest setupファイルのパッチが完了しました！"
else
  echo "⚠️ React Native Jest setupファイルが見つかりません: $SETUP_FILE"
  echo "🔍 node_modules以下のsetup.jsファイルを検索中..."
  find node_modules -name "setup.js" | grep -i jest
  
  # モックファイルを作成
  echo "📦 モックsetupファイルを作成します..."
  mkdir -p "src/__mocks__/react-native/jest"
  cat > "src/__mocks__/react-native/jest/setup.js" << 'MOCK_EOF'
/**
 * React Native Jest setup.js のモック
 * ESM構文をCommonJSに変換したバージョン
 * Expo SDK 53 / React Native 0.79互換
 * 作成日: 2025-05-21
 */

'use strict';

// CommonJS形式でヘルパーをインポート
const _classCallCheck = require('@babel/runtime/helpers/classCallCheck');
const _createClass = require('@babel/runtime/helpers/createClass');
const _defineProperty = require('@babel/runtime/helpers/defineProperty');
const _extends = require('@babel/runtime/helpers/extends');
const _inherits = require('@babel/runtime/helpers/inherits');
const _possibleConstructorReturn = require('@babel/runtime/helpers/possibleConstructorReturn');
const _getPrototypeOf = require('@babel/runtime/helpers/getPrototypeOf');
const _objectWithoutProperties = require('@babel/runtime/helpers/objectWithoutProperties');
const _toConsumableArray = require('@babel/runtime/helpers/toConsumableArray');

// モックコンポーネント生成用ヘルパー
function mockComponent(moduleName) {
  const React = require('react');
  function Component(props) {
    _classCallCheck(this, Component);
    return React.createElement(moduleName, props, props.children);
  }
  
  Component.displayName = moduleName;
  return Component;
}

// 基本的なモジュールモック
const stylesModule = {
  create: jest.fn(styles => styles),
  flatten: jest.fn(styles => styles),
};

const animatedModule = {
  View: mockComponent('AnimatedView'),
  Text: mockComponent('AnimatedText'),
  Image: mockComponent('AnimatedImage'),
  createAnimatedComponent: jest.fn(component => component),
  timing: jest.fn(() => ({ start: jest.fn() })),
  spring: jest.fn(() => ({ start: jest.fn() })),
  add: jest.fn(),
  multiply: jest.fn(),
  Value: jest.fn(() => ({
    setValue: jest.fn(),
    setOffset: jest.fn(),
    interpolate: jest.fn(() => ({ interpolate: jest.fn() })),
    addListener: jest.fn(),
    removeListener: jest.fn(),
    stopAnimation: jest.fn(),
  })),
};

// エクスポート
module.exports = {
  // ヘルパー関数
  _classCallCheck,
  _createClass,
  _defineProperty,
  _extends,
  _inherits,
  _possibleConstructorReturn,
  _getPrototypeOf,
  _objectWithoutProperties,
  _toConsumableArray,
  
  // コンポーネントビルダー
  mockComponent,
  
  // モックコンポーネント
  Text: mockComponent('Text'),
  View: mockComponent('View'),
  Image: mockComponent('Image'),
  ScrollView: mockComponent('ScrollView'),
  FlatList: mockComponent('FlatList'),
  
  // モジュール
  StyleSheet: stylesModule,
  Animated: animatedModule,
  
  // その他の追加モック
  Platform: { OS: 'ios', select: jest.fn(obj => obj.ios) },
  I18nManager: { isRTL: false, getConstants: () => ({ isRTL: false }) },
};
MOCK_EOF
  echo "✅ モックsetupファイルを作成しました: src/__mocks__/react-native/jest/setup.js"
fi

# jest.configでモックを確実に使用するようにする
echo "🔧 jest.config.jsを更新してモックを確実に使用するようにします..."
JEST_CONFIG="jest.config.js"

if grep -q "'react-native/jest/setup'" "$JEST_CONFIG"; then
  echo "✅ jest.config.jsはすでに設定されています"
else
  echo "⚠️ jest.config.jsに'react-native/jest/setup'のマッピングがありません。追加してください。"
  echo "例: 'react-native/jest/setup': '<rootDir>/src/__mocks__/react-native-jest-setup.js',"
fi

# テスト環境を設定
echo "🧪 テスト環境変数を設定しています..."
export NODE_ENV=test
export BABEL_ENV=test

echo "🎉 React Native Jest setupパッチが完了しました！"

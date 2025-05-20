/**
 * React Native jest/setup.js のCommonJS版モック
 * ESMからCJSに変換することでテスト時のエラーを回避します
 * Expo SDK 53 / React Native 0.79に対応
 */

'use strict';

// @babel/runtimeのヘルパーをrequireで置き換え
// モジュールを直接requireすることでESMの問題を回避
let _classCallCheck, _createClass, _defineProperty, _inherits, _possibleConstructorReturn, _getPrototypeOf;

try {
  _classCallCheck = require('@babel/runtime/helpers/classCallCheck');
  _createClass = require('@babel/runtime/helpers/createClass');
  _defineProperty = require('@babel/runtime/helpers/defineProperty');
  _inherits = require('@babel/runtime/helpers/inherits');
  _possibleConstructorReturn = require('@babel/runtime/helpers/possibleConstructorReturn');
  _getPrototypeOf = require('@babel/runtime/helpers/getPrototypeOf');
} catch (error) {
  // フォールバック実装
  _classCallCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };
  _createClass = function() { return { key: function() {} }; };
  _defineProperty = function(obj, key, value) { obj[key] = value; return obj; };
  _inherits = function(subClass, superClass) { };
  _possibleConstructorReturn = function(self, call) { return self; };
  _getPrototypeOf = function(o) { return o; };
}

// React Nativeのネイティブコンポーネントモック
function _createSuper(Derived) {
  return function () {
    var Super = _getPrototypeOf(Derived);
    return _possibleConstructorReturn(this, Super.apply(this, arguments));
  };
}

// 基本的なコンポーネントモック
function mockComponent(moduleName) {
  const RealComponent = jest.requireActual(moduleName);
  const React = jest.requireActual('react');

  const Component = function Component(props) {
    _classCallCheck(this, Component);
    return React.createElement(moduleName, props, props.children);
  };

  Component.displayName = moduleName;
  Component.propTypes = RealComponent.propTypes;

  return Component;
}

// 基本的な関数モック
function mockFunction(moduleName) {
  return function() {
    return {};
  };
}

// よく使われるReact NativeモジュールのCJS対応ダミー
const AccessibilityInfo = { 
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  isScreenReaderEnabled: jest.fn(() => Promise.resolve(false)),
  fetch: jest.fn(),
  isBoldTextEnabled: jest.fn(),
  isGrayscaleEnabled: jest.fn(),
  isInvertColorsEnabled: jest.fn(),
  isReduceMotionEnabled: jest.fn(),
  isReduceTransparencyEnabled: jest.fn(),
  getRecommendedTimeoutMillis: jest.fn(),
};

const Alert = {
  alert: jest.fn(),
};

const Animated = {
  View: mockComponent('AnimatedView'),
  createAnimatedComponent: jest.fn(component => component),
  timing: jest.fn(() => ({ start: jest.fn() })),
  spring: jest.fn(() => ({ start: jest.fn() })),
  decay: jest.fn(() => ({ start: jest.fn() })),
  Value: jest.fn(() => ({
    setValue: jest.fn(),
    interpolate: jest.fn(),
  })),
};

const AppState = {
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  currentState: 'active',
};

const AsyncStorage = {
  getItem: jest.fn(() => Promise.resolve()),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
};

const ActivityIndicator = mockComponent('ActivityIndicator');
const Button = mockComponent('Button');
const FlatList = mockComponent('FlatList');
const Image = mockComponent('Image');
const KeyboardAvoidingView = mockComponent('KeyboardAvoidingView');
const Modal = mockComponent('Modal');
const Pressable = mockComponent('Pressable');
const RefreshControl = mockComponent('RefreshControl');
const ScrollView = mockComponent('ScrollView');
const SectionList = mockComponent('SectionList');
const StatusBar = mockComponent('StatusBar');
const Switch = mockComponent('Switch');
const Text = mockComponent('Text');
const TextInput = mockComponent('TextInput');
const TouchableHighlight = mockComponent('TouchableHighlight');
const TouchableOpacity = mockComponent('TouchableOpacity');
const TouchableWithoutFeedback = mockComponent('TouchableWithoutFeedback');
const View = mockComponent('View');
const VirtualizedList = mockComponent('VirtualizedList');

// Setup exports in CommonJS format
module.exports = {
  // Core mocks
  mockComponent,
  mockFunction,
  
  // React Native modules
  AccessibilityInfo,
  ActivityIndicator,
  Alert,
  Animated,
  AppState,
  AsyncStorage,
  Button,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  SectionList,
  StatusBar,
  Switch,
  Text,
  TextInput,
  TouchableHighlight,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  VirtualizedList,
};

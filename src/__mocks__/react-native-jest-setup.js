/**
 * React Native jest/setup.js の完全なCommonJS版モック
 * ESM構文を全てCommonJSに変換し、Jest環境で動作するようにします
 * Expo SDK 53 / React Native 0.79に対応
 */

'use strict';

// モック化するHelperインポート
const _classCallCheck = require('@babel/runtime/helpers/classCallCheck');
const _createClass = require('@babel/runtime/helpers/createClass');
const _defineProperty = require('@babel/runtime/helpers/defineProperty');
const _extends = require('@babel/runtime/helpers/extends');
const _inherits = require('@babel/runtime/helpers/inherits');
const _possibleConstructorReturn = require('@babel/runtime/helpers/possibleConstructorReturn');
const _getPrototypeOf = require('@babel/runtime/helpers/getPrototypeOf');
const _objectWithoutProperties = require('@babel/runtime/helpers/objectWithoutProperties');
const _toConsumableArray = require('@babel/runtime/helpers/toConsumableArray');

// React・React Native関連のインポート
const React = require('react');
const { 
  Text, 
  View, 
  TouchableOpacity, 
  TouchableHighlight, 
  TouchableWithoutFeedback,
  ScrollView,
  Image,
  Button,
  SectionList,
  FlatList,
  ActivityIndicator,
  Modal,
} = require('react-native');

// 一般的なヘルパー関数
function _createSuper(Derived) {
  return function () {
    const Super = _getPrototypeOf(Derived);
    return _possibleConstructorReturn(this, Super.apply(this, arguments));
  };
}

// コンポーネントモック
function mockComponent(moduleName) {
  const RealComponent = jest.requireActual(moduleName);
  
  const Component = function Component(props) {
    _classCallCheck(this, Component);
    return React.createElement(moduleName, props, props.children);
  };

  Component.displayName = moduleName;
  
  if (RealComponent && RealComponent.propTypes) {
    Component.propTypes = RealComponent.propTypes;
  }

  return Component;
}

// メソッドモック
function mockFunction() {
  return function() {
    return {};
  };
}

// React Nativeモジュールのモック
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
  loop: jest.fn(() => ({ start: jest.fn() })),
  sequence: jest.fn(() => ({ start: jest.fn() })),
  parallel: jest.fn(() => ({ start: jest.fn() })),
  delay: jest.fn(() => ({ start: jest.fn() })),
  stagger: jest.fn(() => ({ start: jest.fn() })),
  Value: jest.fn(() => ({
    setValue: jest.fn(),
    setOffset: jest.fn(),
    interpolate: jest.fn(() => ({ interpolate: jest.fn() })),
    addListener: jest.fn(),
    removeListener: jest.fn(),
    stopAnimation: jest.fn(),
  })),
  ValueXY: jest.fn(() => ({
    x: { setValue: jest.fn() },
    y: { setValue: jest.fn() },
    setValue: jest.fn(),
    setOffset: jest.fn(),
    flattenOffset: jest.fn(),
    extractOffset: jest.fn(),
    stopAnimation: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
    getLayout: jest.fn(),
    getTranslateTransform: jest.fn(() => []),
  })),
  add: jest.fn(),
  subtract: jest.fn(),
  divide: jest.fn(),
  multiply: jest.fn(),
  modulo: jest.fn(),
  diffClamp: jest.fn(),
  event: jest.fn(() => jest.fn()),
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
  mergeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
  multiMerge: jest.fn(() => Promise.resolve()),
  flushGetRequests: jest.fn(),
};

const Dimensions = {
  get: jest.fn(() => ({ width: 400, height: 800 })),
  set: jest.fn(),
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  removeEventListener: jest.fn(),
};

const Easing = {
  linear: jest.fn(),
  ease: jest.fn(),
  bezier: jest.fn(),
  in: jest.fn(),
  out: jest.fn(),
  inOut: jest.fn(),
  back: jest.fn(),
  elastic: jest.fn(),
  bounce: jest.fn(),
  step0: jest.fn(),
  step1: jest.fn(),
  poly: jest.fn(),
  circle: jest.fn(),
  sin: jest.fn(),
  exp: jest.fn(),
};

const I18nManager = {
  isRTL: false,
  doLeftAndRightSwapInRTL: true,
  allowRTL: jest.fn(),
  forceRTL: jest.fn(),
  swapLeftAndRightInRTL: jest.fn(),
};

const InteractionManager = {
  createInteractionHandle: jest.fn(),
  clearInteractionHandle: jest.fn(),
  setDeadline: jest.fn(),
  runAfterInteractions: jest.fn(callback => {
    if (callback && typeof callback === 'function') {
      callback();
    }
    return { cancel: jest.fn() };
  }),
  addListener: jest.fn(() => ({ remove: jest.fn() })),
};

const Keyboard = {
  addListener: jest.fn(() => ({ remove: jest.fn() })),
  removeListener: jest.fn(),
  removeAllListeners: jest.fn(),
  dismiss: jest.fn(),
  scheduleLayoutAnimation: jest.fn(),
};

const LayoutAnimation = {
  configureNext: jest.fn(),
  create: jest.fn(),
  checkConfig: jest.fn(),
  Presets: { easeInEaseOut: {}, linear: {}, spring: {} },
  Types: {},
  Properties: {},
};

const Linking = {
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  openURL: jest.fn(() => Promise.resolve()),
  canOpenURL: jest.fn(() => Promise.resolve(true)),
  getInitialURL: jest.fn(() => Promise.resolve()),
};

const NativeModules = {
  UIManager: {
    RCTView: {
      directEventTypes: {},
    },
    getViewManagerConfig: jest.fn(),
    createView: jest.fn(),
    updateView: jest.fn(),
    manageChildren: jest.fn(),
    dispatchViewManagerCommand: jest.fn(),
    measure: jest.fn((reactTag, callback) => callback(0, 0, 0, 0, 0, 0)),
  },
  KeyboardObserver: {
    addListener: jest.fn(),
    removeListeners: jest.fn(),
  },
  PlatformConstants: {
    isTesting: true,
  },
  Timing: {
    createTimer: jest.fn(),
  },
  DevMenu: {
    reload: jest.fn(),
    debugRemotely: jest.fn(),
    show: jest.fn(),
    hide: jest.fn(),
  },
};

const PanResponder = {
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
};

const PixelRatio = {
  get: jest.fn(() => 2),
  getFontScale: jest.fn(() => 1),
  getPixelSizeForLayoutSize: jest.fn(layoutSize => Math.round(layoutSize * 2)),
  roundToNearestPixel: jest.fn(layoutSize => Math.round(layoutSize * 2) / 2),
};

const Platform = {
  OS: 'ios',
  select: jest.fn(obj => obj.ios),
  Version: 42,
  isTesting: true,
};

const StyleSheet = {
  create: jest.fn(styles => styles),
  flatten: jest.fn(styleObj => (Array.isArray(styleObj) ? Object.assign({}, ...styleObj) : styleObj)),
  hairlineWidth: 1,
  absoluteFill: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  absoluteFillObject: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
};

const YellowBox = {
  ignoreWarnings: jest.fn(),
  install: jest.fn(),
  uninstall: jest.fn(),
};

const NativeAnimatedHelper = {
  API: {
    createAnimatedNode: jest.fn(),
    connectAnimatedNodes: jest.fn(),
    disconnectAnimatedNodes: jest.fn(),
    startAnimatingNode: jest.fn(),
    stopAnimation: jest.fn(),
    setAnimatedNodeValue: jest.fn(),
    connectAnimatedNodeToView: jest.fn(),
    disconnectAnimatedNodeFromView: jest.fn(),
    dropAnimatedNode: jest.fn(),
  },
  platformConfig: {},
  generateNewNodeTag: jest.fn(() => 1),
  createAnimatedNode: jest.fn(),
  connectAnimatedNodes: jest.fn(),
  disconnectAnimatedNodes: jest.fn(),
  startAnimatingNode: jest.fn(),
  stopAnimation: jest.fn(),
  setAnimatedNodeValue: jest.fn(),
  connectAnimatedNodeToView: jest.fn(),
  disconnectAnimatedNodeFromView: jest.fn(),
  dropAnimatedNode: jest.fn(),
};

// コンポーネントのモックをエクスポート
module.exports = {
  // コアヘルパー
  mockComponent,
  mockFunction,
  _createSuper,
  
  // ユーティリティ関数
  _classCallCheck,
  _createClass,
  _defineProperty,
  _extends,
  _inherits,
  _possibleConstructorReturn,
  _getPrototypeOf,
  _objectWithoutProperties,
  _toConsumableArray,
  
  // コンポーネント
  ActivityIndicator: mockComponent('ActivityIndicator'),
  Button: mockComponent('Button'),
  FlatList: mockComponent('FlatList'),
  Image: mockComponent('Image'),
  KeyboardAvoidingView: mockComponent('KeyboardAvoidingView'),
  Modal: mockComponent('Modal'),
  Pressable: mockComponent('Pressable'),
  RefreshControl: mockComponent('RefreshControl'),
  ScrollView: mockComponent('ScrollView'),
  SectionList: mockComponent('SectionList'),
  StatusBar: mockComponent('StatusBar'),
  Switch: mockComponent('Switch'),
  Text: mockComponent('Text'),
  TextInput: mockComponent('TextInput'),
  TouchableHighlight: mockComponent('TouchableHighlight'),
  TouchableOpacity: mockComponent('TouchableOpacity'),
  TouchableWithoutFeedback: mockComponent('TouchableWithoutFeedback'),
  View: mockComponent('View'),
  VirtualizedList: mockComponent('VirtualizedList'),
  
  // モジュール
  AccessibilityInfo,
  Alert,
  Animated,
  AppState,
  AsyncStorage,
  Dimensions,
  Easing,
  I18nManager,
  InteractionManager,
  Keyboard,
  LayoutAnimation,
  Linking,
  NativeAnimatedHelper,
  NativeModules,
  PanResponder,
  PixelRatio,
  Platform,
  StyleSheet,
  YellowBox,
  
  // ESMの互換性フラグ
  __esModule: true,
};

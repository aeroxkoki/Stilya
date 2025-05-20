/**
 * CoreModule のモック
 */

// コアモジュールのモック
const EventEmitter = function() {
  return {
    addListener: jest.fn(),
    emit: jest.fn(),
    removeListener: jest.fn(),
    removeAllListeners: jest.fn(),
    listeners: jest.fn(() => [])
  };
};

const SharedObject = {
  create: jest.fn(),
  get: jest.fn(),
  set: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
};

const SharedRef = {
  create: jest.fn(),
  get: jest.fn()
};

const NativeModule = {
  createNativeModuleProxy: jest.fn(),
  getModule: jest.fn(),
  hasModule: jest.fn(() => false)
};

// エクスポート
module.exports = {
  EventEmitter,
  SharedObject,
  SharedRef,
  NativeModule,
  
  // ESM互換性のためのフラグ
  __esModule: true,
  
  // デフォルトエクスポート
  default: {
    EventEmitter,
    SharedObject,
    SharedRef,
    NativeModule
  }
};

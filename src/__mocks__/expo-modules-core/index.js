/**
 * expo-modules-core のメインエントリーポイントモック
 */

// 必要なモジュールをモック
const mockExports = {
  EventEmitter: require('./web/index.web').EventEmitter,
  NativeModulesProxy: {},
  NativeModules: {},
  Platform: {
    OS: 'web',
    select: jest.fn(obj => obj.web || obj.default),
  },
  CodedError: class CodedError extends Error {
    constructor(code, message) {
      super(message);
      this.code = code;
    }
  },
  
  // その他のモック
  requireOptionalNativeModule: jest.fn(() => null),
  NativeModuleRequests: {
    putReject: jest.fn(),
    putResolve: jest.fn(),
    createPromise: jest.fn(),
  },
  
  // ESM互換性のためのフラグ
  __esModule: true
};

// エクスポート
module.exports = mockExports;

// デフォルトエクスポート
module.exports.default = mockExports;

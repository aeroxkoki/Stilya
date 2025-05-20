/**
 * expo-modules-core/web/CoreModule のモック
 */

module.exports = {
  // コアモジュール機能をモック
  default: {
    // 必要なメソッド
    createModuleRegistry: jest.fn(() => ({
      getModuleByName: jest.fn(),
      getAllModules: jest.fn(() => []),
    })),
    
    // プラットフォーム関連
    platform: {
      OS: 'web',
      select: jest.fn(obj => obj.web || obj.default),
    },
    
    // エラー型
    CodedError: class CodedError extends Error {
      constructor(code, message) {
        super(message);
        this.code = code;
      }
    },
  },
  
  // CommonJS互換用
  __esModule: true,
};

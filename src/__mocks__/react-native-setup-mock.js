/**
 * React Nativeのjest/setup.jsをモックするファイル
 * ReferenceError: jest is not defined の問題を解決します
 */

// jestがグローバルで利用可能かどうかチェック
if (typeof jest === 'undefined' && typeof global.jest !== 'undefined') {
  // globalからjestを取得
  const jest = global.jest;
}

// グローバルオブジェクトにjestがない場合は実装を作成
if (typeof jest === 'undefined') {
  const mockJest = {
    fn: (impl) => impl || (() => {}),
    mock: () => {},
    unmock: () => {},
    requireActual: (path) => require(path),
    requireMock: (path) => require(path),
    clearAllMocks: () => {},
    resetAllMocks: () => {},
    restoreAllMocks: () => {},
    spyOn: () => ({ mockImplementation: () => ({}) }),
    setMock: () => {},
    isMockFunction: () => false
  };
  
  global.jest = mockJest;
}

const mockSetup = {
  mockComponent: global.jest.fn ? global.jest.fn() : () => {},
  mockFunction: global.jest.fn ? global.jest.fn() : () => {},
  mockImplementation: global.jest.fn ? global.jest.fn() : () => {},
  mockReturnValue: global.jest.fn ? global.jest.fn() : () => {},
  mockResolvedValue: global.jest.fn ? global.jest.fn() : () => {},
  mockRejectedValue: global.jest.fn ? global.jest.fn() : () => {},
  setupFiles: global.jest.fn ? global.jest.fn() : () => {},
  unmock: global.jest.fn ? global.jest.fn() : () => {},
  mock: global.jest.fn ? global.jest.fn() : () => {},
};

module.exports = mockSetup;

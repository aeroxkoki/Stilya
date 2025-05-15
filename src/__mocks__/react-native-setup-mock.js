/**
 * React Nativeのjest/setup.jsをモックするファイル
 * ReferenceError: jest is not defined の問題を解決します
 */

const mockSetup = {
  mockComponent: jest.fn(),
  mockFunction: jest.fn(),
  mockImplementation: jest.fn(),
  mockReturnValue: jest.fn(),
  mockResolvedValue: jest.fn(),
  mockRejectedValue: jest.fn(),
  setupFiles: jest.fn(),
  unmock: jest.fn(),
  mock: jest.fn(),
};

module.exports = mockSetup;

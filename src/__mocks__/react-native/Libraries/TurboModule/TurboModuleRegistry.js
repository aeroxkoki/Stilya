/**
 * TurboModule のモック
 * Expo SDK 53 (React Native 0.79) 向けに最適化
 */

module.exports = {
  get: jest.fn((name) => {
    if (name === 'DevMenu') {
      return {
        reload: jest.fn(),
        debugRemotely: jest.fn(),
        show: jest.fn(),
        hide: jest.fn(),
      };
    }
    return null;
  }),
  getEnforcing: jest.fn((name) => {
    if (name === 'DevMenu') {
      return {
        reload: jest.fn(),
        debugRemotely: jest.fn(),
        show: jest.fn(),
        hide: jest.fn(),
      };
    }
    
    // その他のデフォルトモック
    return {
      then: jest.fn(cb => cb()),
      catch: jest.fn(),
      install: jest.fn(),
      get: jest.fn(),
      getConstantsForViewManager: jest.fn(),
      getViewManagerConfig: jest.fn(),
    };
  }),
};

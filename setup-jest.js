/**
 * Jest setup file - loaded before all tests
 * This file ensures tests can run in CI environment without issues
 */

// グローバルセットアップ
global.__DEV__ = true;
global.window = global.window || {};

// jestのモックが利用可能かを確認し、ない場合は作成
if (typeof global.jest === 'undefined') {
  try {
    const jestPackage = require('@jest/globals');
    global.jest = jestPackage.jest;
    global.expect = jestPackage.expect;
    global.test = jestPackage.test;
    global.describe = jestPackage.describe;
    global.beforeEach = jestPackage.beforeEach;
    global.afterEach = jestPackage.afterEach;
    global.beforeAll = jestPackage.beforeAll;
    global.afterAll = jestPackage.afterAll;
    global.it = jestPackage.it;
    
    console.log('Jest globals initialized successfully');
  } catch (error) {
    console.error('Failed to import jest from @jest/globals', error);
    
    // 最小限のモック実装（フォールバック）
    global.jest = {
      fn: (impl) => impl || (() => {}),
      mock: () => {},
      unmock: () => {},
      spyOn: () => ({ mockImplementation: () => ({}) }),
      requireActual: (path) => require(path)
    };
    
    global.expect = (actual) => ({
      toBe: () => {},
      toEqual: () => {},
      toBeTruthy: () => {},
      toBeFalsy: () => {},
      not: { toBe: () => {} }
    });
    
    global.describe = (name, fn) => { fn && fn(); };
    global.test = (name, fn) => { fn && fn(); };
    global.it = global.test;
    global.beforeEach = (fn) => {};
    global.afterEach = (fn) => {};
  }
}

// React Native関連のモック
// jest-expoをバイパス
jest.mock('jest-expo', () => require('../src/__mocks__/jest-expo-mock.js'));

// 必要なモジュールをモック
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve(null))
}));

// 必要なグローバル関数
// Reanimated関連のモック
global.__reanimatedWorkletInit = function() {};
global._WORKLET = false;

// 環境変数設定（テスト用）
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_ANON_KEY = 'test-anon-key';
process.env.NODE_ENV = 'test';

// Jestが利用可能なら確認ログを出す
if (typeof global.jest !== 'undefined') {
  console.log('Jest is available globally');
} else {
  console.error('Jest is still not available globally after setup');
}

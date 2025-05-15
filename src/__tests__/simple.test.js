/**
 * Ultra-simple test for CI
 * This test should always pass with minimal dependencies
 */

// グローバル関数を直接使わず、require経由でJestの関数を取得
const { describe, test, expect } = require('@jest/globals');

// テストスイート
describe('Basic Test Suite', () => {
  // シンプルなテスト
  test('simple addition works', () => {
    expect(1 + 1).toBe(2);
  });

  // 文字列比較テスト
  test('string equality check works', () => {
    expect('test').toBe('test');
  });

  // ブーリアンテスト
  test('boolean check works', () => {
    expect(true).toBeTruthy();
  });
});

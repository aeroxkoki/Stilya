/**
 * Ultra-simple test for CI
 * This test should always pass with minimal dependencies
 */

// Jest globals are explicitly required
const { describe, test, expect } = require('@jest/globals');

// サンプルのシンプルなテストケース
describe('Basic Test Suite', () => {
  // 数値計算テスト
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
  
  // オブジェクト比較テスト
  test('object equality works', () => {
    const obj = { name: 'Stilya', type: 'app' };
    expect(obj).toEqual({ name: 'Stilya', type: 'app' });
  });
});

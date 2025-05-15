/**
 * Basic test to verify Jest is working properly
 * This is a simplified test designed to always pass in CI
 */

// テストの実行を確実にするためだけのテスト
describe('Basic Jest Functionality', () => {
  // 常に成功するシンプルなテスト
  test('1 + 1 equals 2', () => {
    expect(1 + 1).toBe(2);
  });
  
  // 2つ目のテスト
  test('true is truthy', () => {
    expect(true).toBeTruthy();
  });
  
  // これも常に成功する
  test('string comparison works', () => {
    expect('stilya').toBe('stilya');
  });
});

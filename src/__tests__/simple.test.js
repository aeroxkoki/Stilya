/**
 * Ultra-simple test for CI
 * This test should always pass with minimal dependencies
 */

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

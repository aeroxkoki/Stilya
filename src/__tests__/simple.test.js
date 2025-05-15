// 最も基本的なテスト
// このファイルは Jest が正しく設定されているかどうかを検証するためのものです

test('basic test runs successfully', () => {
  expect(1 + 1).toBe(2);
});

test('jest globals are defined', () => {
  // jest オブジェクトが利用可能か確認
  expect(typeof jest).toBe('object');
  expect(typeof jest.fn).toBe('function');
});

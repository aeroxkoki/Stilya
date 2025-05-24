/**
 * 基本テスト - Expo SDK 53 / React Native 0.79 互換性テスト
 */

describe('Basic tests', () => {
  test('Jest is configured correctly', () => {
    expect(1 + 1).toBe(2);
  });

  test('Boolean logic works', () => {
    expect(true).toBe(true);
    expect(false).toBe(false);
    expect(true).not.toBe(false);
  });

  test('String comparison works', () => {
    expect('hello').toBe('hello');
    expect('hello').toMatch(/^hel/);
    expect('hello').not.toBe('world');
  });
});

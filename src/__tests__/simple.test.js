/**
 * シンプルテスト - Expo SDK 53 / React Native 0.79 互換性テスト
 */

// シンプルなユーティリティ関数
const sum = (a, b) => a + b;
const multiply = (a, b) => a * b;
const divide = (a, b) => b !== 0 ? a / b : null;

describe('Simple utility functions', () => {
  test('sum adds two numbers', () => {
    expect(sum(1, 2)).toBe(3);
    expect(sum(-1, 1)).toBe(0);
    expect(sum(0, 0)).toBe(0);
  });

  test('multiply multiplies two numbers', () => {
    expect(multiply(2, 3)).toBe(6);
    expect(multiply(0, 5)).toBe(0);
    expect(multiply(-2, 3)).toBe(-6);
  });

  test('divide divides two numbers', () => {
    expect(divide(6, 2)).toBe(3);
    expect(divide(0, 5)).toBe(0);
    expect(divide(5, 0)).toBe(null);
  });
});

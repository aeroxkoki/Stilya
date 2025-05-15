/**
 * 基本的なJestテスト
 * このテストはJestの設定が正しく機能していることを確認するためのものです
 */

describe('Basic test', () => {
  it('should work', () => {
    expect(true).toBe(true);
  });
  
  it('should handle string comparison', () => {
    expect('hello').toBe('hello');
  });
  
  it('should handle math operations', () => {
    expect(1 + 1).toBe(2);
  });
});

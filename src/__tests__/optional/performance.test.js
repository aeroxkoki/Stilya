/**
 * オプションのパフォーマンステスト
 * これはオプショナルなテストのサンプルです
 */

describe('Optional Performance Tests', () => {
  it('performs calculation in reasonable time', () => {
    const startTime = Date.now();
    
    // 何らかの処理をシミュレート
    let sum = 0;
    for (let i = 0; i < 1000000; i++) {
      sum += i;
    }
    
    const endTime = Date.now();
    const executionTime = endTime - startTime;
    
    // 処理時間が100ミリ秒未満であることを期待
    expect(executionTime).toBeLessThan(100);
    expect(sum).toBeGreaterThan(0);
  });
  
  it('verifies memory usage stays reasonable', () => {
    // このテストはメモリ使用量をチェックするものです
    // 実際のJSではプロセスのメモリ使用量を直接チェックするのは難しいので、
    // これはサンプルとしてのみ実装しています
    const bigArray = new Array(10000).fill(0);
    expect(bigArray.length).toBe(10000);
  });
});

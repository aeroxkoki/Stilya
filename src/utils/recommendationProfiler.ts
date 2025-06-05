import { Product, UserPreference } from '@/types';
import { RecommendationService } from '@/services/recommendationService';

/**
 * レコメンデーションサービスのパフォーマンス測定ツール
 * 
 * 使用例:
 * ```
 * const profiler = new RecommendationProfiler();
 * await profiler.runProfileTest('getRecommendedProducts', {
 *   userId: 'user123',
 *   limit: 20,
 *   excludeIds: ['prod1', 'prod2']
 * });
 * profiler.printResults();
 * ```
 */
export class RecommendationProfiler {
  private results: {
    testName: string;
    executionTime: number;
    resultCount: number;
    params: any;
  }[] = [];

  /**
   * パフォーマンステストを実行し、結果を記録する
   * @param testName テスト名
   * @param params テストパラメータ
   */
  async runProfileTest(
    testName: string,
    params: { userId: string; limit?: number; excludeIds?: string[] }
  ): Promise<void> {
    const startTime = performance.now();
    let result: Product[] = [];

    try {
      // レコメンデーションAPI実行
      const response = await RecommendationService.getPersonalizedRecommendations(
        params.userId, 
        params.limit || 10
      );
      
      if (response.success && response.data) {
        result = response.data;
      }
    } catch (error) {
      console.error(`Error in profiling ${testName}:`, error);
    }

    const endTime = performance.now();
    const executionTime = endTime - startTime;

    // 結果を記録
    this.results.push({
      testName,
      executionTime,
      resultCount: result.length,
      params,
    });

    console.log(`Test '${testName}' completed in ${executionTime.toFixed(2)}ms`);
  }

  /**
   * 全てのテスト結果を表示する
   */
  printResults(): void {
    console.log('\n===== RECOMMENDATION ENGINE PERFORMANCE TEST RESULTS =====');
    console.log('| Test Name | Execution Time (ms) | Result Count | Parameters |');
    console.log('|-----------|---------------------|--------------|------------|');

    this.results.forEach(result => {
      console.log(
        `| ${result.testName.padEnd(9)} | ` +
        `${result.executionTime.toFixed(2).padEnd(19)} | ` +
        `${String(result.resultCount).padEnd(12)} | ` +
        `${JSON.stringify(result.params).slice(0, 40)}${
          JSON.stringify(result.params).length > 40 ? '...' : ''
        } |`
      );
    });

    // 統計情報の計算
    if (this.results.length > 0) {
      const avgTime = this.results.reduce((sum, r) => sum + r.executionTime, 0) / this.results.length;
      const maxTime = Math.max(...this.results.map(r => r.executionTime));
      const minTime = Math.min(...this.results.map(r => r.executionTime));

      console.log('\n----- Statistics -----');
      console.log(`Average execution time: ${avgTime.toFixed(2)}ms`);
      console.log(`Minimum execution time: ${minTime.toFixed(2)}ms`);
      console.log(`Maximum execution time: ${maxTime.toFixed(2)}ms`);
    }

    console.log('\n===== END OF RESULTS =====');
  }

  /**
   * テスト結果をクリアする
   */
  clearResults(): void {
    this.results = [];
  }
}

/**
 * パフォーマンステストのシナリオを実行する
 * @param userId ユーザーID
 */
export const runRecommendationPerformanceTest = async (userId: string): Promise<void> => {
  const profiler = new RecommendationProfiler();

  console.log('Starting recommendation performance test...');

  // シナリオ1: 基本的なレコメンデーション取得
  await profiler.runProfileTest('基本取得', { 
    userId, 
    limit: 10
  });

  // シナリオ2: 多数の商品を取得
  await profiler.runProfileTest('大量取得', { 
    userId, 
    limit: 50
  });

  // シナリオ3: 除外IDあり
  await profiler.runProfileTest('除外ID有', { 
    userId, 
    limit: 10,
    excludeIds: [
      'product1', 'product2', 'product3', 'product4', 'product5',
      'product6', 'product7', 'product8', 'product9', 'product10',
    ]
  });

  // シナリオ4: 連続実行による差（キャッシュ効果の確認）
  await profiler.runProfileTest('連続実行1', { userId, limit: 10 });
  await profiler.runProfileTest('連続実行2', { userId, limit: 10 });
  await profiler.runProfileTest('連続実行3', { userId, limit: 10 });

  // 結果出力
  profiler.printResults();
};

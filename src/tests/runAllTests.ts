// すべてのテストを実行する統合テストランナー
import './checkEnv';
// 環境変数チェックの後に少し待機
setTimeout(async () => {
  console.log('\n' + '='.repeat(50) + '\n');
  
  try {
    // 楽天APIテスト
    await import('./testRakutenAPI');
    
    // 少し待機
    setTimeout(async () => {
      console.log('\n' + '='.repeat(50) + '\n');
      
      // RecommendationServiceテスト
      await import('./testRecommendationService');
      
      // 少し待機
      setTimeout(async () => {
        console.log('\n' + '='.repeat(50) + '\n');
        
        // IntegratedRecommendationServiceテスト
        await import('./testIntegratedRecommendationService');
        
        console.log('\n' + '='.repeat(50));
        console.log('すべてのテストが完了しました');
        console.log('='.repeat(50) + '\n');
      }, 2000);
    }, 2000);
  } catch (error: any) {
    console.error('テスト実行エラー:', error);
  }
}, 1000);

export {};

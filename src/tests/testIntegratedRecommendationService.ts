// IntegratedRecommendationServiceのテストスクリプト
import { getEnhancedRecommendations, getEnhancedCategoryRecommendations } from '../services/integratedRecommendationService';

const testIntegratedRecommendationService = async () => {
  console.log('=== IntegratedRecommendationServiceテスト開始 ===');
  
  try {
    // テストユーザーID
    const testUserId = '4a065a36-f764-420d-a923-f5e9c884b6ea';
    
    // getEnhancedRecommendationsのテスト
    console.log('\n1. getEnhancedRecommendationsのテスト');
    const enhancedResult = await getEnhancedRecommendations(testUserId, 10);
    
    console.log('結果:');
    console.log('- 内部推薦商品数:', enhancedResult.recommended.length);
    console.log('- トレンド商品数:', enhancedResult.trending.length);
    console.log('- おすすめ商品数:', enhancedResult.forYou.length);
    console.log('- ローディング状態:', enhancedResult.isLoading);
    
    if (enhancedResult.trending.length > 0) {
      console.log('\n最初のトレンド商品:');
      const firstTrending = enhancedResult.trending[0];
      console.log('- タイトル:', firstTrending.title);
      console.log('- 価格:', firstTrending.price);
      console.log('- ソース:', firstTrending.source);
    }
    
    // getEnhancedCategoryRecommendationsのテスト
    console.log('\n2. getEnhancedCategoryRecommendationsのテスト');
    const categoryResult = await getEnhancedCategoryRecommendations(
      testUserId,
      ['tops', 'bottoms'],
      3
    );
    
    console.log('カテゴリ別結果:');
    for (const category of ['tops', 'bottoms']) {
      console.log(`\n${category}:`);
      console.log(`- 内部推薦数: ${categoryResult.internalRecs[category]?.length || 0}`);
      console.log(`- 外部推薦数: ${categoryResult.externalRecs[category]?.length || 0}`);
      
      if (categoryResult.externalRecs[category]?.length > 0) {
        const firstExternal = categoryResult.externalRecs[category][0];
        console.log(`- 最初の外部商品: ${firstExternal.title} (${firstExternal.price}円)`);
      }
    }
    
  } catch (error: any) {
    console.error('❌ IntegratedRecommendationServiceエラー:', error.message);
    console.error(error.stack);
  }
  
  console.log('\n=== IntegratedRecommendationServiceテスト終了 ===');
};

// テスト実行
testIntegratedRecommendationService();

export {};

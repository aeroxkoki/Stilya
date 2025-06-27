/**
 * recommendationServiceの新しいアプローチをテストするスクリプト
 */

import { supabase, TABLES } from '../services/supabase';
import { RecommendationService } from '../services/recommendationService';

async function testNewRecommendationApproach() {
  console.log('=== Testing New Recommendation Approach ===\n');

  try {
    // テスト用のユーザーIDを取得
    const { data: users, error: userError } = await supabase
      .from(TABLES.USERS)
      .select('id')
      .limit(1);

    if (userError || !users || users.length === 0) {
      console.error('No users found for testing');
      return;
    }

    const testUserId = users[0].id;
    console.log('Testing with user:', testUserId);

    // スワイプ数を確認
    const { data: swipes, error: swipeError } = await supabase
      .from(TABLES.SWIPES)
      .select('product_id')
      .eq('user_id', testUserId);

    console.log('User has swiped:', swipes?.length || 0, 'products');

    // 新しいレコメンデーション関数をテスト
    console.log('\nTesting getPersonalizedRecommendations...');
    const startTime = Date.now();
    
    const result = await RecommendationService.getPersonalizedRecommendations(testUserId, 10);
    
    const endTime = Date.now();
    console.log('Execution time:', endTime - startTime, 'ms');

    if (result.success) {
      console.log('✅ Success! Found', result.data?.length, 'recommendations');
      if (result.data && result.data.length > 0) {
        console.log('\nSample recommendation:');
        console.log('- Title:', result.data[0].title);
        console.log('- Brand:', result.data[0].brand);
        console.log('- Price:', result.data[0].price);
        console.log('- Tags:', result.data[0].tags?.slice(0, 3));
      }
    } else {
      console.error('❌ Error:', result.error);
    }

    // パフォーマンステスト
    console.log('\n=== Performance Test ===');
    const times = [];
    for (let i = 0; i < 3; i++) {
      const start = Date.now();
      await RecommendationService.getPersonalizedRecommendations(testUserId, 20);
      const end = Date.now();
      times.push(end - start);
      console.log(`Run ${i + 1}: ${end - start}ms`);
    }
    
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    console.log(`Average time: ${avgTime.toFixed(2)}ms`);

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// テストを実行
if (require.main === module) {
  testNewRecommendationApproach().then(() => {
    console.log('\n=== Test completed ===');
    process.exit(0);
  }).catch((error) => {
    console.error('Test failed:', error);
    process.exit(1);
  });
}

export { testNewRecommendationApproach };

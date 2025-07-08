// 推薦システムv2のテストスクリプト
import { getEnhancedRecommendations, updateSessionLearning } from '../services/enhancedRecommendationService';
import { getABTestVariant } from '../utils/abTesting';

export const testEnhancedRecommendations = async () => {
  console.log('🧪 推薦システムv2のテストを開始します...\n');
  
  // テストユーザーID（実際のテストユーザーIDに置き換えてください）
  const testUserId = 'test-user-001';
  
  try {
    console.log('1️⃣ A/Bテストの割り当てを確認中...');
    const variant = await getABTestVariant(testUserId, 'recommendation_algorithm_v2');
    console.log(`✅ A/Bテストバリアント: ${variant}\n`);
    
    console.log('2️⃣ 拡張された推薦を取得中...');
    const result = await getEnhancedRecommendations(testUserId, 10);
    
    if (result.success && result.data) {
      console.log(`✅ 推薦商品を${result.data.length}件取得しました`);
      
      // 商品の多様性を分析
      const categories = new Set(result.data.map(p => p.category));
      const brands = new Set(result.data.map(p => p.brand));
      const priceRanges = result.data.map(p => Math.floor((p.price || 0) / 10000));
      
      console.log(`\n📊 推薦結果の分析:`);
      console.log(`- カテゴリの多様性: ${categories.size}種類`);
      console.log(`- ブランドの多様性: ${brands.size}種類`);
      console.log(`- 価格帯の分布: ${Math.min(...priceRanges)}万円〜${Math.max(...priceRanges)}万円`);
      
      // 最初の3商品を表示
      console.log(`\n🔍 推薦商品のサンプル:`);
      result.data.slice(0, 3).forEach((product, index) => {
        console.log(`${index + 1}. ${product.title}`);
        console.log(`   - ブランド: ${product.brand}`);
        console.log(`   - 価格: ¥${product.price?.toLocaleString()}`);
        console.log(`   - カテゴリ: ${product.category}`);
      });
    } else {
      console.error('❌ 推薦の取得に失敗しました:', result.error);
    }
    
    console.log('\n3️⃣ セッション学習のテスト...');
    // セッション学習のテスト
    for (let i = 0; i < 3; i++) {
      const swipeResult = Math.random() > 0.5 ? 'yes' : 'no';
      const responseTime = Math.floor(Math.random() * 3000) + 500; // 500ms-3500ms
      
      await updateSessionLearning(testUserId, {
        productId: `test-product-${i}`,
        result: swipeResult,
        responseTime: responseTime
      });
      
      console.log(`✅ スワイプ${i + 1}: ${swipeResult} (${responseTime}ms)`);
    }
    
    console.log('\n✨ テスト完了!');
    
    return true;
  } catch (error) {
    console.error('❌ テスト中にエラーが発生しました:', error);
    return false;
  }
};

// スタンドアロン実行用
if (require.main === module) {
  testEnhancedRecommendations()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

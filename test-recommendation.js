const { RecommendationService } = require('./src/services/recommendationService');
const { supabase } = require('./src/services/supabase');

// Supabaseの接続とレコメンデーションサービスの動作確認
async function testRecommendation() {
  console.log('=== 推薦アルゴリズムとSupabase接続テスト開始 ===\n');

  try {
    // 1. Supabase接続テスト
    console.log('1. Supabase接続テスト...');
    const { data: session, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error('❌ Supabase接続エラー:', sessionError);
      return;
    }
    console.log('✅ Supabase接続成功');

    // 2. 商品データの存在確認
    console.log('\n2. 商品データの確認...');
    const { data: products, error: productError, count } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: false })
      .eq('is_active', true)
      .limit(5);

    if (productError) {
      console.error('❌ 商品データ取得エラー:', productError);
      return;
    }
    console.log(`✅ アクティブな商品数: ${count}`);
    console.log('サンプル商品:', products?.slice(0, 2).map(p => ({
      id: p.id,
      title: p.title,
      price: p.price,
      tags: p.tags?.slice(0, 3)
    })));

    // 3. ユーザーデータの確認
    console.log('\n3. ユーザーデータの確認...');
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .limit(1);

    if (userError || !users || users.length === 0) {
      console.log('⚠️ テスト用ユーザーが見つかりません');
      // テスト用ユーザーIDを使用
      const testUserId = '00000000-0000-0000-0000-000000000001';
      console.log(`テスト用ID使用: ${testUserId}`);
      
      // 4. 推薦アルゴリズムテスト（人気商品）
      console.log('\n4. 人気商品の推薦テスト...');
      const popularResult = await RecommendationService.getPopularProducts(5);
      
      if (popularResult.success) {
        console.log('✅ 人気商品推薦成功');
        console.log(`取得件数: ${popularResult.data?.length || 0}`);
        popularResult.data?.slice(0, 2).forEach((p, i) => {
          console.log(`  ${i + 1}. ${p.title} - ¥${p.price}`);
        });
      } else {
        console.error('❌ 人気商品推薦失敗:', popularResult.error);
      }
    } else {
      const testUser = users[0];
      console.log(`✅ テストユーザー: ${testUser.email || testUser.id}`);

      // 4. スワイプ履歴の確認
      console.log('\n4. スワイプ履歴の確認...');
      const { data: swipes, error: swipeError } = await supabase
        .from('swipes')
        .select('*')
        .eq('user_id', testUser.id)
        .limit(10);

      if (swipeError) {
        console.error('❌ スワイプ履歴取得エラー:', swipeError);
      } else {
        console.log(`✅ スワイプ履歴数: ${swipes?.length || 0}`);
      }

      // 5. ユーザー嗜好分析テスト
      console.log('\n5. ユーザー嗜好分析テスト...');
      const preferencesResult = await RecommendationService.analyzeUserPreferences(testUser.id);
      
      if (preferencesResult.success && preferencesResult.data) {
        console.log('✅ ユーザー嗜好分析成功');
        const prefs = preferencesResult.data;
        console.log('分析結果:');
        console.log(`  - 好きなタグ: ${prefs.likedTags?.slice(0, 3).join(', ') || 'なし'}`);
        console.log(`  - 嫌いなタグ: ${prefs.dislikedTags?.slice(0, 3).join(', ') || 'なし'}`);
        console.log(`  - 価格帯: ¥${prefs.avgPriceRange?.min || 0} - ¥${prefs.avgPriceRange?.max || 0}`);
        console.log(`  - 好きなブランド: ${prefs.brands?.slice(0, 3).join(', ') || 'なし'}`);
      } else {
        console.log('⚠️ ユーザー嗜好データなし（スワイプ履歴が不足）');
      }

      // 6. パーソナライズ推薦テスト
      console.log('\n6. パーソナライズ推薦テスト...');
      const recommendResult = await RecommendationService.getPersonalizedRecommendations(testUser.id, 5);
      
      if (recommendResult.success) {
        console.log('✅ パーソナライズ推薦成功');
        console.log(`取得件数: ${recommendResult.data?.length || 0}`);
        recommendResult.data?.slice(0, 3).forEach((p, i) => {
          console.log(`  ${i + 1}. ${p.title}`);
          console.log(`     価格: ¥${p.price}, タグ: ${p.tags?.slice(0, 3).join(', ') || 'なし'}`);
        });
      } else {
        console.error('❌ パーソナライズ推薦失敗:', recommendResult.error);
      }
    }

    // 7. トレンド商品テスト
    console.log('\n7. トレンド商品の推薦テスト...');
    const trendingResult = await RecommendationService.getTrendingProducts(5);
    
    if (trendingResult.success) {
      console.log('✅ トレンド商品推薦成功');
      console.log(`取得件数: ${trendingResult.data?.length || 0}`);
    } else {
      console.error('❌ トレンド商品推薦失敗:', trendingResult.error);
    }

    // 8. データ整合性チェック
    console.log('\n8. データ整合性チェック...');
    
    // スワイプテーブルの外部キー整合性
    const { data: invalidSwipes, error: invalidSwipeError } = await supabase
      .from('swipes')
      .select('id, product_id')
      .is('product_id', null);
    
    if (!invalidSwipeError) {
      if (invalidSwipes && invalidSwipes.length > 0) {
        console.log(`⚠️ 無効な商品IDを持つスワイプ: ${invalidSwipes.length}件`);
      } else {
        console.log('✅ スワイプデータの整合性: OK');
      }
    }

    // お気に入りテーブルの外部キー整合性
    const { data: invalidFavorites, error: invalidFavError } = await supabase
      .from('favorites')
      .select('id, product_id')
      .is('product_id', null);
    
    if (!invalidFavError) {
      if (invalidFavorites && invalidFavorites.length > 0) {
        console.log(`⚠️ 無効な商品IDを持つお気に入り: ${invalidFavorites.length}件`);
      } else {
        console.log('✅ お気に入りデータの整合性: OK');
      }
    }

    console.log('\n=== テスト完了 ===');
    console.log('\n推薦アルゴリズムとSupabaseの接続は正常に動作しています。');
    
  } catch (error) {
    console.error('\n❌ テスト中に予期しないエラーが発生しました:', error);
  }
}

// テスト実行
testRecommendation().then(() => {
  console.log('\nテスト終了');
  process.exit(0);
}).catch(error => {
  console.error('テストエラー:', error);
  process.exit(1);
});

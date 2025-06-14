const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// 環境変数の読み込み
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 必要な環境変数が設定されていません');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanupOldProducts() {
  console.log('🧹 古い商品のクリーンアップ開始...');
  
  try {
    // 30日以上古い非アクティブ商品を削除
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // まず対象件数を確認
    const { count: targetCount } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', false)
      .lt('last_synced', thirtyDaysAgo.toISOString());
    
    console.log(`  対象商品数: ${targetCount || 0}件`);
    
    if (targetCount > 0) {
      // バッチ処理で削除（一度に1000件まで）
      let deleted = 0;
      const batchSize = 1000;
      
      while (deleted < targetCount) {
        const { data, error } = await supabase
          .from('external_products')
          .delete()
          .eq('is_active', false)
          .lt('last_synced', thirtyDaysAgo.toISOString())
          .select('product_id')
          .limit(batchSize);
        
        if (error) {
          console.error('  削除エラー:', error);
          break;
        }
        
        const batchDeleted = data?.length || 0;
        deleted += batchDeleted;
        console.log(`  削除済み: ${deleted}/${targetCount}件`);
        
        if (batchDeleted < batchSize) break;
      }
    }
    
    // 90日以上古い低スコア商品を無効化
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    const { data: deactivated, error: deactivateError } = await supabase
      .from('external_products')
      .update({ is_active: false })
      .eq('is_active', true)
      .lt('recommendation_score', 30)
      .lt('last_synced', ninetyDaysAgo.toISOString())
      .select('product_id');
    
    if (!deactivateError && deactivated) {
      console.log(`  ${deactivated.length}件の低スコア商品を無効化`);
    }
    
    // 最終統計
    const { count: totalActive } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);
    
    const { count: totalProducts } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true });
    
    console.log(`\n📊 クリーンアップ完了:`);
    console.log(`  - アクティブ商品: ${totalActive?.toLocaleString() || 0}件`);
    console.log(`  - 総商品数: ${totalProducts?.toLocaleString() || 0}件`);
    console.log(`  - 使用率: ${totalProducts ? Math.round((totalActive / totalProducts) * 100) : 0}%`);
    
  } catch (error) {
    console.error('❌ クリーンアップエラー:', error);
    process.exit(1);
  }
}

// メイン実行
(async () => {
  await cleanupOldProducts();
  process.exit(0);
})();

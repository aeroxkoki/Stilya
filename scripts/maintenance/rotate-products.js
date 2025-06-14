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

async function rotateProducts() {
  console.log('🔄 商品ローテーション開始...');
  
  try {
    // 1. ブランド別のローテーション対象を確認
    console.log('\n1️⃣ ローテーション対象の確認...');
    
    // ブランド設定（Phase 3から抜粋）
    const brandRotationSettings = [
      { brand: 'UNIQLO', rotationDays: 2, keepActive: 5000 },
      { brand: 'GU', rotationDays: 2, keepActive: 4000 },
      { brand: '無印良品', rotationDays: 3, keepActive: 3000 },
      { brand: 'ZARA', rotationDays: 2, keepActive: 2000 },
      { brand: 'H&M', rotationDays: 2, keepActive: 2000 },
      { brand: 'coca', rotationDays: 3, keepActive: 1000 },
      { brand: 'pierrot', rotationDays: 3, keepActive: 1000 },
      { brand: 'URBAN RESEARCH', rotationDays: 4, keepActive: 1500 },
      { brand: 'BEAMS', rotationDays: 5, keepActive: 2000 },
      { brand: 'SNIDEL', rotationDays: 4, keepActive: 800 },
    ];
    
    let totalRotated = 0;
    
    for (const setting of brandRotationSettings) {
      console.log(`\n  🏷️  ${setting.brand}:`);
      
      // 現在のアクティブ商品数を確認
      const { count: currentActive } = await supabase
        .from('external_products')
        .select('*', { count: 'exact', head: true })
        .eq('source_brand', setting.brand)
        .eq('is_active', true);
      
      console.log(`    現在のアクティブ: ${currentActive || 0}件`);
      console.log(`    目標アクティブ数: ${setting.keepActive}件`);
      
      // ローテーション期間を過ぎた商品を確認
      const rotationDate = new Date();
      rotationDate.setDate(rotationDate.getDate() - setting.rotationDays);
      
      const { count: oldActiveCount } = await supabase
        .from('external_products')
        .select('*', { count: 'exact', head: true })
        .eq('source_brand', setting.brand)
        .eq('is_active', true)
        .lt('last_synced', rotationDate.toISOString());
      
      console.log(`    ローテーション対象: ${oldActiveCount || 0}件`);
      
      // アクティブ商品が多すぎる場合、古いものを非アクティブ化
      if (currentActive > setting.keepActive) {
        const toDeactivate = currentActive - setting.keepActive;
        
        // 最も古いアクティブ商品を取得
        const { data: oldProducts } = await supabase
          .from('external_products')
          .select('product_id')
          .eq('source_brand', setting.brand)
          .eq('is_active', true)
          .order('last_synced', { ascending: true })
          .limit(toDeactivate);
        
        if (oldProducts && oldProducts.length > 0) {
          const productIds = oldProducts.map(p => p.product_id);
          
          // 非アクティブ化
          const { error } = await supabase
            .from('external_products')
            .update({ is_active: false })
            .in('product_id', productIds);
          
          if (!error) {
            console.log(`    ✅ ${productIds.length}件を非アクティブ化`);
            totalRotated += productIds.length;
          }
        }
      }
      
      // 非アクティブな新しい商品があれば、アクティブ化を検討
      if (currentActive < setting.keepActive) {
        const toActivate = setting.keepActive - currentActive;
        
        // 最新の非アクティブ商品を取得
        const { data: inactiveProducts } = await supabase
          .from('external_products')
          .select('product_id, recommendation_score')
          .eq('source_brand', setting.brand)
          .eq('is_active', false)
          .order('recommendation_score', { ascending: false })
          .order('last_synced', { ascending: false })
          .limit(toActivate);
        
        if (inactiveProducts && inactiveProducts.length > 0) {
          const productIds = inactiveProducts.map(p => p.product_id);
          
          // アクティブ化
          const { error } = await supabase
            .from('external_products')
            .update({ is_active: true })
            .in('product_id', productIds);
          
          if (!error) {
            console.log(`    ✅ ${productIds.length}件をアクティブ化`);
            totalRotated += productIds.length;
          }
        }
      }
    }
    
    // 2. 季節ローテーション
    console.log('\n2️⃣ 季節ローテーション...');
    
    const currentMonth = new Date().getMonth() + 1;
    let currentSeason;
    let offSeasons = [];
    
    if (currentMonth >= 3 && currentMonth <= 5) {
      currentSeason = '春';
      offSeasons = ['夏物', '秋物', '冬物', 'ダウン', 'コート'];
    } else if (currentMonth >= 6 && currentMonth <= 8) {
      currentSeason = '夏';
      offSeasons = ['秋物', '冬物', 'ニット', 'ダウン', 'コート'];
    } else if (currentMonth >= 9 && currentMonth <= 11) {
      currentSeason = '秋';
      offSeasons = ['春物', '夏物', 'ノースリーブ', '水着'];
    } else {
      currentSeason = '冬';
      offSeasons = ['春物', '夏物', 'ノースリーブ', '半袖', '水着'];
    }
    
    console.log(`  現在の季節: ${currentSeason}`);
    
    // 季節外れ商品の優先度を下げる
    for (const keyword of offSeasons) {
      const { data: offSeasonProducts } = await supabase
        .from('external_products')
        .select('product_id, recommendation_score')
        .eq('is_active', true)
        .ilike('title', `%${keyword}%`)
        .gt('recommendation_score', 30);
      
      if (offSeasonProducts && offSeasonProducts.length > 0) {
        const updates = offSeasonProducts.map(p => ({
          product_id: p.product_id,
          recommendation_score: Math.max(p.recommendation_score - 20, 10)
        }));
        
        // バッチ更新
        for (const update of updates) {
          await supabase
            .from('external_products')
            .update({ recommendation_score: update.recommendation_score })
            .eq('product_id', update.product_id);
        }
        
        console.log(`  ${keyword}: ${updates.length}件のスコアを調整`);
      }
    }
    
    // 3. スコアベースのローテーション
    console.log('\n3️⃣ スコアベースのローテーション...');
    
    // 低スコアのアクティブ商品を確認
    const { count: lowScoreActive } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .lt('recommendation_score', 20);
    
    console.log(`  低スコアアクティブ商品: ${lowScoreActive || 0}件`);
    
    // 高スコアの非アクティブ商品を確認
    const { count: highScoreInactive } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', false)
      .gt('recommendation_score', 70);
    
    console.log(`  高スコア非アクティブ商品: ${highScoreInactive || 0}件`);
    
    // スコアに基づいた入れ替え（最大100件）
    if (lowScoreActive > 0 && highScoreInactive > 0) {
      const swapCount = Math.min(lowScoreActive, highScoreInactive, 100);
      
      // 非アクティブ化対象
      const { data: toDeactivate } = await supabase
        .from('external_products')
        .select('product_id')
        .eq('is_active', true)
        .lt('recommendation_score', 20)
        .order('recommendation_score', { ascending: true })
        .limit(swapCount);
      
      // アクティブ化対象
      const { data: toActivate } = await supabase
        .from('external_products')
        .select('product_id')
        .eq('is_active', false)
        .gt('recommendation_score', 70)
        .order('recommendation_score', { ascending: false })
        .limit(swapCount);
      
      if (toDeactivate && toActivate) {
        // 非アクティブ化
        await supabase
          .from('external_products')
          .update({ is_active: false })
          .in('product_id', toDeactivate.map(p => p.product_id));
        
        // アクティブ化
        await supabase
          .from('external_products')
          .update({ is_active: true })
          .in('product_id', toActivate.map(p => p.product_id));
        
        console.log(`  ✅ ${swapCount}件を入れ替え`);
        totalRotated += swapCount * 2;
      }
    }
    
    // 4. 最終統計
    console.log('\n📊 ローテーション完了:');
    
    const { count: finalActive } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);
    
    const { count: finalTotal } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true });
    
    console.log(`  - 総ローテーション数: ${totalRotated}件`);
    console.log(`  - 最終アクティブ商品: ${finalActive?.toLocaleString() || 0}件`);
    console.log(`  - 最終総商品数: ${finalTotal?.toLocaleString() || 0}件`);
    console.log(`  - アクティブ率: ${finalTotal ? Math.round((finalActive / finalTotal) * 100) : 0}%`);
    
  } catch (error) {
    console.error('❌ ローテーションエラー:', error);
    process.exit(1);
  }
}

// メイン実行
(async () => {
  await rotateProducts();
  process.exit(0);
})();

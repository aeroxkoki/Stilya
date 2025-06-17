#\!/usr/bin/env node
/**
 * スマート削除マネージャー
 * データベース容量の最適化のための商品削除を行う
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// 環境変数の読み込み
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

// Supabaseクライアントの作成
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (\!supabaseUrl || \!supabaseKey) {
  console.error('❌ 必要な環境変数が設定されていません');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 削除ポリシーの設定
const DELETION_POLICIES = {
  // 古い商品の削除（更新日から一定期間経過）
  oldProducts: {
    enabled: true,
    daysThreshold: 14, // 14日以上更新されていない商品
    maxDeleteCount: 5000,
    priority: 1 // 優先度（低いほど先に削除）
  },
  
  // 非アクティブ商品の削除
  inactiveProducts: {
    enabled: true,
    maxDeleteCount: 10000,
    priority: 2
  },
  
  // 低優先度ブランドの商品削除
  lowPriorityBrands: {
    enabled: true,
    priorityThreshold: 6, // 優先度6以上のブランド
    maxDeleteCount: 3000,
    priority: 3
  },
  
  // 季節外れの商品削除
  outOfSeasonProducts: {
    enabled: true,
    maxDeleteCount: 2000,
    priority: 4
  }
};

// 現在の季節を取得
function getCurrentSeason() {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
}

// ドライランモードの判定
const DRY_RUN = process.argv.includes('--dry-run') || process.env.DRY_RUN === 'true';
const CI_MODE = process.argv.includes('--ci') || process.env.CI === 'true';

/**
 * メイン削除処理
 */
async function smartDeletion() {
  console.log(`\n🧹 スマート削除マネージャー開始 ${DRY_RUN ? '(ドライランモード)' : ''}`);
  
  // 現在のデータベース状態を確認
  const { count, error } = await supabase
    .from('external_products')
    .select('*', { count: 'exact', head: true });
  
  if (error) {
    console.error('❌ データベース接続エラー:', error.message);
    process.exit(1);
  }
  
  console.log(`📊 現在の商品数: ${count.toLocaleString()}件`);
  
  // 削除候補を収集
  const deletionCandidates = await collectDeletionCandidates();
  
  // 候補をポリシーの優先度で並べ替え
  const sortedCandidates = deletionCandidates.sort((a, b) => a.policyPriority - b.policyPriority);
  
  // 削除を実行（ドライランでなければ）
  if (\!DRY_RUN) {
    await executeDeleteProducts(sortedCandidates);
  } else {
    // ドライラン結果を表示
    console.log('\n🔍 ドライラン結果:');
    console.log(`削除対象: ${sortedCandidates.length.toLocaleString()}件`);
    
    // カテゴリ別の削除件数
    const categoryCounts = {
      old: sortedCandidates.filter(c => c.reason === 'old').length,
      inactive: sortedCandidates.filter(c => c.reason === 'inactive').length,
      lowPriority: sortedCandidates.filter(c => c.reason === 'lowPriority').length,
      outOfSeason: sortedCandidates.filter(c => c.reason === 'outOfSeason').length
    };
    
    console.log(`- 古い商品: ${categoryCounts.old.toLocaleString()}件`);
    console.log(`- 非アクティブ: ${categoryCounts.inactive.toLocaleString()}件`);
    console.log(`- 低優先度: ${categoryCounts.lowPriority.toLocaleString()}件`);
    console.log(`- 季節外れ: ${categoryCounts.outOfSeason.toLocaleString()}件`);
    
    // ブランド別の削除件数（上位5つ）
    const brandCounts = {};
    sortedCandidates.forEach(candidate => {
      const brand = candidate.source_brand || 'unknown';
      brandCounts[brand] = (brandCounts[brand] || 0) + 1;
    });
    
    console.log('\n削除対象トップブランド:');
    Object.entries(brandCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .forEach(([brand, count]) => {
        console.log(`- ${brand}: ${count.toLocaleString()}件`);
      });
  }
}

/**
 * 削除候補の収集
 */
async function collectDeletionCandidates() {
  const candidates = [];
  const currentSeason = getCurrentSeason();
  
  // 古い商品の収集
  if (DELETION_POLICIES.oldProducts.enabled) {
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - DELETION_POLICIES.oldProducts.daysThreshold);
    
    const { data: oldProducts, error } = await supabase
      .from('external_products')
      .select('product_id, source_brand, last_synced')
      .lt('last_synced', oldDate.toISOString())
      .limit(DELETION_POLICIES.oldProducts.maxDeleteCount);
    
    if (\!error && oldProducts) {
      console.log(`古い商品（${DELETION_POLICIES.oldProducts.daysThreshold}日以上前）: ${oldProducts.length}件`);
      
      oldProducts.forEach(product => {
        candidates.push({
          product_id: product.product_id,
          source_brand: product.source_brand,
          reason: 'old',
          policyPriority: DELETION_POLICIES.oldProducts.priority
        });
      });
    }
  }
  
  // 非アクティブ商品の収集
  if (DELETION_POLICIES.inactiveProducts.enabled) {
    const { data: inactiveProducts, error } = await supabase
      .from('external_products')
      .select('product_id, source_brand')
      .eq('is_active', false)
      .limit(DELETION_POLICIES.inactiveProducts.maxDeleteCount);
    
    if (\!error && inactiveProducts) {
      console.log(`非アクティブ商品: ${inactiveProducts.length}件`);
      
      inactiveProducts.forEach(product => {
        candidates.push({
          product_id: product.product_id,
          source_brand: product.source_brand,
          reason: 'inactive',
          policyPriority: DELETION_POLICIES.inactiveProducts.priority
        });
      });
    }
  }
  
  // 低優先度ブランドの商品収集
  if (DELETION_POLICIES.lowPriorityBrands.enabled) {
    const { data: lowPriorityProducts, error } = await supabase
      .from('external_products')
      .select('product_id, source_brand, brand_priority')
      .gte('brand_priority', DELETION_POLICIES.lowPriorityBrands.priorityThreshold)
      .limit(DELETION_POLICIES.lowPriorityBrands.maxDeleteCount);
    
    if (\!error && lowPriorityProducts) {
      console.log(`低優先度ブランド（優先度${DELETION_POLICIES.lowPriorityBrands.priorityThreshold}以上）: ${lowPriorityProducts.length}件`);
      
      lowPriorityProducts.forEach(product => {
        candidates.push({
          product_id: product.product_id,
          source_brand: product.source_brand,
          reason: 'lowPriority',
          policyPriority: DELETION_POLICIES.lowPriorityBrands.priority
        });
      });
    }
  }
  
  // 季節外れの商品収集
  if (DELETION_POLICIES.outOfSeasonProducts.enabled) {
    // 現在の季節と反対の季節を特定
    const oppositeSeasons = {
      spring: 'autumn',
      summer: 'winter',
      autumn: 'spring',
      winter: 'summer'
    };
    
    const oppositeSeason = oppositeSeasons[currentSeason];
    
    const { data: outOfSeasonProducts, error } = await supabase
      .from('external_products')
      .select('product_id, source_brand, seasonal_tags')
      .contains('seasonal_tags', [oppositeSeason])
      .limit(DELETION_POLICIES.outOfSeasonProducts.maxDeleteCount);
    
    if (\!error && outOfSeasonProducts) {
      console.log(`季節外れ商品（${oppositeSeason}）: ${outOfSeasonProducts.length}件`);
      
      outOfSeasonProducts.forEach(product => {
        candidates.push({
          product_id: product.product_id,
          source_brand: product.source_brand,
          reason: 'outOfSeason',
          policyPriority: DELETION_POLICIES.outOfSeasonProducts.priority
        });
      });
    }
  }
  
  return candidates;
}

/**
 * 削除の実行
 */
async function executeDeleteProducts(candidates) {
  if (candidates.length === 0) {
    console.log('削除対象の商品がありません');
    return;
  }
  
  console.log(`\n🗑️ ${candidates.length.toLocaleString()}件の商品を削除します...`);
  
  // バッチ処理（1回のリクエストで最大100件まで）
  const batchSize = 100;
  const batches = Math.ceil(candidates.length / batchSize);
  
  let totalDeleted = 0;
  
  for (let i = 0; i < batches; i++) {
    const batchCandidates = candidates.slice(i * batchSize, (i + 1) * batchSize);
    const productIds = batchCandidates.map(c => c.product_id);
    
    const { error, count } = await supabase
      .from('external_products')
      .delete()
      .in('product_id', productIds);
    
    if (error) {
      console.error(`❌ バッチ${i+1}/${batches}の削除エラー:`, error.message);
    } else {
      totalDeleted += batchCandidates.length;
      
      // 進捗表示（CIモードでなければ）
      if (\!CI_MODE) {
        const progress = ((i + 1) / batches * 100).toFixed(1);
        process.stdout.write(`\r⏳ 削除進捗: ${progress}% (${totalDeleted.toLocaleString()}/${candidates.length.toLocaleString()}件)`);
      }
    }
    
    // 少し待機してAPI負荷を軽減
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`\n✅ 削除完了: ${totalDeleted.toLocaleString()}件の商品を削除しました`);
}

// メイン実行
smartDeletion().catch(error => {
  console.error('❌ 実行エラー:', error);
  process.exit(1);
});

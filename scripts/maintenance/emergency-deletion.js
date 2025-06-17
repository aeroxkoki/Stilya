#\!/usr/bin/env node
/**
 * 緊急削除スクリプト
 * データベース容量がクリティカルな場合に実行される
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

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

/**
 * 緊急削除処理
 */
async function emergencyDeletion() {
  console.log('\n🚨 緊急削除プロセスを開始します');
  
  // 1. 現在の状態を確認
  const { count: totalCount, error: countError } = await supabase
    .from('external_products')
    .select('*', { count: 'exact', head: true });
    
  if (countError) {
    console.error('❌ データベース接続エラー:', countError.message);
    process.exit(1);
  }
  
  console.log(`📊 現在の商品数: ${totalCount.toLocaleString()}件`);
  
  // 削除する商品の割合（全体の15%を削除）
  const deletionTarget = Math.ceil(totalCount * 0.15);
  console.log(`🎯 削除目標: ${deletionTarget.toLocaleString()}件 (全体の15%)`);
  
  // 2. 優先順位に基づいて削除
  let deletedCount = 0;
  
  // 2.1 非アクティブ商品の削除
  const { error: inactiveError } = await supabase
    .from('external_products')
    .delete()
    .eq('is_active', false)
    .limit(deletionTarget);
    
  if (\!inactiveError) {
    const { count: remainingCount } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true });
      
    deletedCount = totalCount - remainingCount;
    console.log(`- 非アクティブ商品: ${deletedCount.toLocaleString()}件削除`);
    
    if (deletedCount >= deletionTarget) {
      console.log('✅ 削除目標達成');
      return;
    }
  }
  
  // 2.2 低優先度ブランドの削除
  const remainingToDelete = deletionTarget - deletedCount;
  
  // 優先度の高いものから順に削除対象外にする
  for (let priority = 7; priority >= 0; priority--) {
    const { error: priorityError } = await supabase
      .from('external_products')
      .delete()
      .eq('brand_priority', priority)
      .limit(remainingToDelete);
      
    if (\!priorityError) {
      const { count: newCount } = await supabase
        .from('external_products')
        .select('*', { count: 'exact', head: true });
        
      const newlyDeleted = (totalCount - deletedCount) - newCount;
      console.log(`- 優先度${priority}ブランド: ${newlyDeleted.toLocaleString()}件削除`);
      
      deletedCount = totalCount - newCount;
      
      if (deletedCount >= deletionTarget) {
        console.log('✅ 削除目標達成');
        return;
      }
    }
  }
  
  // 2.3 最後の手段：古い順に削除
  if (deletedCount < deletionTarget) {
    const finalTarget = deletionTarget - deletedCount;
    
    const { data: oldestProducts } = await supabase
      .from('external_products')
      .select('product_id')
      .order('last_synced', { ascending: true })
      .limit(finalTarget);
      
    if (oldestProducts && oldestProducts.length > 0) {
      const productIds = oldestProducts.map(p => p.product_id);
      
      // バッチで削除（100件ずつ）
      const batchSize = 100;
      const batches = Math.ceil(productIds.length / batchSize);
      
      for (let i = 0; i < batches; i++) {
        const batchIds = productIds.slice(i * batchSize, (i + 1) * batchSize);
        
        await supabase
          .from('external_products')
          .delete()
          .in('product_id', batchIds);
      }
      
      console.log(`- 古い商品: ${oldestProducts.length.toLocaleString()}件削除`);
    }
  }
  
  // 3. 最終結果
  const { count: finalCount } = await supabase
    .from('external_products')
    .select('*', { count: 'exact', head: true });
    
  const totalDeleted = totalCount - finalCount;
  
  console.log(`\n📊 緊急削除結果:`)
  console.log(`- 開始時: ${totalCount.toLocaleString()}件`);
  console.log(`- 削除数: ${totalDeleted.toLocaleString()}件`);
  console.log(`- 残り数: ${finalCount.toLocaleString()}件`);
  console.log(`- 削除率: ${((totalDeleted / totalCount) * 100).toFixed(1)}%`);
  
  if (totalDeleted >= deletionTarget) {
    console.log('✅ 削除目標達成');
  } else {
    console.log('⚠️ 削除目標未達成（部分的に削除）');
  }
}

// メイン実行
emergencyDeletion().catch(error => {
  console.error('❌ 実行エラー:', error);
  process.exit(1);
});

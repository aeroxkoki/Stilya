#!/usr/bin/env node

/**
 * 日次パッチスクリプト - MVP最適化版
 * データベースの整合性チェック、パフォーマンス最適化、エラー監視を実行
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// ログ出力用ヘルパー
function log(level, message, data = {}) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${level}] ${message}`, data);
}

// データベース統計の取得
async function getDatabaseStats() {
  log('INFO', '📊 データベース統計を取得中...');
  
  const stats = {};
  
  try {
    // 商品数
    const { count: productCount } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true });
    stats.products = productCount || 0;
    
    // スワイプ数
    const { count: swipeCount } = await supabase
      .from('swipes')
      .select('*', { count: 'exact', head: true });
    stats.swipes = swipeCount || 0;
    
    // ユーザー数
    const { count: userCount } = await supabase
      .from('user_preferences')
      .select('*', { count: 'exact', head: true });
    stats.users = userCount || 0;
    
    // 今日のアクティビティ
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { count: todaySwipes } = await supabase
      .from('swipes')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString());
    stats.todaySwipes = todaySwipes || 0;
    
    log('INFO', '✅ 統計情報:', stats);
    return stats;
    
  } catch (error) {
    log('ERROR', '❌ 統計情報の取得に失敗:', error);
    return null;
  }
}

// 画像URLの最適化
async function optimizeImageUrls() {
  log('INFO', '🖼️ 画像URL最適化を開始...');
  
  try {
    // Rakuten画像のサムネイルURLを高解像度に変換
    const { data: needsOptimization, error: fetchError } = await supabase
      .from('external_products')
      .select('id, image_url')
      .like('image_url', '%thumbnail.image.rakuten.co.jp%')
      .not('image_url', 'like', '%800x800%')
      .limit(100);
    
    if (fetchError) throw fetchError;
    
    if (!needsOptimization || needsOptimization.length === 0) {
      log('INFO', '✅ すべての画像URLは最適化済みです');
      return 0;
    }
    
    let optimized = 0;
    for (const product of needsOptimization) {
      const newUrl = product.image_url.replace('128x128', '800x800');
      
      const { error: updateError } = await supabase
        .from('external_products')
        .update({ image_url: newUrl })
        .eq('id', product.id);
      
      if (!updateError) optimized++;
    }
    
    log('INFO', `✅ ${optimized}件の画像URLを最適化しました`);
    return optimized;
    
  } catch (error) {
    log('ERROR', '❌ 画像URL最適化エラー:', error);
    return 0;
  }
}

// Wilson Score計算関数
function calculateProductQualityScore(data) {
  const { reviewCount, reviewAverage } = data;
  
  if (reviewCount === 0) {
    return { total: 30, confidence: 'low' }; // ベースラインスコア
  }
  
  // Wilson Score計算（簡略版）
  const z = 1.96; // 95%信頼区間
  const n = reviewCount;
  const p = reviewAverage / 5;
  
  const score = (p + z*z/(2*n) - z * Math.sqrt(p*(1-p)/n + z*z/(4*n*n))) / (1 + z*z/n);
  
  return {
    total: Math.round(score * 100),
    confidence: reviewCount > 50 ? 'high' : reviewCount > 10 ? 'medium' : 'low'
  };
}

// 商品品質スコアの定期更新
async function updateProductQualityScores() {
  log('INFO', '🏆 商品品質スコアの更新を開始...');
  
  try {
    // priorityフィールドを品質スコア保存に再利用（既存フィールドの活用）
    const { data: products, error: fetchError } = await supabase
      .from('external_products')
      .select('id, review_count, review_average, last_synced')
      .or('priority.is.null,priority.lt.10') // 未設定または低い値
      .order('last_synced', { ascending: false })
      .limit(500);
    
    if (fetchError) throw fetchError;
    
    let updated = 0;
    const updates = [];
    
    for (const product of products) {
      const score = calculateProductQualityScore({
        reviewCount: product.review_count || 0,
        reviewAverage: product.review_average || 0
      });
      
      // バッチ更新用に蓄積
      updates.push({
        id: product.id,
        priority: score.total // priorityフィールドを品質スコアとして使用
      });
      
      if (updates.length >= 50) {
        // 50件ごとにバッチ更新
        const { error } = await supabase
          .from('external_products')
          .upsert(updates, { onConflict: 'id' });
        
        if (!error) updated += updates.length;
        updates.length = 0;
        
        // レート制限考慮
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    // 残りを更新
    if (updates.length > 0) {
      const { error } = await supabase
        .from('external_products')
        .upsert(updates, { onConflict: 'id' });
      
      if (!error) updated += updates.length;
    }
    
    log('INFO', `✅ ${updated}件の品質スコアを更新しました`);
    return updated;
    
  } catch (error) {
    log('ERROR', '❌ 品質スコア更新でエラー:', error);
    return 0;
  }
}

// 期限切れデータのクリーンアップ
async function cleanupExpiredData() {
  log('INFO', '🧹 期限切れデータのクリーンアップを開始...');
  
  try {
    // 30日以上前の非アクティブスワイプを削除
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { count: deletedSwipes } = await supabase
      .from('swipes')
      .delete()
      .eq('result', 'no')
      .lt('created_at', thirtyDaysAgo.toISOString());
    
    log('INFO', `✅ ${deletedSwipes || 0}件の古いスワイプを削除しました`);
    
    // 重複商品の確認
    const { data: duplicates } = await supabase
      .rpc('find_duplicate_products');
    
    if (duplicates && duplicates.length > 0) {
      log('WARN', `⚠️ ${duplicates.length}件の重複商品が見つかりました`);
    }
    
    return deletedSwipes || 0;
    
  } catch (error) {
    log('ERROR', '❌ クリーンアップエラー:', error);
    return 0;
  }
}

// インデックスの最適化
async function optimizeIndexes() {
  log('INFO', '🔧 インデックス最適化を開始...');
  
  try {
    // VACUUMとANALYZEは通常のクエリでは実行できないため、
    // 代わりにインデックスの使用状況を確認
    const { data: slowQueries } = await supabase
      .rpc('get_slow_queries')
      .limit(5);
    
    if (slowQueries && slowQueries.length > 0) {
      log('WARN', `⚠️ ${slowQueries.length}件の遅いクエリが検出されました`);
      slowQueries.forEach((query, index) => {
        log('WARN', `  ${index + 1}. ${query.query_text?.substring(0, 100)}...`);
      });
    } else {
      log('INFO', '✅ パフォーマンスは良好です');
    }
    
    return true;
    
  } catch (error) {
    // RPCが存在しない場合は無視
    if (error.message?.includes('rpc')) {
      log('INFO', 'ℹ️ パフォーマンス監視RPCは未実装です');
    } else {
      log('ERROR', '❌ インデックス最適化エラー:', error);
    }
    return false;
  }
}

// 健全性チェック
async function performHealthCheck() {
  log('INFO', '🏥 健全性チェックを開始...');
  
  const health = {
    database: false,
    api: false,
    storage: false
  };
  
  try {
    // データベース接続チェック
    const { error: dbError } = await supabase
      .from('external_products')
      .select('id')
      .limit(1);
    health.database = !dbError;
    
    // APIヘルスチェック
    const { error: apiError } = await supabase.auth.getSession();
    health.api = !apiError;
    
    // ストレージチェック（プロファイル画像の存在確認）
    const { data: storageList, error: storageError } = await supabase
      .storage
      .from('product-images')
      .list('', { limit: 1 });
    health.storage = !storageError;
    
    const allHealthy = Object.values(health).every(v => v);
    
    if (allHealthy) {
      log('INFO', '✅ すべてのシステムは正常です', health);
    } else {
      log('WARN', '⚠️ 一部のシステムに問題があります', health);
    }
    
    return health;
    
  } catch (error) {
    log('ERROR', '❌ 健全性チェックエラー:', error);
    return health;
  }
}

// メイン実行関数
async function runDailyPatch() {
  const startTime = Date.now();
  
  console.log('=====================================');
  console.log('🔧 Stilya 日次パッチ - MVP最適化版');
  console.log('=====================================\n');
  
  const results = {
    stats: null,
    optimizedImages: 0,
    cleanedData: 0,
    indexOptimization: false,
    qualityScores: 0, // 品質スコア更新結果を追加
    health: null,
    duration: 0
  };
  
  try {
    // 1. データベース統計
    results.stats = await getDatabaseStats();
    
    // 2. 画像URL最適化
    results.optimizedImages = await optimizeImageUrls();
    
    // 3. 品質スコア更新を追加
    results.qualityScores = await updateProductQualityScores();
    
    // 4. 期限切れデータのクリーンアップ
    results.cleanedData = await cleanupExpiredData();
    
    // 5. インデックス最適化
    results.indexOptimization = await optimizeIndexes();
    
    // 6. 健全性チェック
    results.health = await performHealthCheck();
    
    // 実行時間
    results.duration = Date.now() - startTime;
    
    // サマリー出力
    console.log('\n=====================================');
    console.log('📋 実行サマリー');
    console.log('=====================================');
    console.log(`✅ 実行時間: ${results.duration}ms`);
    console.log(`✅ 最適化された画像: ${results.optimizedImages}件`);
    console.log(`✅ 更新された品質スコア: ${results.qualityScores}件`);
    console.log(`✅ クリーンアップされたデータ: ${results.cleanedData}件`);
    
    // パッチ実行ログを記録
    await supabase
      .from('maintenance_logs')
      .insert({
        task_name: 'daily_patch',
        status: 'success',
        details: results,
        executed_at: new Date().toISOString()
      });
    
    log('INFO', '✅ 日次パッチが正常に完了しました！');
    
  } catch (error) {
    log('ERROR', '❌ 日次パッチ実行中にエラーが発生しました:', error);
    
    // エラーログを記録
    await supabase
      .from('maintenance_logs')
      .insert({
        task_name: 'daily_patch',
        status: 'error',
        details: { error: error.message },
        executed_at: new Date().toISOString()
      });
    
    process.exit(1);
  }
}

// エラーハンドリング
process.on('unhandledRejection', (error) => {
  log('ERROR', '❌ 未処理のエラー:', error);
  process.exit(1);
});

// 実行
if (require.main === module) {
  runDailyPatch();
}

module.exports = { runDailyPatch };

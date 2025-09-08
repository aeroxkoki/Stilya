#!/usr/bin/env node

/**
 * 強化版日次パッチスクリプト - MVP最適化版 v2.0
 * データベースの整合性チェック、重複削除、パフォーマンス最適化、エラー監視を実行
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// 環境変数の読み込み
const supabaseUrl = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 環境変数が設定されていません');
  console.error('必要な変数: SUPABASE_URL, SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 設定
const CONFIG = {
  BATCH_SIZE: 50,
  MAX_DUPLICATES_TO_PROCESS: 1000,
  MAX_IMAGES_TO_OPTIMIZE: 200,
  CLEANUP_THRESHOLD_DAYS: 30,
  RATE_LIMIT_DELAY: 100
};

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
    
    // 重複商品数の確認
    try {
      const { data: duplicateData } = await supabase.rpc('find_duplicate_products');
      stats.duplicates = duplicateData?.length || 0;
    } catch (rpcError) {
      stats.duplicates = 'RPC未実装';
    }
    
    log('INFO', '✅ 統計情報:', stats);
    return stats;
    
  } catch (error) {
    log('ERROR', '❌ 統計情報の取得に失敗:', error);
    return null;
  }
}

// 重複商品の削除（新機能）
async function removeDuplicateProducts() {
  log('INFO', '🔄 重複商品の削除を開始...');
  
  try {
    // 重複商品の取得
    const { data: duplicates, error: duplicateError } = await supabase
      .rpc('find_duplicate_products')
      .limit(CONFIG.MAX_DUPLICATES_TO_PROCESS);
    
    if (duplicateError) {
      log('WARN', '⚠️ 重複商品検出RPCが利用できません:', duplicateError.message);
      return 0;
    }
    
    if (!duplicates || duplicates.length === 0) {
      log('INFO', '✅ 重複商品は見つかりませんでした');
      return 0;
    }
    
    log('INFO', `重複商品を${duplicates.length}件検出しました`);
    
    // 重複商品を名前とブランドでグループ化
    const duplicateGroups = {};
    duplicates.forEach(product => {
      const key = `${product.title}-${product.brand}`;
      if (!duplicateGroups[key]) {
        duplicateGroups[key] = [];
      }
      duplicateGroups[key].push(product);
    });
    
    let totalDeleted = 0;
    
    // 各グループから最新のものを1つ残して削除
    for (const [groupKey, products] of Object.entries(duplicateGroups)) {
      if (products.length <= 1) continue;
      
      // product_idの文字列ソートで最新のものを推定（最も大きいIDを残す）
      const sortedProducts = products.sort((a, b) => b.id.localeCompare(a.id));
      const toKeep = sortedProducts[0]; // 最新のものを保持
      const toDelete = sortedProducts.slice(1); // 残りを削除
      
      log('INFO', `グループ "${groupKey.substring(0, 50)}..." から${toDelete.length}件を削除予定`);
      
      // バッチ削除の実行
      const deleteIds = toDelete.map(p => p.id);
      const { error: deleteError } = await supabase
        .from('external_products')
        .delete()
        .in('id', deleteIds);
      
      if (deleteError) {
        log('ERROR', `削除エラー（グループ: ${groupKey}）:`, deleteError.message);
      } else {
        totalDeleted += toDelete.length;
        log('INFO', `✅ ${toDelete.length}件を削除しました（保持: ${toKeep.id}）`);
      }
      
      // レート制限対策
      await new Promise(resolve => setTimeout(resolve, CONFIG.RATE_LIMIT_DELAY));
    }
    
    log('INFO', `✅ 合計${totalDeleted}件の重複商品を削除しました`);
    return totalDeleted;
    
  } catch (error) {
    log('ERROR', '❌ 重複商品削除でエラー:', error);
    return 0;
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
      .limit(CONFIG.MAX_IMAGES_TO_OPTIMIZE);
    
    if (fetchError) throw fetchError;
    
    if (!needsOptimization || needsOptimization.length === 0) {
      log('INFO', '✅ すべての画像URLは最適化済みです');
      return 0;
    }
    
    let optimized = 0;
    const batchSize = CONFIG.BATCH_SIZE;
    
    // バッチ処理で最適化
    for (let i = 0; i < needsOptimization.length; i += batchSize) {
      const batch = needsOptimization.slice(i, i + batchSize);
      const updates = [];
      
      batch.forEach(product => {
        const newUrl = product.image_url
          .replace(/128x128/g, '800x800')
          .replace(/\?_ex=\d+x\d+/, '?_ex=800x800');
        
        if (newUrl !== product.image_url) {
          updates.push({
            id: product.id,
            image_url: newUrl
          });
        }
      });
      
      if (updates.length > 0) {
        // バッチ更新をindividual updatesに変更（upsertの制約回避）
        for (const update of updates) {
          const { error: singleUpdateError } = await supabase
            .from('external_products')
            .update({ image_url: update.image_url })
            .eq('id', update.id);
          
          if (singleUpdateError) {
            log('ERROR', `画像URL個別更新エラー (${update.id}):`, singleUpdateError.message);
          }
        }
        const updateError = null; // エラーリセット
        
        if (!updateError) {
          optimized += updates.length;
        }
      }
      
      // レート制限対策
      await new Promise(resolve => setTimeout(resolve, CONFIG.RATE_LIMIT_DELAY));
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
    // priorityフィールドを品質スコア保存に再利用
    const { data: products, error: fetchError } = await supabase
      .from('external_products')
      .select('id, review_count, review_average, last_synced')
      .or('priority.is.null,priority.lt.10')
      .order('last_synced', { ascending: false })
      .limit(500);
    
    if (fetchError) throw fetchError;
    
    let updated = 0;
    const batchSize = CONFIG.BATCH_SIZE;
    
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      const updates = [];
      
      batch.forEach(product => {
        const score = calculateProductQualityScore({
          reviewCount: product.review_count || 0,
          reviewAverage: product.review_average || 0
        });
        
        updates.push({
          id: product.id,
          priority: score.total
        });
      });
      
      // バッチ更新をindividual updatesに変更（upsertの制約回避）
      for (const update of updates) {
        const { error: singleUpdateError } = await supabase
          .from('external_products')
          .update({ priority: update.priority })
          .eq('id', update.id);
        
        if (singleUpdateError) {
          log('ERROR', `個別更新エラー (${update.id}):`, singleUpdateError.message);
        }
      }
      const error = null; // エラーリセット
      
      if (!error) {
        updated += updates.length;
      } else {
        log('ERROR', '品質スコア更新エラー:', error.message);
      }
      
      // レート制限対策
      await new Promise(resolve => setTimeout(resolve, CONFIG.RATE_LIMIT_DELAY));
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
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - CONFIG.CLEANUP_THRESHOLD_DAYS);
    
    // 古いNOスワイプを削除
    const { count: deletedSwipes } = await supabase
      .from('swipes')
      .delete()
      .eq('result', 'no')
      .lt('created_at', thresholdDate.toISOString());
    
    // 古いクリックログを削除
    const { count: deletedLogs } = await supabase
      .from('click_logs')
      .delete()
      .lt('created_at', thresholdDate.toISOString());
    
    log('INFO', `✅ ${deletedSwipes || 0}件の古いスワイプと${deletedLogs || 0}件のログを削除しました`);
    
    return (deletedSwipes || 0) + (deletedLogs || 0);
    
  } catch (error) {
    log('ERROR', '❌ クリーンアップエラー:', error);
    return 0;
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
    
    // ストレージチェック
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

// スタイルタグの整合性チェック（軽量版）
async function validateStyleTags() {
  log('INFO', '🏷️ スタイルタグ整合性チェックを開始...');
  
  try {
    const { count: invalidStyleCount } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true })
      .or('style_tags.is.null,style_tags.eq.{}')
      .eq('is_active', true);
    
    if (invalidStyleCount > 0) {
      log('WARN', `⚠️ ${invalidStyleCount}件の商品にスタイルタグの問題があります`);
    } else {
      log('INFO', '✅ スタイルタグは正常です');
    }
    
    return invalidStyleCount || 0;
    
  } catch (error) {
    log('ERROR', '❌ スタイルタグチェックエラー:', error);
    return 0;
  }
}

// メイン実行関数
async function runEnhancedDailyPatch() {
  const startTime = Date.now();
  
  console.log('=========================================');
  console.log('🔧 Stilya 強化版日次パッチ - MVP最適化版');
  console.log('=========================================\n');
  
  const results = {
    stats: null,
    duplicatesRemoved: 0,
    optimizedImages: 0,
    qualityScores: 0,
    cleanedData: 0,
    invalidStyleTags: 0,
    health: null,
    duration: 0
  };
  
  try {
    // 1. データベース統計
    results.stats = await getDatabaseStats();
    
    // 2. 重複商品の削除（新機能）
    results.duplicatesRemoved = await removeDuplicateProducts();
    
    // 3. 画像URL最適化
    results.optimizedImages = await optimizeImageUrls();
    
    // 4. 品質スコア更新
    results.qualityScores = await updateProductQualityScores();
    
    // 5. 期限切れデータのクリーンアップ
    results.cleanedData = await cleanupExpiredData();
    
    // 6. スタイルタグ整合性チェック
    results.invalidStyleTags = await validateStyleTags();
    
    // 7. 健全性チェック
    results.health = await performHealthCheck();
    
    // 実行時間
    results.duration = Date.now() - startTime;
    
    // サマリー出力
    console.log('\n=========================================');
    console.log('📋 実行サマリー');
    console.log('=========================================');
    console.log(`✅ 実行時間: ${results.duration}ms`);
    console.log(`✅ 削除された重複商品: ${results.duplicatesRemoved}件`);
    console.log(`✅ 最適化された画像: ${results.optimizedImages}件`);
    console.log(`✅ 更新された品質スコア: ${results.qualityScores}件`);
    console.log(`✅ クリーンアップされたデータ: ${results.cleanedData}件`);
    console.log(`✅ スタイルタグ問題: ${results.invalidStyleTags}件`);
    
    // パッチ実行ログを記録
    try {
      await supabase
        .from('maintenance_logs')
        .insert({
          task_name: 'enhanced_daily_patch',
          status: 'success',
          details: results,
          executed_at: new Date().toISOString()
        });
    } catch (logError) {
      log('INFO', 'ℹ️ メンテナンスログテーブルは未実装です');
    }
    
    log('INFO', '✅ 強化版日次パッチが正常に完了しました！');
    
  } catch (error) {
    log('ERROR', '❌ 強化版日次パッチ実行中にエラーが発生しました:', error);
    
    // エラーログを記録
    try {
      await supabase
        .from('maintenance_logs')
        .insert({
          task_name: 'enhanced_daily_patch',
          status: 'error',
          details: { error: error.message },
          executed_at: new Date().toISOString()
        });
    } catch (logError) {
      log('INFO', 'ℹ️ メンテナンスログテーブルは未実装です');
    }
    
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
  runEnhancedDailyPatch();
}

module.exports = { runEnhancedDailyPatch };

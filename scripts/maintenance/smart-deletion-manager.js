#!/usr/bin/env node
/**
 * 包括的な商品削除管理スクリプト
 * 
 * 機能:
 * - 古い商品の削除（日数ベース）
 * - 容量ベースの削除（容量超過時に古い商品から削除）
 * - 優先度ベースの削除（低優先度商品を優先削除）
 * - 季節外れ商品の削除
 * - 削除前の確認とレポート
 */

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

// 削除設定
const DELETION_CONFIG = {
  // 古い商品の削除基準（日数）
  OLD_PRODUCT_DAYS: 14,
  // 季節外れ商品の削除基準（月数）
  OUT_OF_SEASON_MONTHS: 3,
  // 容量ベースの削除トリガー（%）
  CAPACITY_TRIGGER_PERCENT: 80,
  // 目標容量（%）
  TARGET_CAPACITY_PERCENT: 70,
  // 一度に削除する最大数
  MAX_DELETE_BATCH: 1000,
  // 優先度削除の閾値
  PRIORITY_THRESHOLD: 5,
  // ドライランモード（削除せずにレポートのみ）
  DRY_RUN: process.env.DRY_RUN === 'true' || process.argv.includes('--dry-run'),
};

/**
 * 現在の季節を取得
 */
function getCurrentSeason() {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
}

/**
 * 季節タグのマッピング
 */
const SEASON_TAGS = {
  spring: ['春', 'スプリング', '薄手', 'パステル'],
  summer: ['夏', 'サマー', '涼感', 'ノースリーブ', '半袖'],
  autumn: ['秋', 'オータム', 'ニット', 'チェック'],
  winter: ['冬', 'ウィンター', 'コート', '厚手', 'ウール'],
};

/**
 * データベース使用量を取得
 */
async function getDatabaseUsage() {
  try {
    const { count: totalProducts } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true });

    const avgProductSize = 1024; // 1KB per product
    const totalSizeMB = (totalProducts * avgProductSize) / (1024 * 1024);
    const usagePercent = (totalSizeMB / 500) * 100; // 500MB free tier limit

    return {
      totalProducts: totalProducts || 0,
      totalSizeMB,
      usagePercent,
    };
  } catch (error) {
    console.error('❌ 使用量取得エラー:', error);
    return null;
  }
}

/**
 * 削除対象の商品を特定
 */
async function identifyProductsForDeletion(options = {}) {
  const candidates = {
    old: [],
    lowPriority: [],
    outOfSeason: [],
    inactive: [],
  };

  try {
    // 1. 古い商品（last_syncedベース）
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - DELETION_CONFIG.OLD_PRODUCT_DAYS);

    const { data: oldProducts } = await supabase
      .from('external_products')
      .select('id, title, brand, last_synced, priority')
      .lt('last_synced', oldDate.toISOString())
      .order('last_synced', { ascending: true })
      .limit(DELETION_CONFIG.MAX_DELETE_BATCH);

    candidates.old = oldProducts || [];

    // 2. 低優先度商品
    const { data: lowPriorityProducts } = await supabase
      .from('external_products')
      .select('id, title, brand, priority')
      .gte('priority', DELETION_CONFIG.PRIORITY_THRESHOLD)
      .order('priority', { ascending: false })
      .order('last_synced', { ascending: true })
      .limit(DELETION_CONFIG.MAX_DELETE_BATCH);

    candidates.lowPriority = lowPriorityProducts || [];

    // 3. 季節外れ商品
    const currentSeason = getCurrentSeason();
    const oppositeSeasons = {
      spring: ['autumn', 'winter'],
      summer: ['winter'],
      autumn: ['spring', 'summer'],
      winter: ['summer'],
    };

    const outOfSeasonTags = [];
    oppositeSeasons[currentSeason].forEach(season => {
      outOfSeasonTags.push(...SEASON_TAGS[season]);
    });

    // 季節タグを含む商品を検索
    const { data: seasonalProducts } = await supabase
      .from('external_products')
      .select('id, title, brand, tags, is_seasonal')
      .eq('is_seasonal', true)
      .limit(5000); // 多めに取得して後でフィルタリング

    candidates.outOfSeason = (seasonalProducts || []).filter(product => {
      return product.tags?.some(tag => outOfSeasonTags.includes(tag));
    }).slice(0, DELETION_CONFIG.MAX_DELETE_BATCH);

    // 4. 非アクティブ商品
    const { data: inactiveProducts } = await supabase
      .from('external_products')
      .select('id, title, brand')
      .eq('is_active', false)
      .limit(DELETION_CONFIG.MAX_DELETE_BATCH);

    candidates.inactive = inactiveProducts || [];

    return candidates;
  } catch (error) {
    console.error('❌ 削除対象特定エラー:', error);
    return candidates;
  }
}

/**
 * 削除の優先順位を決定
 */
function prioritizeDeletion(candidates, targetDeleteCount) {
  const prioritizedList = [];

  // 優先順位: 非アクティブ > 季節外れ > 低優先度 > 古い
  prioritizedList.push(
    ...candidates.inactive.map(p => ({ ...p, reason: '非アクティブ' })),
    ...candidates.outOfSeason.map(p => ({ ...p, reason: '季節外れ' })),
    ...candidates.lowPriority.map(p => ({ ...p, reason: '低優先度' })),
    ...candidates.old.map(p => ({ ...p, reason: '古い商品' }))
  );

  // 重複を除去（IDベース）
  const uniqueProducts = [];
  const seenIds = new Set();

  for (const product of prioritizedList) {
    if (!seenIds.has(product.id)) {
      seenIds.add(product.id);
      uniqueProducts.push(product);
    }
  }

  return uniqueProducts.slice(0, targetDeleteCount);
}

/**
 * 削除レポートの生成
 */
function generateDeletionReport(productsToDelete, usage) {
  const report = {
    timestamp: new Date().toISOString(),
    currentUsage: usage,
    deletionSummary: {
      total: productsToDelete.length,
      byReason: {},
    },
    estimatedNewUsage: {
      products: usage.totalProducts - productsToDelete.length,
      sizeMB: ((usage.totalProducts - productsToDelete.length) * 1024) / (1024 * 1024),
      percent: (((usage.totalProducts - productsToDelete.length) * 1024) / (1024 * 1024) / 500) * 100,
    },
  };

  // 理由別の集計
  productsToDelete.forEach(product => {
    const reason = product.reason || 'その他';
    report.deletionSummary.byReason[reason] = (report.deletionSummary.byReason[reason] || 0) + 1;
  });

  return report;
}

/**
 * 削除の実行
 */
async function executeDelection(productsToDelete) {
  if (DELETION_CONFIG.DRY_RUN) {
    console.log('🔍 ドライランモード - 実際の削除は行いません');
    return { success: true, deleted: 0 };
  }

  const batchSize = 100;
  let deleted = 0;

  try {
    // バッチ処理で削除
    for (let i = 0; i < productsToDelete.length; i += batchSize) {
      const batch = productsToDelete.slice(i, i + batchSize);
      const ids = batch.map(p => p.id);

      const { error } = await supabase
        .from('external_products')
        .delete()
        .in('id', ids);

      if (error) {
        console.error(`❌ バッチ削除エラー:`, error);
      } else {
        deleted += batch.length;
        console.log(`  ✅ ${deleted}/${productsToDelete.length} 件削除完了`);
      }

      // レート制限対策
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return { success: true, deleted };
  } catch (error) {
    console.error('❌ 削除実行エラー:', error);
    return { success: false, deleted };
  }
}

/**
 * 削除履歴の保存
 */
async function saveDeletionHistory(report, productsDeleted) {
  try {
    const historyEntry = {
      executed_at: new Date().toISOString(),
      dry_run: DELETION_CONFIG.DRY_RUN,
      products_deleted: productsDeleted.length,
      deletion_summary: report.deletionSummary,
      usage_before: {
        products: report.currentUsage.totalProducts,
        size_mb: report.currentUsage.totalSizeMB,
        percent: report.currentUsage.usagePercent,
      },
      usage_after: report.estimatedNewUsage,
      sample_products: productsDeleted.slice(0, 10).map(p => ({
        id: p.id,
        title: p.title,
        brand: p.brand,
        reason: p.reason,
      })),
    };

    // 履歴をログファイルに保存
    const fs = require('fs').promises;
    const logDir = path.join(__dirname, '..', '..', 'logs');
    await fs.mkdir(logDir, { recursive: true });

    const logFile = path.join(logDir, `deletion-history-${Date.now()}.json`);
    await fs.writeFile(logFile, JSON.stringify(historyEntry, null, 2));

    console.log(`📝 削除履歴を保存: ${logFile}`);
  } catch (error) {
    console.error('⚠️ 履歴保存エラー:', error);
  }
}

/**
 * レポートの表示
 */
function displayReport(report, productsToDelete) {
  console.log('\n📊 削除レポート');
  console.log('='.repeat(50));

  console.log('\n🗄️ 現在の使用状況:');
  console.log(`  商品数: ${report.currentUsage.totalProducts.toLocaleString()}件`);
  console.log(`  使用量: ${report.currentUsage.totalSizeMB.toFixed(2)} MB`);
  console.log(`  使用率: ${report.currentUsage.usagePercent.toFixed(1)}%`);

  console.log('\n🗑️ 削除対象:');
  console.log(`  総数: ${report.deletionSummary.total}件`);
  Object.entries(report.deletionSummary.byReason).forEach(([reason, count]) => {
    console.log(`  ${reason}: ${count}件`);
  });

  console.log('\n📈 削除後の予想:');
  console.log(`  商品数: ${report.estimatedNewUsage.products.toLocaleString()}件`);
  console.log(`  使用量: ${report.estimatedNewUsage.sizeMB.toFixed(2)} MB`);
  console.log(`  使用率: ${report.estimatedNewUsage.percent.toFixed(1)}%`);

  if (productsToDelete.length > 0) {
    console.log('\n📋 削除対象サンプル（最初の10件）:');
    productsToDelete.slice(0, 10).forEach((product, index) => {
      console.log(`  ${index + 1}. ${product.title} (${product.brand}) - ${product.reason}`);
    });
  }

  console.log('\n' + '='.repeat(50));
}

/**
 * メイン処理
 */
async function main() {
  console.log('🚀 商品削除管理を開始...\n');

  try {
    // 1. 現在の使用状況を確認
    const usage = await getDatabaseUsage();
    if (!usage) {
      console.error('使用状況の取得に失敗しました');
      return;
    }

    console.log(`📊 現在の容量使用率: ${usage.usagePercent.toFixed(1)}%`);

    // 2. 削除が必要かチェック
    let targetDeleteCount = 0;
    if (usage.usagePercent > DELETION_CONFIG.CAPACITY_TRIGGER_PERCENT) {
      // 目標容量まで削減
      const targetProducts = Math.floor((DELETION_CONFIG.TARGET_CAPACITY_PERCENT / 100) * 500 * 1024);
      targetDeleteCount = usage.totalProducts - targetProducts;
      console.log(`⚠️ 容量超過 - ${targetDeleteCount}件の削除が必要`);
    } else {
      // 定期メンテナンス
      console.log('✅ 容量は健全 - 定期メンテナンスを実行');
    }

    // 3. 削除対象を特定
    const candidates = await identifyProductsForDeletion();
    
    // 削除対象がない場合
    const totalCandidates = 
      candidates.old.length + 
      candidates.lowPriority.length + 
      candidates.outOfSeason.length + 
      candidates.inactive.length;

    if (totalCandidates === 0) {
      console.log('✨ 削除対象の商品はありません');
      return;
    }

    console.log(`\n🔍 削除候補を発見:`);
    console.log(`  古い商品: ${candidates.old.length}件`);
    console.log(`  低優先度: ${candidates.lowPriority.length}件`);
    console.log(`  季節外れ: ${candidates.outOfSeason.length}件`);
    console.log(`  非アクティブ: ${candidates.inactive.length}件`);

    // 4. 削除の優先順位を決定
    const deleteCount = targetDeleteCount || Math.min(totalCandidates, 1000);
    const productsToDelete = prioritizeDeletion(candidates, deleteCount);

    // 5. レポート生成
    const report = generateDeletionReport(productsToDelete, usage);
    displayReport(report, productsToDelete);

    // 6. 確認（対話式の場合）
    if (!DELETION_CONFIG.DRY_RUN && productsToDelete.length > 0) {
      console.log('\n⚠️ 本当に削除を実行しますか？');
      console.log('  環境変数 DRY_RUN=true または --dry-run オプションでテスト実行できます');
      console.log('  Ctrl+C でキャンセル、Enter で続行...');
      
      // CI環境では自動実行
      if (process.env.CI !== 'true') {
        await new Promise(resolve => {
          process.stdin.once('data', resolve);
        });
      }
    }

    // 7. 削除実行
    if (productsToDelete.length > 0) {
      const result = await executeDelection(productsToDelete);
      
      if (result.success) {
        console.log(`\n✅ ${result.deleted}件の商品を削除しました`);
      } else {
        console.log(`\n⚠️ 削除は部分的に完了: ${result.deleted}件`);
      }

      // 8. 履歴保存
      await saveDeletionHistory(report, productsToDelete);
    }

    // 9. 最終確認
    if (!DELETION_CONFIG.DRY_RUN && productsToDelete.length > 0) {
      const newUsage = await getDatabaseUsage();
      if (newUsage) {
        console.log('\n📊 削除後の状況:');
        console.log(`  商品数: ${newUsage.totalProducts.toLocaleString()}件`);
        console.log(`  使用率: ${newUsage.usagePercent.toFixed(1)}%`);
      }
    }

  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    process.exit(1);
  }
}

// コマンドラインオプションの処理
if (process.argv.includes('--help')) {
  console.log(`
商品削除管理スクリプト

使用方法:
  node smart-deletion-manager.js [オプション]

オプション:
  --dry-run    削除せずにレポートのみ表示
  --help       このヘルプを表示

環境変数:
  DRY_RUN=true  ドライランモード
  `);
  process.exit(0);
}

// 実行
main();

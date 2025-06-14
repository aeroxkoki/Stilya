#!/usr/bin/env node
/**
 * Supabase無料枠モニタリングスクリプト
 * データベース使用量を確認し、最適化の提案を表示
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

// 無料枠の制限
const FREE_TIER_LIMITS = {
  storage: 1024 * 1024 * 1024, // 1GB in bytes
  database: 500 * 1024 * 1024, // 500MB in bytes
  apiCalls: 2000000, // 月間2M
  connections: 50,
  maxProducts: 45000, // 安全マージンを考慮
};

/**
 * 商品データの統計を取得
 */
async function getProductStatistics() {
  try {
    // 全商品数
    const { count: totalProducts, error: countError } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true });

    if (countError) throw countError;

    // アクティブ商品数
    const { count: activeProducts } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // ブランド別商品数
    const { data: brandData } = await supabase
      .from('external_products')
      .select('source_brand')
      .eq('is_active', true);

    const brandCounts = {};
    brandData?.forEach(item => {
      const brand = item.source_brand || 'unknown';
      brandCounts[brand] = (brandCounts[brand] || 0) + 1;
    });

    // 優先度別商品数
    const { data: priorityData } = await supabase
      .from('external_products')
      .select('priority')
      .eq('is_active', true);

    const priorityCounts = {};
    priorityData?.forEach(item => {
      const priority = item.priority || 99;
      priorityCounts[priority] = (priorityCounts[priority] || 0) + 1;
    });

    return {
      total: totalProducts || 0,
      active: activeProducts || 0,
      inactive: (totalProducts || 0) - (activeProducts || 0),
      brands: brandCounts,
      priorities: priorityCounts,
    };
  } catch (error) {
    console.error('❌ 統計情報取得エラー:', error);
    return null;
  }
}

/**
 * データベース使用量の推定
 */
function estimateDBUsage(productCount) {
  // 1商品あたり平均1KB（タグ、説明などを含む）
  const avgProductSize = 1024; // bytes
  const totalSize = productCount * avgProductSize;
  const totalSizeMB = totalSize / (1024 * 1024);
  const usagePercent = (totalSizeMB / 500) * 100;

  return {
    totalSize,
    totalSizeMB,
    usagePercent,
    remainingMB: 500 - totalSizeMB,
    remainingProducts: Math.floor((500 - totalSizeMB) * 1024),
  };
}

/**
 * 最適化の提案を生成
 */
function generateOptimizationSuggestions(stats, usage) {
  const suggestions = [];

  // 容量ベースの提案
  if (usage.usagePercent > 80) {
    suggestions.push({
      level: 'critical',
      message: '⚠️ データベース容量が80%を超えています',
      actions: [
        '古い商品（14日以上更新なし）を削除',
        '非アクティブ商品を完全削除',
        '新規同期を一時停止',
      ],
    });
  } else if (usage.usagePercent > 60) {
    suggestions.push({
      level: 'warning',
      message: '⚡ データベース容量が60%を超えています',
      actions: [
        '古い商品の定期削除を実施',
        '優先度の低いブランドの商品数を制限',
        '1日の同期数を1000件以下に制限',
      ],
    });
  } else {
    suggestions.push({
      level: 'safe',
      message: '✅ データベース容量は健全です',
      actions: [
        '現在のペースで同期を継続可能',
        '新規ブランドの追加も可能',
      ],
    });
  }

  // 商品分布の提案
  const brandCount = Object.keys(stats.brands).length;
  if (brandCount < 5) {
    suggestions.push({
      level: 'info',
      message: '📊 ブランドの多様性が低い',
      actions: [
        'MVP戦略に基づいて新規ブランドを追加',
        '異なる価格帯のブランドを追加',
      ],
    });
  }

  // 優先度の分布
  const highPriorityCount = stats.priorities[0] + stats.priorities[1] + stats.priorities[2] || 0;
  const highPriorityPercent = (highPriorityCount / stats.active) * 100;
  
  if (highPriorityPercent < 30) {
    suggestions.push({
      level: 'info',
      message: '🎯 高優先度商品が少ない',
      actions: [
        'UNIQLO、GU、無印良品の商品を増やす',
        '優先度の見直しを実施',
      ],
    });
  }

  return suggestions;
}

/**
 * レポートの表示
 */
function displayReport(stats, usage, suggestions) {
  console.log('\n🔍 Supabase無料枠モニタリングレポート');
  console.log('=' .repeat(50));

  // 商品統計
  console.log('\n📦 商品統計:');
  console.log(`  総商品数: ${stats.total.toLocaleString()}件`);
  console.log(`  アクティブ: ${stats.active.toLocaleString()}件`);
  console.log(`  非アクティブ: ${stats.inactive.toLocaleString()}件`);

  // データベース使用量
  console.log('\n💾 データベース使用量:');
  console.log(`  推定使用量: ${usage.totalSizeMB.toFixed(2)} MB`);
  console.log(`  使用率: ${usage.usagePercent.toFixed(1)}%`);
  console.log(`  残り容量: ${usage.remainingMB.toFixed(2)} MB`);
  console.log(`  追加可能商品数: 約${usage.remainingProducts.toLocaleString()}件`);

  // ブランド分布
  console.log('\n🏷️ ブランド別商品数:');
  Object.entries(stats.brands)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .forEach(([brand, count]) => {
      console.log(`  ${brand}: ${count}件`);
    });

  // 優先度分布
  console.log('\n⭐ 優先度別商品数:');
  Object.entries(stats.priorities)
    .sort(([a], [b]) => parseInt(a) - parseInt(b))
    .forEach(([priority, count]) => {
      console.log(`  優先度${priority}: ${count}件`);
    });

  // 最適化提案
  console.log('\n💡 最適化提案:');
  suggestions.forEach(suggestion => {
    const icon = {
      critical: '🚨',
      warning: '⚠️',
      safe: '✅',
      info: 'ℹ️',
    }[suggestion.level];

    console.log(`\n${icon} ${suggestion.message}`);
    suggestion.actions.forEach(action => {
      console.log(`   - ${action}`);
    });
  });

  // API使用量の推定
  const estimatedDailyCalls = stats.active * 2; // 1商品あたり2回（取得・更新）
  const monthlyCallsEstimate = estimatedDailyCalls * 30;
  const apiUsagePercent = (monthlyCallsEstimate / FREE_TIER_LIMITS.apiCalls) * 100;

  console.log('\n📡 API使用量（推定）:');
  console.log(`  1日あたり: ${estimatedDailyCalls.toLocaleString()}回`);
  console.log(`  月間推定: ${monthlyCallsEstimate.toLocaleString()}回`);
  console.log(`  使用率: ${apiUsagePercent.toFixed(1)}%`);

  if (apiUsagePercent > 80) {
    console.log('  ⚠️ API使用量が高い - バッチサイズの最適化を検討');
  }

  console.log('\n' + '='.repeat(50));
}

/**
 * メイン処理
 */
async function main() {
  console.log('🚀 Supabase無料枠モニタリングを開始...\n');

  try {
    // 商品統計を取得
    const stats = await getProductStatistics();
    if (!stats) {
      console.error('統計情報の取得に失敗しました');
      return;
    }

    // 使用量を推定
    const usage = estimateDBUsage(stats.total);

    // 最適化提案を生成
    const suggestions = generateOptimizationSuggestions(stats, usage);

    // レポートを表示
    displayReport(stats, usage, suggestions);

    // 危険な状態の場合は警告
    if (usage.usagePercent > 90) {
      console.log('\n🚨 警告: データベース容量が危険水準です！');
      console.log('即座に対策を実施してください。');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    process.exit(1);
  }
}

// 実行
main();

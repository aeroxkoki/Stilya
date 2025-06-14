#!/usr/bin/env node
/**
 * 緊急削除スクリプト
 * 容量が危険水準に達した場合に即座に実行
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 必要な環境変数が設定されていません');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 緊急削除の設定
const EMERGENCY_CONFIG = {
  // 緊急削除のトリガー容量（%）
  EMERGENCY_TRIGGER: 90,
  // 目標容量（%）
  TARGET_CAPACITY: 60,
  // 削除バッチサイズ
  BATCH_SIZE: 500,
};

/**
 * 使用状況の取得
 */
async function getUsage() {
  const { count } = await supabase
    .from('external_products')
    .select('*', { count: 'exact', head: true });

  const totalProducts = count || 0;
  const totalSizeMB = (totalProducts * 1024) / (1024 * 1024);
  const usagePercent = (totalSizeMB / 500) * 100;

  return { totalProducts, totalSizeMB, usagePercent };
}

/**
 * 緊急削除の実行
 */
async function performEmergencyDeletion() {
  console.log('🚨 緊急削除を開始...\n');

  try {
    // 現在の使用状況
    const usage = await getUsage();
    console.log(`📊 現在の使用率: ${usage.usagePercent.toFixed(1)}%`);

    if (usage.usagePercent < EMERGENCY_CONFIG.EMERGENCY_TRIGGER) {
      console.log('✅ 緊急削除は不要です');
      return;
    }

    // 削除必要数の計算
    const targetProducts = Math.floor((EMERGENCY_CONFIG.TARGET_CAPACITY / 100) * 500 * 1024);
    const deleteCount = usage.totalProducts - targetProducts;

    console.log(`⚠️ ${deleteCount}件の削除が必要です`);

    // 削除対象の取得（優先順位順）
    const toDelete = [];

    // 1. 非アクティブ商品
    const { data: inactive } = await supabase
      .from('external_products')
      .select('id')
      .eq('is_active', false)
      .limit(deleteCount);
    toDelete.push(...(inactive || []));

    if (toDelete.length < deleteCount) {
      // 2. 低優先度商品（優先度6以上）
      const { data: lowPriority } = await supabase
        .from('external_products')
        .select('id')
        .gte('priority', 6)
        .order('priority', { ascending: false })
        .limit(deleteCount - toDelete.length);
      toDelete.push(...(lowPriority || []));
    }

    if (toDelete.length < deleteCount) {
      // 3. 古い商品
      const { data: old } = await supabase
        .from('external_products')
        .select('id')
        .order('last_synced', { ascending: true })
        .limit(deleteCount - toDelete.length);
      toDelete.push(...(old || []));
    }

    // バッチ削除
    console.log(`\n🗑️ ${toDelete.length}件を削除中...`);
    
    for (let i = 0; i < toDelete.length; i += EMERGENCY_CONFIG.BATCH_SIZE) {
      const batch = toDelete.slice(i, i + EMERGENCY_CONFIG.BATCH_SIZE);
      const ids = batch.map(item => item.id);

      await supabase
        .from('external_products')
        .delete()
        .in('id', ids);

      console.log(`  削除進捗: ${Math.min(i + EMERGENCY_CONFIG.BATCH_SIZE, toDelete.length)}/${toDelete.length}`);
    }

    // 最終確認
    const newUsage = await getUsage();
    console.log(`\n✅ 削除完了`);
    console.log(`  新しい使用率: ${newUsage.usagePercent.toFixed(1)}%`);
    console.log(`  削除された商品数: ${toDelete.length}`);

  } catch (error) {
    console.error('❌ エラー:', error);
    process.exit(1);
  }
}

// 実行
performEmergencyDeletion();

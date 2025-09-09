#!/usr/bin/env node

/**
 * データベース容量チェックスクリプト
 * Supabaseのデータベース使用状況を監視
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

async function checkCapacity() {
  console.log('📊 データベース容量をチェック中...');
  
  try {
    // 各テーブルのレコード数を取得
    const tables = [
      'external_products',
      'users',
      'swipes',
      'favorites',
      'click_logs',
      'user_session_learning',
      'maintenance_logs'
    ];
    
    let totalRecords = 0;
    const tableStats = {};
    
    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (!error && count !== null) {
        tableStats[table] = count;
        totalRecords += count;
      }
    }
    
    // 概算のデータサイズ計算（1レコード約1KB想定）
    const estimatedSizeMB = (totalRecords * 1024) / (1024 * 1024);
    const limitMB = 500; // Supabase無料プランの制限
    const usagePercentage = ((estimatedSizeMB / limitMB) * 100).toFixed(2);
    
    console.log('✅ 容量チェック完了');
    console.log(`  - 総レコード数: ${totalRecords.toLocaleString()} 件`);
    console.log(`  - 推定使用容量: ${estimatedSizeMB.toFixed(2)} MB`);
    console.log(`  - 制限: ${limitMB} MB`);
    console.log(`  - 使用率: ${usagePercentage}%`);
    console.log('\n📊 テーブル別レコード数:');
    
    Object.entries(tableStats)
      .sort(([, a], [, b]) => b - a)
      .forEach(([table, count]) => {
        console.log(`  - ${table}: ${count.toLocaleString()} 件`);
      });
    
    // 警告レベルのチェック
    if (usagePercentage > 80) {
      console.log('\n⚠️ 警告: データベース容量が80%を超えています！');
      process.exit(1);
    } else if (usagePercentage > 60) {
      console.log('\n⚠️ 注意: データベース容量が60%を超えています。');
    }
    
    return {
      totalRecords,
      estimatedSizeMB,
      usagePercentage: parseFloat(usagePercentage),
      tableStats
    };
    
  } catch (error) {
    console.error('❌ 容量チェックエラー:', error);
    process.exit(1);
  }
}

// 実行
if (require.main === module) {
  checkCapacity()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { checkCapacity };

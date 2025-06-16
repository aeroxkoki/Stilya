#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkDatabaseCapacity() {
  console.log('\n📊 データベース容量チェック\n');
  console.log('='.repeat(60));

  try {
    const { count: totalCount } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true });

    const { count: activeCount } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // 容量計算
    const SAFE_LIMIT = 50000;
    const estimatedSizeMB = (totalCount * 1024) / (1024 * 1024);
    const freeLimit = 500; // MB
    const usagePercent = (estimatedSizeMB / freeLimit * 100).toFixed(2);
    const remainingCapacity = SAFE_LIMIT - totalCount;

    console.log(`\n💾 容量使用状況:`);
    console.log(`  総商品数: ${totalCount.toLocaleString()}件`);
    console.log(`  アクティブ: ${activeCount.toLocaleString()}件`);
    console.log(`  推定サイズ: ${estimatedSizeMB.toFixed(2)} MB`);
    console.log(`  使用率: ${usagePercent}%（無料プラン: 500MB）`);

    console.log(`\n📈 容量管理:`);
    console.log(`  安全上限: ${SAFE_LIMIT.toLocaleString()}件`);
    console.log(`  残り容量: ${remainingCapacity.toLocaleString()}件`);
    console.log(`  使用率: ${((totalCount / SAFE_LIMIT) * 100).toFixed(1)}%`);

    // 日次同期の予測
    const dailyAddition = 1200; // 600件×2回/日
    const daysUntilFull = Math.floor(remainingCapacity / dailyAddition);
    
    console.log(`\n📅 予測:`);
    console.log(`  日次追加数: 約${dailyAddition}件（600件×2回）`);
    console.log(`  満杯まで: 約${daysUntilFull}日`);

    // 推奨事項
    console.log(`\n💡 現在の状況:`);
    if (totalCount < 10000) {
      console.log('  ✅ 余裕があります - 積極的な商品追加が可能');
      console.log('  ✅ 自動削除はまだ動作しません（30,000件まで）');
    } else if (totalCount < 30000) {
      console.log('  ⚠️  中程度 - バランスの取れた管理が必要');
      console.log('  ⚠️  30,000件到達で自動削除が開始されます');
    } else {
      console.log('  🚨 注意 - 古い商品の自動削除が動作中');
    }

    console.log(`\n🎯 GitHub Actions設定:`);
    console.log('  日次実行: 午前3時、午後3時（JST）');
    console.log('  1回の取得: 最大600件');
    console.log('  自動削除: 30,000件超過時に30日以上前の商品を削除');

  } catch (error) {
    console.error('❌ エラー:', error.message);
  }

  console.log('\n' + '='.repeat(60) + '\n');
}

checkDatabaseCapacity();

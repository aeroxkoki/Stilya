#!/usr/bin/env node
/**
 * Supabaseデータベース使用状況チェック
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Service Keyが必要です');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkDatabaseUsage() {
  console.log('📊 データベース使用状況を確認中...\n');

  try {
    // 商品数のカウント
    const { count: productCount } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true });

    console.log(`📦 現在の商品数: ${productCount?.toLocaleString()}件`);

    // テーブルサイズの推定（1商品あたり約1KB）
    const estimatedSizeMB = (productCount * 1024) / (1024 * 1024);
    console.log(`💾 推定データサイズ: ${estimatedSizeMB.toFixed(2)} MB`);

    // Supabase無料プランの制限
    const freeLimit = 500; // MB
    const usagePercent = (estimatedSizeMB / freeLimit * 100).toFixed(1);
    console.log(`📈 使用率: ${usagePercent}% (無料プラン: 500MB)`);

    // 安全に保存できる商品数の計算
    const safeProductLimit = 50000; // 50MB程度を目安に5万商品
    const remainingCapacity = safeProductLimit - productCount;
    console.log(`\n🎯 推奨上限: ${safeProductLimit.toLocaleString()}件`);
    console.log(`📥 追加可能: ${remainingCapacity.toLocaleString()}件`);

    // 最適な同期戦略の提案
    console.log('\n📋 推奨される同期戦略:');
    if (productCount < 10000) {
      console.log('   ✅ 現在: 積極的に商品を追加できます');
      console.log('   - 1日あたり1,000〜2,000件の追加が可能');
      console.log('   - 複数カテゴリからの取得を推奨');
    } else if (productCount < 30000) {
      console.log('   ⚠️  中程度: バランスの取れた追加を推奨');
      console.log('   - 1日あたり500〜1,000件の追加');
      console.log('   - 古い商品の定期削除を検討');
    } else {
      console.log('   🚨 注意: 容量管理が必要です');
      console.log('   - 古い商品の削除を優先');
      console.log('   - 新規追加は厳選して実施');
    }

    // カテゴリ別の分布
    const { data: categories } = await supabase
      .from('external_products')
      .select('category')
      .eq('is_active', true);

    const categoryCount = {};
    categories?.forEach(item => {
      categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
    });

    console.log('\n📂 カテゴリ別商品数:');
    Object.entries(categoryCount).forEach(([cat, count]) => {
      console.log(`   - ${cat}: ${count}件`);
    });

  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

checkDatabaseUsage();

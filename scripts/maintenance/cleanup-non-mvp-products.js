#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function cleanupNonMVPProducts() {
  console.log('\n🧹 MVP以外の商品データをクリーンアップします\n');
  console.log('='.repeat(60));

  try {
    // MVPブランドの定義
    const mvpBrands = ['uniqlo', 'gu', 'coca', 'pierrot', 'urban_research'];
    
    // 現在の状況を確認
    const { count: beforeCount } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true });

    console.log(`\n📊 クリーンアップ前:`);
    console.log(`  総商品数: ${beforeCount}件`);

    // 今日追加された楽天商品を確認
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data: todaysProducts, count: todaysCount } = await supabase
      .from('external_products')
      .select('id, brand, source')
      .gte('last_synced', today.toISOString())
      .eq('source', 'rakuten');

    console.log(`  本日追加された楽天商品: ${todaysCount || 0}件`);

    // MVP以外の楽天商品を削除
    console.log('\n🗑️ MVP以外の商品を削除中...');
    
    // まず、MVPブランドではない楽天商品を削除
    const { error: deleteError, count: deletedCount } = await supabase
      .from('external_products')
      .delete()
      .eq('source', 'rakuten')
      .not('brand', 'in', `(${mvpBrands.join(',')})`);

    if (deleteError) {
      console.error('❌ 削除エラー:', deleteError.message);
    } else {
      console.log(`✅ ${deletedCount || 0}件の非MVP商品を削除しました`);
    }

    // 特に今日追加された分を重点的に削除
    const { error: todayDeleteError } = await supabase
      .from('external_products')
      .delete()
      .gte('last_synced', today.toISOString())
      .eq('source', 'rakuten')
      .neq('category', 'MVP');

    // 削除後の状況を確認
    const { count: afterCount } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true });

    const { data: brandCounts } = await supabase
      .from('external_products')
      .select('brand')
      .eq('is_active', true);

    const counts = {};
    brandCounts?.forEach(item => {
      const brand = item.brand || 'unknown';
      counts[brand] = (counts[brand] || 0) + 1;
    });

    console.log(`\n📊 クリーンアップ後:`);
    console.log(`  総商品数: ${afterCount}件`);
    console.log(`  削除数: ${beforeCount - afterCount}件`);
    
    console.log('\n📈 ブランド別商品数:');
    mvpBrands.forEach(brand => {
      console.log(`  ${brand}: ${counts[brand] || 0}件`);
    });

    // 残っている非MVPブランドを表示
    const nonMvpBrands = Object.keys(counts).filter(b => !mvpBrands.includes(b.toLowerCase()));
    if (nonMvpBrands.length > 0) {
      console.log('\n⚠️  残っている非MVPブランド:');
      nonMvpBrands.slice(0, 10).forEach(brand => {
        console.log(`  ${brand}: ${counts[brand]}件`);
      });
    }

    console.log('\n✅ クリーンアップ完了！');

  } catch (error) {
    console.error('❌ エラー:', error.message);
  }

  console.log('\n' + '='.repeat(60) + '\n');
}

cleanupNonMVPProducts();

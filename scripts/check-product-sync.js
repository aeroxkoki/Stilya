#!/usr/bin/env node
/**
 * Supabaseデータベースの商品同期状況を確認
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// 環境変数の読み込み
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ 環境変数が設定されていません');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkProductSync() {
  console.log('📊 商品同期状況をチェック中...\n');

  try {
    // 1. 商品の総数を取得
    const { count: totalCount } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true });

    console.log(`✅ 総商品数: ${totalCount}件`);

    // 2. アクティブな商品数を確認
    const { count: activeCount } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    console.log(`✅ アクティブ商品数: ${activeCount}件`);

    // 3. ソース別の商品数を確認
    const { data: sourceData } = await supabase
      .from('external_products')
      .select('source')
      .eq('is_active', true);

    const sourceCounts = {};
    sourceData?.forEach(item => {
      sourceCounts[item.source] = (sourceCounts[item.source] || 0) + 1;
    });

    console.log('\n📦 ソース別商品数:');
    Object.entries(sourceCounts).forEach(([source, count]) => {
      console.log(`   - ${source}: ${count}件`);
    });

    // 4. 最新の商品を5件表示
    const { data: latestProducts } = await supabase
      .from('external_products')
      .select('id, title, price, brand, tags, last_synced')
      .eq('is_active', true)
      .order('last_synced', { ascending: false })
      .limit(5);

    console.log('\n🆕 最新同期商品（5件）:');
    latestProducts?.forEach((product, index) => {
      console.log(`\n${index + 1}. ${product.title}`);
      console.log(`   ID: ${product.id}`);
      console.log(`   ブランド: ${product.brand}`);
      console.log(`   価格: ¥${product.price.toLocaleString()}`);
      console.log(`   タグ: ${product.tags.join(', ')}`);
      console.log(`   同期日時: ${new Date(product.last_synced).toLocaleString('ja-JP')}`);
    });

    // 5. 楽天商品の確認
    const { count: rakutenCount } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true })
      .eq('source', 'rakuten')
      .eq('is_active', true);

    console.log(`\n🛍️ 楽天商品数: ${rakutenCount}件`);

    // 6. 本日同期された商品数
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { count: todayCount } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true })
      .gte('last_synced', today.toISOString());

    console.log(`📅 本日同期された商品数: ${todayCount}件`);

    // 7. タグの統計
    const { data: tagsData } = await supabase
      .from('external_products')
      .select('tags')
      .eq('is_active', true);

    const tagCounts = {};
    tagsData?.forEach(item => {
      item.tags?.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    const topTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    console.log('\n🏷️ 人気タグ TOP10:');
    topTags.forEach(([tag, count], index) => {
      console.log(`   ${index + 1}. ${tag}: ${count}件`);
    });

  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message);
    process.exit(1);
  }
}

// 実行
checkProductSync().then(() => {
  console.log('\n✨ チェック完了！');
}).catch(error => {
  console.error('予期しないエラー:', error);
  process.exit(1);
});

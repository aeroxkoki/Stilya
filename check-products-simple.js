#!/usr/bin/env node
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase環境変数が設定されていません');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkProducts() {
  console.log('📊 商品テーブルの状態を確認中...\n');

  try {
    // 1. 商品数のカウント
    console.log('1️⃣ 商品数の確認...');
    const { count: totalCount, error: countError } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ カウントエラー:', countError);
    } else {
      console.log(`✅ 総商品数: ${totalCount}件\n`);
    }

    // 2. アクティブな商品数
    console.log('2️⃣ アクティブな商品数...');
    const { count: activeCount, error: activeError } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    if (activeError) {
      console.error('❌ アクティブカウントエラー:', activeError);
    } else {
      console.log(`✅ アクティブな商品: ${activeCount}件\n`);
    }

    // 3. 画像URLがある商品数
    console.log('3️⃣ 画像URLがある商品数...');
    const { count: withImageCount, error: imageCountError } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .not('image_url', 'is', null)
      .not('image_url', 'eq', '');

    if (imageCountError) {
      console.error('❌ 画像カウントエラー:', imageCountError);
    } else {
      console.log(`✅ 画像URLあり: ${withImageCount}件\n`);
    }

    // 4. 最新の5商品を取得（画像URL確認）
    console.log('4️⃣ 最新の商品を確認...');
    const { data: latestProducts, error: latestError } = await supabase
      .from('external_products')
      .select('id, title, brand, price, image_url')
      .eq('is_active', true)
      .not('image_url', 'is', null)
      .order('last_synced', { ascending: false })
      .limit(5);

    if (latestError) {
      console.error('❌ 最新商品取得エラー:', latestError);
    } else if (latestProducts && latestProducts.length > 0) {
      console.log(`✅ 最新${latestProducts.length}件の商品:\n`);
      latestProducts.forEach((product, index) => {
        console.log(`${index + 1}. ${product.title?.substring(0, 50)}...`);
        console.log(`   ブランド: ${product.brand}`);
        console.log(`   価格: ¥${product.price?.toLocaleString()}`);
        console.log(`   画像URL: ${product.image_url ? '✅ あり' : '❌ なし'}`);
        if (product.image_url) {
          console.log(`   URL形式: ${product.image_url.substring(0, 50)}...`);
        }
        console.log();
      });
    } else {
      console.log('⚠️ 商品が見つかりません');
    }

    // 5. ソース別の集計
    console.log('5️⃣ ソース別集計...');
    const { data: sources, error: sourceError } = await supabase
      .from('external_products')
      .select('source')
      .eq('is_active', true);

    if (!sourceError && sources) {
      const sourceCounts = sources.reduce((acc, item) => {
        acc[item.source] = (acc[item.source] || 0) + 1;
        return acc;
      }, {});

      console.log('ソース別商品数:');
      Object.entries(sourceCounts).forEach(([source, count]) => {
        console.log(`  ${source}: ${count}件`);
      });
    }

  } catch (error) {
    console.error('❌ エラー:', error);
  }
}

checkProducts().then(() => {
  console.log('\n✨ チェック完了');
  process.exit(0);
});

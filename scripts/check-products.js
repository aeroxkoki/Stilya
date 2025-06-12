#!/usr/bin/env node

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Supabase設定
const supabaseUrl = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 環境変数が設定されていません');
  console.error('SUPABASE_URLとSUPABASE_SERVICE_KEYを.envファイルに設定してください');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkProducts() {
  console.log('\n🔍 Supabase商品データの確認を開始します...\n');

  try {
    // 商品総数を確認
    const { count, error: countError } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ 商品数の取得に失敗しました:', countError.message);
      return;
    }

    console.log(`📊 商品総数: ${count || 0}件\n`);

    // アクティブな商品数を確認
    const { count: activeCount } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    console.log(`✅ アクティブな商品数: ${activeCount || 0}件\n`);

    // カテゴリ別の商品数を確認
    const { data: categories, error: catError } = await supabase
      .from('external_products')
      .select('category')
      .eq('is_active', true);

    let categoryCounts = {};
    if (!catError && categories) {
      categoryCounts = categories.reduce((acc, item) => {
        const cat = item.category || '未分類';
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {});

      console.log('📂 カテゴリ別商品数:');
      Object.entries(categoryCounts)
        .sort(([, a], [, b]) => b - a)
        .forEach(([category, count]) => {
          console.log(`  - ${category}: ${count}件`);
        });
    }

    // ブランド別の商品数を確認
    const { data: brands, error: brandError } = await supabase
      .from('external_products')
      .select('brand')
      .eq('is_active', true);

    let brandCounts = {};
    if (!brandError && brands) {
      brandCounts = brands.reduce((acc, item) => {
        const brand = item.brand || '未設定';
        acc[brand] = (acc[brand] || 0) + 1;
        return acc;
      }, {});

      console.log('\n👗 ブランド別商品数（上位10ブランド）:');
      Object.entries(brandCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .forEach(([brand, count]) => {
          console.log(`  - ${brand}: ${count}件`);
        });
    }

    // サンプル商品を表示
    const { data: sampleProducts, error: sampleError } = await supabase
      .from('external_products')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: true })
      .order('last_synced', { ascending: false })
      .limit(5);

    if (!sampleError && sampleProducts) {
      console.log('\n📦 サンプル商品（優先度順上位5件）:');
      sampleProducts.forEach((product, index) => {
        console.log(`\n${index + 1}. ${product.title}`);
        console.log(`   ブランド: ${product.brand}`);
        console.log(`   価格: ¥${product.price.toLocaleString()}`);
        console.log(`   カテゴリ: ${product.category || '未分類'}`);
        console.log(`   タグ: ${product.tags?.join(', ') || 'なし'}`);
        console.log(`   優先度: ${product.priority || '未設定'}`);
      });
    }

    // MVPとの適合性チェック
    console.log('\n🎯 MVP適合性チェック:');
    
    // 価格帯のチェック
    const { data: priceRange } = await supabase
      .from('external_products')
      .select('price')
      .eq('is_active', true);

    if (priceRange && priceRange.length > 0) {
      const prices = priceRange.map(p => p.price);
      const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);

      console.log(`\n💰 価格帯分析:`);
      console.log(`  - 平均価格: ¥${Math.round(avgPrice).toLocaleString()}`);
      console.log(`  - 最低価格: ¥${minPrice.toLocaleString()}`);
      console.log(`  - 最高価格: ¥${maxPrice.toLocaleString()}`);

      // 価格帯別の分布
      const priceRanges = {
        '〜5,000円': prices.filter(p => p <= 5000).length,
        '5,001〜10,000円': prices.filter(p => p > 5000 && p <= 10000).length,
        '10,001〜20,000円': prices.filter(p => p > 10000 && p <= 20000).length,
        '20,001円〜': prices.filter(p => p > 20000).length,
      };

      console.log('\n📊 価格帯別分布:');
      Object.entries(priceRanges).forEach(([range, count]) => {
        const percentage = ((count / prices.length) * 100).toFixed(1);
        console.log(`  - ${range}: ${count}件 (${percentage}%)`);
      });
    }

    // タグの多様性チェック
    const { data: taggedProducts } = await supabase
      .from('external_products')
      .select('tags')
      .eq('is_active', true);

    if (taggedProducts) {
      const allTags = taggedProducts.flatMap(p => p.tags || []);
      const uniqueTags = [...new Set(allTags)];
      const tagCounts = allTags.reduce((acc, tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
      }, {});

      console.log(`\n🏷️ タグ分析:`);
      console.log(`  - ユニークタグ数: ${uniqueTags.length}`);
      console.log(`  - 頻出タグ（上位10）:`);
      Object.entries(tagCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .forEach(([tag, count]) => {
          console.log(`    - ${tag}: ${count}件`);
        });
    }

    // MVP推奨事項
    console.log('\n💡 MVP改善推奨事項:');
    
    if (!count || count < 100) {
      console.log('  ⚠️ 商品数が少ないです。最低100件以上の商品登録を推奨します。');
    }

    if (!activeCount || activeCount < 50) {
      console.log('  ⚠️ アクティブな商品が少ないです。多様な商品を追加してください。');
    }

    const hasVariousCategories = Object.keys(categoryCounts || {}).length >= 5;
    if (!hasVariousCategories) {
      console.log('  ⚠️ カテゴリの多様性が不足しています。様々なカテゴリの商品を追加してください。');
    }

    const hasVariousBrands = Object.keys(brandCounts || {}).length >= 10;
    if (!hasVariousBrands) {
      console.log('  ⚠️ ブランドの多様性が不足しています。様々なブランドの商品を追加してください。');
    }

    console.log('\n✨ チェック完了！\n');

  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message);
  }
}

// メイン実行
checkProducts();

#!/usr/bin/env node

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function analyzeMVPProducts() {
  console.log('\n🔍 StilVya MVP商品データ詳細分析\n');
  console.log('='.repeat(80));

  try {
    // 1. アクティブ商品の総数
    const { count: activeCount } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    console.log(`\n📊 アクティブ商品総数: ${activeCount}件\n`);

    // 2. ブランド別分析
    const { data: products, error } = await supabase
      .from('external_products')
      .select('*')
      .eq('is_active', true);

    if (error) throw error;

    // ブランド別集計
    const brandStats = {};
    const categoryStats = {};
    const priceRanges = {
      '〜3,000円': 0,
      '3,001〜5,000円': 0,
      '5,001〜10,000円': 0,
      '10,001〜20,000円': 0,
      '20,001円〜': 0
    };

    products.forEach(product => {
      // ブランド集計
      const brand = product.brand || 'unknown';
      brandStats[brand] = (brandStats[brand] || 0) + 1;

      // カテゴリ集計
      const category = product.category || '未分類';
      categoryStats[category] = (categoryStats[category] || 0) + 1;

      // 価格帯集計
      const price = product.price;
      if (price <= 3000) priceRanges['〜3,000円']++;
      else if (price <= 5000) priceRanges['3,001〜5,000円']++;
      else if (price <= 10000) priceRanges['5,001〜10,000円']++;
      else if (price <= 20000) priceRanges['10,001〜20,000円']++;
      else priceRanges['20,001円〜']++;
    });

    // 3. ブランド別表示
    console.log('👗 ブランド別商品数:');
    console.log('-'.repeat(40));
    Object.entries(brandStats)
      .sort(([,a], [,b]) => b - a)
      .forEach(([brand, count]) => {
        const percentage = ((count / activeCount) * 100).toFixed(1);
        console.log(`${brand.padEnd(20)} ${String(count).padStart(4)}件 (${percentage}%)`);
      });

    // 4. MVPターゲットブランドの状況
    console.log('\n🎯 MVPターゲットブランドの状況:');
    console.log('-'.repeat(60));
    const targetBrands = ['UNIQLO', 'GU', 'coca', 'pierrot', 'URBAN RESEARCH'];
    targetBrands.forEach(brand => {
      const count = brandStats[brand] || brandStats[brand.toLowerCase()] || 0;
      const status = count >= 20 ? '✅' : count >= 10 ? '🔄' : '❌';
      console.log(`${status} ${brand.padEnd(18)} ${String(count).padStart(3)}件`);
    });

    // 5. 価格帯分析
    console.log('\n💰 価格帯分布:');
    console.log('-'.repeat(40));
    Object.entries(priceRanges).forEach(([range, count]) => {
      const percentage = ((count / activeCount) * 100).toFixed(1);
      const bar = '█'.repeat(Math.floor(percentage / 2));
      console.log(`${range.padEnd(15)} ${String(count).padStart(4)}件 (${percentage.padStart(5)}%) ${bar}`);
    });

    // 6. MVPのための推奨事項
    console.log('\n💡 MVP改善のための推奨事項:');
    console.log('='.repeat(60));

    // UNIQLOとGUの商品不足チェック
    const uniqloCount = brandStats['UNIQLO'] || brandStats['uniqlo'] || 0;
    const guCount = brandStats['GU'] || brandStats['gu'] || 0;

    if (uniqloCount < 30) {
      console.log(`\n⚠️  UNIQLO商品が不足しています（現在: ${uniqloCount}件）`);
      console.log('   推奨: 手動でUNIQLO商品データを追加するか、');
      console.log('         別のAPIソースを検討してください。');
    }

    if (guCount < 30) {
      console.log(`\n⚠️  GU商品が不足しています（現在: ${guCount}件）`);
      console.log('   推奨: 手動でGU商品データを追加するか、');
      console.log('         別のAPIソースを検討してください。');
    }

    // 価格帯の偏りチェック
    const affordableCount = priceRanges['〜3,000円'] + priceRanges['3,001〜5,000円'];
    const affordableRatio = (affordableCount / activeCount) * 100;

    if (affordableRatio < 40) {
      console.log('\n⚠️  手頃な価格帯（〜5,000円）の商品が少ないです');
      console.log(`   現在: ${affordableRatio.toFixed(1)}% → 推奨: 40%以上`);
    }

    // カテゴリの多様性チェック
    const categoryCount = Object.keys(categoryStats).length;
    if (categoryCount < 10) {
      console.log(`\n⚠️  カテゴリの多様性が不足しています（現在: ${categoryCount}種類）`);
      console.log('   推奨: トップス、ボトムス、アウター、ワンピース、');
      console.log('         アクセサリーなど10種類以上のカテゴリ');
    }

    // 7. サンプル商品表示
    console.log('\n📦 各ブランドのサンプル商品:');
    console.log('='.repeat(80));

    for (const brand of ['coca', 'pierrot', 'urban_research']) {
      const { data: samples } = await supabase
        .from('external_products')
        .select('*')
        .eq('is_active', true)
        .eq('brand', brand)
        .limit(2);

      if (samples && samples.length > 0) {
        console.log(`\n【${brand}】`);
        samples.forEach((product, i) => {
          console.log(`${i + 1}. ${product.title}`);
          console.log(`   価格: ¥${product.price.toLocaleString()}`);
          console.log(`   タグ: ${product.tags?.slice(0, 3).join(', ') || 'なし'}`);
        });
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('✨ 分析完了\n');

  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

analyzeMVPProducts();

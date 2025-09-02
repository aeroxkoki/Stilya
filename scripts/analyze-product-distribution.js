const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
);

async function analyzeProductDistribution() {
  console.log('=== 商品分布の詳細分析 ===\n');
  
  // 1. ブランド分布
  const { data: products } = await supabase
    .from('external_products')
    .select('brand, category, gender, tags, price')
    .eq('is_active', true);
  
  const brandCounts = {};
  const categoryCounts = {};
  const styleTagCounts = {};
  
  products?.forEach(p => {
    // ブランド集計
    const brand = p.brand || 'unknown';
    brandCounts[brand] = (brandCounts[brand] || 0) + 1;
    
    // カテゴリ集計
    const category = p.category || 'unknown';
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    
    // スタイルタグ集計
    if (p.tags && Array.isArray(p.tags)) {
      p.tags.forEach(tag => {
        styleTagCounts[tag] = (styleTagCounts[tag] || 0) + 1;
      });
    }
  });
  
  console.log('📊 ブランド分布（上位10）:');
  const sortedBrands = Object.entries(brandCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  sortedBrands.forEach(([brand, count]) => {
    console.log(`  ${brand}: ${count}件`);
  });
  
  console.log('\n📊 カテゴリ分布:');
  Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([category, count]) => {
      console.log(`  ${category}: ${count}件`);
    });
  
  console.log('\n📊 スタイルタグ分布（上位20）:');
  const sortedTags = Object.entries(styleTagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);
  sortedTags.forEach(([tag, count]) => {
    console.log(`  ${tag}: ${count}件`);
  });
  
  // 2. 価格帯分析
  const priceRanges = {
    '0-5000': 0,
    '5000-10000': 0,
    '10000-20000': 0,
    '20000-30000': 0,
    '30000+': 0
  };
  
  products?.forEach(p => {
    const price = p.price || 0;
    if (price < 5000) priceRanges['0-5000']++;
    else if (price < 10000) priceRanges['5000-10000']++;
    else if (price < 20000) priceRanges['10000-20000']++;
    else if (price < 30000) priceRanges['20000-30000']++;
    else priceRanges['30000+']++;
  });
  
  console.log('\n💰 価格帯分布:');
  Object.entries(priceRanges).forEach(([range, count]) => {
    console.log(`  ${range}円: ${count}件`);
  });
  
  // 3. 性別とスタイルの組み合わせ分析
  console.log('\n🎯 性別×主要スタイルタグの分布:');
  const genderStyleMatrix = {};
  
  products?.forEach(p => {
    const gender = p.gender || 'unknown';
    if (!genderStyleMatrix[gender]) {
      genderStyleMatrix[gender] = {};
    }
    
    if (p.tags && Array.isArray(p.tags)) {
      // 主要なスタイルタグをチェック
      const mainStyles = ['カジュアル', 'ストリート', 'モード', 'ナチュラル', 'フェミニン', 'クラシック'];
      mainStyles.forEach(style => {
        if (p.tags.some(tag => tag.includes(style))) {
          genderStyleMatrix[gender][style] = (genderStyleMatrix[gender][style] || 0) + 1;
        }
      });
    }
  });
  
  Object.entries(genderStyleMatrix).forEach(([gender, styles]) => {
    console.log(`\n  ${gender}:`);
    Object.entries(styles).forEach(([style, count]) => {
      console.log(`    ${style}: ${count}件`);
    });
  });
  
  // 4. 問題の診断
  console.log('\n⚠️ 問題診断:');
  
  const maleProducts = products?.filter(p => p.gender === 'male').length || 0;
  const femaleProducts = products?.filter(p => p.gender === 'female').length || 0;
  const unisexProducts = products?.filter(p => p.gender === 'unisex').length || 0;
  
  if (maleProducts < 100) {
    console.log('  ❌ 男性向け商品が極端に少ない（' + maleProducts + '件）');
  }
  
  if (femaleProducts < 100) {
    console.log('  ❌ 女性向け商品が少ない（' + femaleProducts + '件）');
  }
  
  if (unisexProducts > products.length * 0.5) {
    console.log('  ⚠️ unisex商品が多すぎる（全体の' + Math.round(unisexProducts / products.length * 100) + '%）');
  }
  
  const diversityScore = Object.keys(brandCounts).length;
  if (diversityScore < 10) {
    console.log('  ❌ ブランドの多様性が低い（' + diversityScore + 'ブランドのみ）');
  }
  
  // スタイル多様性チェック
  const styleStyles = ['カジュアル', 'ストリート', 'モード', 'ナチュラル', 'フェミニン', 'クラシック'];
  styleStyles.forEach(style => {
    const count = products?.filter(p => 
      p.tags?.some(tag => tag.includes(style))
    ).length || 0;
    
    if (count < 100) {
      console.log(`  ⚠️ ${style}スタイルの商品が少ない（${count}件）`);
    }
  });
  
  console.log('\n✅ 改善提案:');
  console.log('  1. 男性向け商品を大幅に追加する必要があります');
  console.log('  2. 各スタイルカテゴリの商品を均等に増やす必要があります');
  console.log('  3. より多様なブランドから商品を追加する必要があります');
  console.log('  4. 性別タグを正確に設定し直す必要があります');
  
  process.exit(0);
}

analyzeProductDistribution().catch(console.error);

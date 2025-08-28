require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

async function testProductDiversity() {
  try {
    console.log('=== 商品多様性テスト ===\n');

    // 商品を取得
    const { data: products, error } = await supabase
      .from('external_products')
      .select('*')
      .eq('is_active', true)
      .not('image_url', 'is', null)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('商品取得エラー:', error);
      return;
    }

    console.log(`取得した商品数: ${products.length}\n`);

    // カテゴリの分布を確認
    const categories = new Map();
    const brands = new Map();
    const styles = new Map();
    const priceRanges = {
      '0-5000': 0,
      '5000-10000': 0,
      '10000-20000': 0,
      '20000-50000': 0,
      '50000+': 0
    };

    products.forEach(product => {
      // カテゴリ集計
      const category = product.category || '不明';
      categories.set(category, (categories.get(category) || 0) + 1);

      // ブランド集計
      const brand = product.brand || '不明';
      brands.set(brand, (brands.get(brand) || 0) + 1);

      // スタイル（タグ）集計
      if (product.tags && Array.isArray(product.tags)) {
        product.tags.forEach(tag => {
          styles.set(tag, (styles.get(tag) || 0) + 1);
        });
      }

      // 価格帯集計
      const price = product.price || 0;
      if (price < 5000) priceRanges['0-5000']++;
      else if (price < 10000) priceRanges['5000-10000']++;
      else if (price < 20000) priceRanges['10000-20000']++;
      else if (price < 50000) priceRanges['20000-50000']++;
      else priceRanges['50000+']++;
    });

    // 結果を表示
    console.log('=== カテゴリ分布 ===');
    const sortedCategories = Array.from(categories.entries()).sort((a, b) => b[1] - a[1]);
    sortedCategories.slice(0, 10).forEach(([cat, count]) => {
      console.log(`${cat}: ${count} (${(count/products.length*100).toFixed(1)}%)`);
    });

    console.log('\n=== ブランド分布（上位10） ===');
    const sortedBrands = Array.from(brands.entries()).sort((a, b) => b[1] - a[1]);
    sortedBrands.slice(0, 10).forEach(([brand, count]) => {
      console.log(`${brand}: ${count} (${(count/products.length*100).toFixed(1)}%)`);
    });

    console.log('\n=== スタイル/タグ分布（上位10） ===');
    const sortedStyles = Array.from(styles.entries()).sort((a, b) => b[1] - a[1]);
    sortedStyles.slice(0, 10).forEach(([style, count]) => {
      console.log(`${style}: ${count}`);
    });

    console.log('\n=== 価格帯分布 ===');
    Object.entries(priceRanges).forEach(([range, count]) => {
      console.log(`${range}: ${count} (${(count/products.length*100).toFixed(1)}%)`);
    });

    // 多様性スコアを計算
    const categoryDiversity = categories.size;
    const brandDiversity = brands.size;
    const styleDiversity = styles.size;
    
    console.log('\n=== 多様性指標 ===');
    console.log(`ユニークカテゴリ数: ${categoryDiversity}`);
    console.log(`ユニークブランド数: ${brandDiversity}`);
    console.log(`ユニークスタイル数: ${styleDiversity}`);
    
    // シミュレーション：ランダムに5個選んだ場合の多様性
    console.log('\n=== ランダム選択シミュレーション（5商品） ===');
    for (let i = 0; i < 3; i++) {
      const shuffled = [...products].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, 5);
      
      const simCategories = new Set(selected.map(p => p.category || '不明'));
      const simBrands = new Set(selected.map(p => p.brand || '不明'));
      
      console.log(`\nシミュレーション${i + 1}:`);
      console.log(`  カテゴリ多様性: ${simCategories.size}/5`);
      console.log(`  ブランド多様性: ${simBrands.size}/5`);
      console.log('  選択商品:');
      selected.forEach((p, idx) => {
        console.log(`    ${idx + 1}. ${p.title.substring(0, 30)}... (${p.category}, ${p.brand})`);
      });
    }

    console.log('\n=== テスト完了 ===');

  } catch (error) {
    console.error('エラー:', error);
  } finally {
    process.exit(0);
  }
}

testProductDiversity();

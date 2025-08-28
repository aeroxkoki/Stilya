require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

// カテゴリマッピング
const CATEGORY_PATTERNS = {
  'ワンピース': ['ワンピース', 'ワンピ', 'dress', 'ドレス', 'オールインワン'],
  'トップス': ['Tシャツ', 'シャツ', 'ブラウス', 'トップス', 'カットソー', 'shirt', 'blouse', 'tops', 'tee'],
  'ニット': ['ニット', 'セーター', 'カーディガン', 'knit', 'sweater', 'cardigan', 'プルオーバー'],
  'パンツ': ['パンツ', 'デニム', 'ジーンズ', 'pants', 'jeans', 'トラウザー', 'スラックス'],
  'スカート': ['スカート', 'skirt', 'プリーツ'],
  'アウター': ['コート', 'ジャケット', 'ブルゾン', 'coat', 'jacket', 'アウター', 'パーカー', 'ダウン'],
  'バッグ': ['バッグ', 'bag', 'かばん', 'トート', 'ショルダー', 'リュック'],
  'シューズ': ['シューズ', '靴', 'shoes', 'スニーカー', 'パンプス', 'ブーツ', 'サンダル'],
  'アクセサリー': ['アクセサリー', 'ネックレス', 'ピアス', 'イヤリング', 'リング', '指輪', 'accessory'],
  'その他': []
};

async function analyzeAndSuggestFix() {
  console.log('=== 商品カテゴリ修正提案 ===\n');

  // サンプル商品を取得
  const { data: products, error } = await supabase
    .from('external_products')
    .select('id, title, category')
    .eq('is_active', true)
    .limit(100);

  if (error) {
    console.error('Error:', error);
    return;
  }

  // カテゴリを推測
  const suggestions = [];
  const categoryCount = {};
  
  products.forEach(product => {
    const title = product.title.toLowerCase();
    let suggestedCategory = 'その他';
    
    // パターンマッチング
    for (const [category, patterns] of Object.entries(CATEGORY_PATTERNS)) {
      if (category === 'その他') continue;
      
      const found = patterns.some(pattern => 
        title.includes(pattern.toLowerCase())
      );
      
      if (found) {
        suggestedCategory = category;
        break;
      }
    }
    
    categoryCount[suggestedCategory] = (categoryCount[suggestedCategory] || 0) + 1;
    
    if (product.category !== suggestedCategory) {
      suggestions.push({
        id: product.id,
        title: product.title.substring(0, 50),
        current: product.category,
        suggested: suggestedCategory
      });
    }
  });

  console.log('カテゴリ推測結果（100件サンプル）:');
  Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, count]) => {
      console.log(`  ${cat}: ${count}件 (${(count/products.length*100).toFixed(1)}%)`);
    });

  console.log('\n修正が必要な商品例（最初の10件）:');
  suggestions.slice(0, 10).forEach((s, i) => {
    console.log(`${i+1}. ${s.title}...`);
    console.log(`   現在: ${s.current} → 推奨: ${s.suggested}`);
  });

  console.log(`\n合計 ${suggestions.length}/${products.length} 件の商品でカテゴリ修正が推奨されます`);

  // 修正スクリプトの提案
  console.log('\n=== 修正方法の提案 ===');
  console.log('1. バックアップを取る');
  console.log('2. タイトルベースで自動カテゴリ分類');
  console.log('3. 新しいカテゴリフィールドを追加（actual_category）');
  console.log('4. 段階的に移行');

  return suggestions;
}

analyzeAndSuggestFix().then(() => process.exit(0));

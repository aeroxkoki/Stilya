const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
);

// 商品タイトルやタグから性別を推定
function inferGender(product) {
  const title = (product.title || '').toLowerCase();
  const tags = product.tags || [];
  const tagsStr = tags.join(' ').toLowerCase();
  const brand = (product.brand || '').toLowerCase();
  const category = (product.category || '').toLowerCase();
  
  // 男性向けキーワード
  const maleKeywords = [
    'メンズ', 'mens', 'men\'s', '男性', '紳士', 'メンズファッション',
    'ボーイズ', 'boys', '男物', '男用', 'homme', 'uomo',
    'メンズコーデ', 'メンズスタイル', 'メンズカジュアル'
  ];
  
  // 女性向けキーワード
  const femaleKeywords = [
    'レディース', 'レディス', 'ladies', 'women', '女性', '婦人',
    'ガールズ', 'girls', '女物', '女用', 'femme', 'donna',
    'レディースファッション', 'ウィメンズ', 'womens', 'women\'s',
    'フェミニン', 'ワンピース', 'スカート', 'ブラウス', 'ママ',
    'マタニティ', 'レディースコーデ', 'レディーススタイル'
  ];
  
  // ユニセックスキーワード
  const unisexKeywords = [
    'ユニセックス', 'unisex', '男女兼用', '兼用', 'ジェンダーレス',
    'genderless', 'フリーサイズ', '共用'
  ];
  
  // タイトルに性別キーワードが含まれるかチェック（優先度高）
  for (const keyword of maleKeywords) {
    if (title.includes(keyword)) return 'male';
  }
  for (const keyword of femaleKeywords) {
    if (title.includes(keyword)) return 'female';
  }
  for (const keyword of unisexKeywords) {
    if (title.includes(keyword)) return 'unisex';
  }
  
  // タグに性別キーワードが含まれるかチェック
  for (const keyword of maleKeywords) {
    if (tagsStr.includes(keyword)) return 'male';
  }
  for (const keyword of femaleKeywords) {
    if (tagsStr.includes(keyword)) return 'female';
  }
  
  // ブランド名から推定
  const maleBrands = ['ユニクロメンズ', 'guメンズ', 'メンズビギ'];
  const femaleBrands = ['ユニクロウィメンズ', 'guレディース', 'ガールズ'];
  
  for (const b of maleBrands) {
    if (brand.includes(b)) return 'male';
  }
  for (const b of femaleBrands) {
    if (brand.includes(b)) return 'female';
  }
  
  // 商品タイプから推定
  if (tags.some(tag => ['スカート', 'ワンピース', 'ブラウス', 'ドレス'].includes(tag))) {
    return 'female';
  }
  
  // デフォルトはunisex
  return 'unisex';
}

// スタイルタグを強化
function enhanceStyleTags(product) {
  const tags = product.tags || [];
  const title = (product.title || '').toLowerCase();
  const brand = (product.brand || '').toLowerCase();
  const price = product.price || 0;
  
  const enhancedTags = [...tags];
  
  // カジュアルスタイル
  if (title.includes('tシャツ') || title.includes('ジーンズ') || title.includes('スニーカー') ||
      title.includes('パーカー') || title.includes('スウェット') || title.includes('デニム')) {
    if (!enhancedTags.includes('カジュアル')) enhancedTags.push('カジュアル');
  }
  
  // ストリートスタイル
  if (title.includes('ストリート') || title.includes('スケーター') || title.includes('hip') ||
      title.includes('バギー') || title.includes('オーバーサイズ') || brand.includes('supreme') ||
      brand.includes('stussy') || title.includes('キャップ')) {
    if (!enhancedTags.includes('ストリート')) enhancedTags.push('ストリート');
  }
  
  // モードスタイル
  if (title.includes('モード') || title.includes('アバンギャルド') || title.includes('デザイナー') ||
      title.includes('ミニマル') || title.includes('モノトーン') || title.includes('黒') ||
      price > 20000) {
    if (!enhancedTags.includes('モード')) enhancedTags.push('モード');
  }
  
  // ナチュラルスタイル
  if (title.includes('ナチュラル') || title.includes('リネン') || title.includes('コットン') ||
      title.includes('オーガニック') || title.includes('無印') || brand.includes('無印')) {
    if (!enhancedTags.includes('ナチュラル')) enhancedTags.push('ナチュラル');
  }
  
  // フェミニンスタイル
  if (title.includes('フェミニン') || title.includes('レース') || title.includes('フリル') ||
      title.includes('リボン') || title.includes('花柄') || title.includes('ピンク') ||
      title.includes('パステル')) {
    if (!enhancedTags.includes('フェミニン')) enhancedTags.push('フェミニン');
  }
  
  // クラシックスタイル
  if (title.includes('クラシック') || title.includes('トラッド') || title.includes('ビジネス') ||
      title.includes('スーツ') || title.includes('ジャケット') || title.includes('シャツ') ||
      title.includes('フォーマル')) {
    if (!enhancedTags.includes('クラシック')) enhancedTags.push('クラシック');
  }
  
  // 性別タグを追加
  const gender = product.gender || inferGender(product);
  if (gender === 'male' && !enhancedTags.includes('メンズ')) {
    enhancedTags.push('メンズ');
  } else if (gender === 'female' && !enhancedTags.includes('レディース')) {
    enhancedTags.push('レディース');
  }
  
  return enhancedTags;
}

async function updateProductTags() {
  console.log('🔧 商品データの改善を開始します...\n');
  
  // すべての商品を取得
  const { data: products, error } = await supabase
    .from('external_products')
    .select('*')
    .eq('is_active', true);
  
  if (error) {
    console.error('Error fetching products:', error);
    return;
  }
  
  console.log(`📦 ${products.length}件の商品を処理します...\n`);
  
  let updateCount = 0;
  let genderUpdates = { male: 0, female: 0, unisex: 0 };
  let styleUpdates = { カジュアル: 0, ストリート: 0, モード: 0, ナチュラル: 0, フェミニン: 0, クラシック: 0 };
  
  for (const product of products) {
    const originalGender = product.gender;
    const inferredGender = inferGender(product);
    const enhancedTags = enhanceStyleTags({ ...product, gender: inferredGender });
    
    // 性別またはタグが変更された場合のみ更新
    const needsUpdate = originalGender !== inferredGender || 
                       JSON.stringify(product.tags) !== JSON.stringify(enhancedTags);
    
    if (needsUpdate) {
      const { error: updateError } = await supabase
        .from('external_products')
        .update({
          gender: inferredGender,
          tags: enhancedTags
        })
        .eq('id', product.id);
      
      if (updateError) {
        console.error(`Error updating product ${product.id}:`, updateError);
      } else {
        updateCount++;
        genderUpdates[inferredGender]++;
        
        // スタイル更新をカウント
        ['カジュアル', 'ストリート', 'モード', 'ナチュラル', 'フェミニン', 'クラシック'].forEach(style => {
          if (enhancedTags.includes(style) && !product.tags?.includes(style)) {
            styleUpdates[style]++;
          }
        });
        
        if (updateCount % 100 === 0) {
          console.log(`  処理済み: ${updateCount}件...`);
        }
      }
    }
  }
  
  console.log('\n✅ 更新完了！\n');
  console.log('📊 更新結果:');
  console.log(`  総更新数: ${updateCount}件`);
  console.log('\n性別タグの更新:');
  Object.entries(genderUpdates).forEach(([gender, count]) => {
    console.log(`  ${gender}: ${count}件`);
  });
  console.log('\nスタイルタグの追加:');
  Object.entries(styleUpdates).forEach(([style, count]) => {
    console.log(`  ${style}: ${count}件`);
  });
  
  // 更新後の分布を確認
  console.log('\n📈 更新後の分布を確認中...');
  const { data: updatedProducts } = await supabase
    .from('external_products')
    .select('gender')
    .eq('is_active', true);
  
  const newGenderDist = {};
  updatedProducts?.forEach(p => {
    const g = p.gender || 'null';
    newGenderDist[g] = (newGenderDist[g] || 0) + 1;
  });
  
  console.log('\n新しい性別分布:');
  Object.entries(newGenderDist).forEach(([gender, count]) => {
    const percentage = ((count / updatedProducts.length) * 100).toFixed(1);
    console.log(`  ${gender}: ${count}件 (${percentage}%)`);
  });
  
  process.exit(0);
}

updateProductTags().catch(console.error);

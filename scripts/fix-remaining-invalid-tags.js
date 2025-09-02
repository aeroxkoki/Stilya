/**
 * 残りの無効なスタイルタグを修正するスクリプト
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function fixRemainingInvalidTags() {
  console.log('🔍 残りの無効なスタイルタグを検索中...');
  
  // 有効なスタイルタグの定義
  const validStyles = ['casual', 'street', 'mode', 'natural', 'classic', 'feminine'];
  
  // 無効なスタイルタグを持つ商品を検索
  const { data: invalidProducts, error } = await supabase
    .from('external_products')
    .select('id, title, style_tags, tags, category')
    .eq('is_active', true);
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  // 無効なスタイルタグをフィルタリング
  const productsToFix = invalidProducts.filter(product => {
    const currentStyle = product.style_tags?.[0];
    return currentStyle && !validStyles.includes(currentStyle);
  });
  
  console.log(`📦 ${productsToFix.length}件の無効なスタイルタグを発見`);
  
  if (productsToFix.length === 0) {
    console.log('✅ すべてのスタイルタグは正常です！');
    return;
  }
  
  // 各商品を修正
  for (const product of productsToFix) {
    console.log(`  修正中: ${product.id} (${product.style_tags?.[0]} → classic)`);
    
    const { error: updateError } = await supabase
      .from('external_products')
      .update({ style_tags: ['classic'] })
      .eq('id', product.id);
    
    if (updateError) {
      console.error(`    ❌ エラー: ${updateError.message}`);
    } else {
      console.log(`    ✅ 完了`);
    }
  }
  
  // 統計を再表示
  const { data: stats, error: statsError } = await supabase
    .from('external_products')
    .select('style_tags')
    .eq('is_active', true);
  
  if (!statsError && stats) {
    const styleCounts = {};
    stats.forEach(product => {
      const style = product.style_tags?.[0] || 'unknown';
      styleCounts[style] = (styleCounts[style] || 0) + 1;
    });
    
    console.log('\n📊 最終的なスタイル分布:');
    Object.entries(styleCounts)
      .sort(([, a], [, b]) => b - a)
      .forEach(([style, count]) => {
        console.log(`   ${style}: ${count}件`);
      });
  }
}

fixRemainingInvalidTags().then(() => process.exit(0));

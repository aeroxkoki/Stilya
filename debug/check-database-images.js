const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

async function checkDatabaseImages() {
  console.log('=== データベースの画像URL状態を確認 ===\n');
  
  try {
    // 1. 商品総数を確認
    const { count: totalCount } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true });
    
    console.log(`📊 データベース内の総商品数: ${totalCount}\n`);
    
    // 2. 画像URLが存在する商品の数を確認
    const { count: withImageCount } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true })
      .not('image_url', 'is', null)
      .not('image_url', 'eq', '');
    
    console.log(`🖼️  画像URLを持つ商品数: ${withImageCount}`);
    console.log(`❌ 画像URLが欠落している商品数: ${totalCount - withImageCount}\n`);
    
    // 3. アクティブな商品のサンプルを確認
    const { data: sampleProducts, error } = await supabase
      .from('external_products')
      .select('id, title, image_url, source, is_active')
      .eq('is_active', true)
      .limit(10);
    
    if (error) {
      console.error('エラー:', error);
      return;
    }
    
    console.log('📋 アクティブな商品のサンプル (10件):');
    console.log('==================================');
    
    sampleProducts.forEach((product, index) => {
      console.log(`\n[${index + 1}] ${product.title.substring(0, 40)}...`);
      console.log(`   ID: ${product.id}`);
      console.log(`   画像URL: ${product.image_url || '❌ なし'}`);
      console.log(`   ソース: ${product.source}`);
      console.log(`   アクティブ: ${product.is_active ? '✅' : '❌'}`);
      
      // 画像URLの形式をチェック
      if (product.image_url) {
        const isHttps = product.image_url.startsWith('https://');
        const isThumbnail = product.image_url.includes('thumbnail');
        const isLowRes = product.image_url.includes('128x128') || product.image_url.includes('64x64');
        
        console.log(`   画像URL診断:`);
        console.log(`     - HTTPS: ${isHttps ? '✅' : '❌'}`);
        console.log(`     - サムネイル: ${isThumbnail ? '⚠️' : '✅'}`);
        console.log(`     - 低解像度: ${isLowRes ? '⚠️' : '✅'}`);
      }
    });
    
    // 4. 画像URLがない商品のサンプルも確認
    const { data: noImageProducts } = await supabase
      .from('external_products')
      .select('id, title, source')
      .or('image_url.is.null,image_url.eq.')
      .limit(5);
    
    if (noImageProducts && noImageProducts.length > 0) {
      console.log('\n\n⚠️  画像URLがない商品のサンプル:');
      console.log('================================');
      noImageProducts.forEach((product, index) => {
        console.log(`[${index + 1}] ${product.title.substring(0, 40)}...`);
        console.log(`   ID: ${product.id}`);
        console.log(`   ソース: ${product.source}`);
      });
    }
    
    // 5. 画像URLの形式別統計
    const { data: allProducts } = await supabase
      .from('external_products')
      .select('image_url')
      .not('image_url', 'is', null)
      .not('image_url', 'eq', '');
    
    if (allProducts) {
      let httpsCount = 0;
      let httpCount = 0;
      let thumbnailCount = 0;
      let lowResCount = 0;
      
      allProducts.forEach(p => {
        if (p.image_url) {
          if (p.image_url.startsWith('https://')) httpsCount++;
          if (p.image_url.startsWith('http://')) httpCount++;
          if (p.image_url.includes('thumbnail')) thumbnailCount++;
          if (p.image_url.includes('128x128') || p.image_url.includes('64x64')) lowResCount++;
        }
      });
      
      console.log('\n\n📊 画像URL形式の統計:');
      console.log('===================');
      console.log(`HTTPS URL: ${httpsCount}件`);
      console.log(`HTTP URL: ${httpCount}件`);
      console.log(`サムネイル URL: ${thumbnailCount}件`);
      console.log(`低解像度 URL: ${lowResCount}件`);
    }
    
  } catch (error) {
    console.error('予期しないエラー:', error);
  }
}

checkDatabaseImages();

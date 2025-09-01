const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || ''
);

async function debugHeroImage() {
  console.log('=== ヒーロー画像のデバッグ ===\n');
  
  try {
    // 1. 最初の商品を取得
    console.log('1. データベースから最初の商品を取得...');
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .limit(5)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ エラー:', error);
      return;
    }
    
    if (!products || products.length === 0) {
      console.log('⚠️ 商品が見つかりません');
      return;
    }
    
    console.log(`✅ ${products.length}件の商品を取得\n`);
    
    // 2. 最初の商品の詳細を表示
    const firstProduct = products[0];
    console.log('2. ヒーロー商品として使用される最初の商品:');
    console.log('   ID:', firstProduct.id);
    console.log('   Title:', firstProduct.title);
    console.log('   Brand:', firstProduct.brand);
    console.log('   Price:', firstProduct.price);
    console.log('   Image URL:', firstProduct.imageUrl || firstProduct.image_url);
    console.log('   Has Image:', !!(firstProduct.imageUrl || firstProduct.image_url));
    
    // 3. 画像URLの検証
    const imageUrl = firstProduct.imageUrl || firstProduct.image_url;
    if (imageUrl) {
      console.log('\n3. 画像URLの検証:');
      console.log('   元のURL:', imageUrl);
      
      // HTTPSかどうか
      const isHttps = imageUrl.startsWith('https://');
      console.log('   HTTPS:', isHttps ? '✅' : '❌');
      
      // 楽天の画像かどうか
      const isRakuten = imageUrl.includes('rakuten.co.jp');
      console.log('   楽天の画像:', isRakuten ? 'はい' : 'いいえ');
      
      // URL最適化のシミュレーション
      let optimizedUrl = imageUrl;
      if (!isHttps && imageUrl.startsWith('http://')) {
        optimizedUrl = imageUrl.replace('http://', 'https://');
      }
      if (isRakuten && imageUrl.includes('thumbnail.image.rakuten.co.jp')) {
        const urlParts = optimizedUrl.split('?');
        optimizedUrl = `${urlParts[0]}?_ex=800x800`;
      }
      
      console.log('   最適化後のURL:', optimizedUrl);
      console.log('   URLが変更された:', imageUrl !== optimizedUrl ? 'はい' : 'いいえ');
      
      // アクセスチェック（簡易）
      try {
        const response = await fetch(optimizedUrl, { method: 'HEAD' });
        console.log('   画像へのアクセス:', response.ok ? '✅ 成功' : `❌ 失敗 (${response.status})`);
      } catch (fetchError) {
        console.log('   画像へのアクセス: ❌ エラー', fetchError.message);
      }
    } else {
      console.log('\n⚠️ 画像URLが存在しません');
    }
    
    // 4. 他の商品の画像URLも確認
    console.log('\n4. 他の商品の画像URL状況:');
    products.forEach((product, index) => {
      const url = product.imageUrl || product.image_url;
      console.log(`   商品${index + 1}: ${url ? '✅ 画像あり' : '❌ 画像なし'} - ${product.title?.substring(0, 30)}...`);
    });
    
    // 5. データベースのカラム名を確認
    console.log('\n5. データベースのカラム構造:');
    if (products[0]) {
      const columns = Object.keys(products[0]);
      const imageRelatedColumns = columns.filter(col => 
        col.toLowerCase().includes('image') || 
        col.toLowerCase().includes('url') || 
        col.toLowerCase().includes('thumbnail')
      );
      console.log('   画像関連のカラム:', imageRelatedColumns);
    }
    
  } catch (error) {
    console.error('エラー:', error);
  }
}

debugHeroImage();
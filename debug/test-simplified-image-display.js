// 簡素化された画像診断スクリプト
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

// シンプルな画像URL最適化関数（アプリと同じロジック）
function optimizeImageUrl(url) {
  const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/400x400/f0f0f0/666666?text=No+Image';
  
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return PLACEHOLDER_IMAGE;
  }
  
  let optimizedUrl = url.trim();
  
  try {
    // HTTPをHTTPSに変換
    if (optimizedUrl.startsWith('http://')) {
      optimizedUrl = optimizedUrl.replace('http://', 'https://');
    }
    
    // 楽天の画像URLの最適化
    if (optimizedUrl.includes('rakuten.co.jp')) {
      // サムネイルドメインを通常の画像ドメインに変更
      if (optimizedUrl.includes('thumbnail.image.rakuten.co.jp')) {
        optimizedUrl = optimizedUrl.replace('thumbnail.image.rakuten.co.jp', 'image.rakuten.co.jp');
      }
      
      // パス内のサイズ指定を削除
      optimizedUrl = optimizedUrl
        .replace(/\/128x128\//g, '/')
        .replace(/\/64x64\//g, '/')
        .replace(/\/pc\//g, '/')
        .replace(/\/thumbnail\//g, '/')
        .replace(/\/cabinet\/128x128\//g, '/cabinet/')
        .replace(/\/cabinet\/64x64\//g, '/cabinet/');
      
      // クエリパラメータのサイズ指定を削除
      if (optimizedUrl.includes('_ex=')) {
        optimizedUrl = optimizedUrl
          .replace(/_ex=128x128/g, '')
          .replace(/_ex=64x64/g, '')
          .replace(/\?$/g, '')
          .replace(/&$/g, '');
      }
    }
    
    // URL検証
    new URL(optimizedUrl);
    return optimizedUrl;
    
  } catch (error) {
    console.warn('Invalid URL:', url, error);
    return PLACEHOLDER_IMAGE;
  }
}

async function testImageDisplay() {
  console.log('🔍 画像表示テスト開始...\n');
  
  try {
    // 1. データベースから商品を取得
    const { data: products, error } = await supabase
      .from('external_products')
      .select('id, title, image_url')
      .eq('is_active', true)
      .not('image_url', 'is', null)
      .limit(10);
    
    if (error) {
      console.error('❌ データ取得エラー:', error);
      return;
    }
    
    console.log(`✅ ${products.length}件の商品を取得しました\n`);
    
    // 2. 各商品の画像URLを処理
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      console.log(`\n━━━ [${i + 1}/${products.length}] ${product.title.substring(0, 40)}...`);
      console.log(`📋 商品ID: ${product.id}`);
      
      // オリジナルURL
      console.log(`\n🔗 オリジナルURL:`);
      console.log(`   ${product.image_url}`);
      
      // 最適化後のURL
      const optimizedUrl = optimizeImageUrl(product.image_url);
      const wasOptimized = optimizedUrl !== product.image_url;
      
      console.log(`\n🔧 最適化後URL:`);
      console.log(`   ${optimizedUrl}`);
      console.log(`   最適化: ${wasOptimized ? '✅ 実行されました' : '❌ 必要ありません'}`);
      
      // HTTPSチェック
      const isHttps = optimizedUrl.startsWith('https://');
      console.log(`\n🔒 HTTPS: ${isHttps ? '✅' : '❌'}`);
      
      // プレースホルダーかどうか
      const isPlaceholder = optimizedUrl.includes('placeholder');
      if (isPlaceholder) {
        console.log(`\n⚠️  プレースホルダー画像が使用されています`);
      }
    }
    
    // 3. 統計情報
    console.log('\n\n📊 統計情報:');
    console.log('==============');
    
    let optimizedCount = 0;
    let placeholderCount = 0;
    let httpsCount = 0;
    
    for (const product of products) {
      const optimized = optimizeImageUrl(product.image_url);
      if (optimized !== product.image_url) optimizedCount++;
      if (optimized.includes('placeholder')) placeholderCount++;
      if (optimized.startsWith('https://')) httpsCount++;
    }
    
    console.log(`- URL最適化が必要: ${optimizedCount}/${products.length}`);
    console.log(`- HTTPS URL: ${httpsCount}/${products.length}`);
    console.log(`- プレースホルダー: ${placeholderCount}/${products.length}`);
    
    console.log('\n✅ テスト完了');
    
  } catch (error) {
    console.error('❌ エラー:', error);
  }
}

// 実行
testImageDisplay();

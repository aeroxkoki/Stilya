require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// normalizeProduct関数をシミュレート
function normalizeProduct(dbProduct) {
  const originalImageUrl = dbProduct.image_url || dbProduct.imageUrl || '';
  const optimizedUrl = originalImageUrl ? optimizeImageUrl(originalImageUrl) : '';
  
  console.log('[normalizeProduct] Processing:', {
    productId: dbProduct.id,
    title: dbProduct.title?.substring(0, 30) + '...',
    originalImageUrl: originalImageUrl,
    optimizedUrl: optimizedUrl,
    hasImageUrl: !!originalImageUrl,
    source: dbProduct.source,
    dbFields: Object.keys(dbProduct),
  });
  
  return {
    id: dbProduct.id,
    title: dbProduct.title,
    brand: dbProduct.brand,
    price: dbProduct.price,
    imageUrl: optimizedUrl,
    description: dbProduct.description,
    tags: dbProduct.tags || [],
    category: dbProduct.category,
    affiliateUrl: dbProduct.affiliate_url,
    source: dbProduct.source,
    createdAt: dbProduct.created_at,
    isUsed: dbProduct.is_used || false,
  };
}

// optimizeImageUrl関数をシミュレート
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
    
    new URL(optimizedUrl); // URLとして有効かチェック
    
    return optimizedUrl;
    
  } catch (error) {
    console.warn('[optimizeImageUrl] Invalid URL:', url, error);
    return PLACEHOLDER_IMAGE;
  }
}

async function testImageRendering() {
  console.log('🔍 画像レンダリングのシミュレーションテスト開始...\n');

  try {
    // fetchMixedProductsのクエリをシミュレート
    console.log('1️⃣ fetchMixedProducts のクエリをシミュレート:');
    const { data: products, error } = await supabase
      .from('external_products')
      .select('*')
      .eq('is_active', true)
      .not('image_url', 'is', null)
      .not('image_url', 'eq', '')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('❌ エラー:', error);
      return;
    }

    console.log(`✅ ${products.length} 件の商品を取得\n`);

    // normalizeProductを実行
    console.log('2️⃣ normalizeProduct 関数の実行:');
    const normalizedProducts = products.map(normalizeProduct);

    // 結果を分析
    console.log('\n3️⃣ 正規化結果の分析:');
    const imageStats = {
      total: normalizedProducts.length,
      withImage: normalizedProducts.filter(p => p.imageUrl && !p.imageUrl.includes('placeholder')).length,
      placeholder: normalizedProducts.filter(p => p.imageUrl.includes('placeholder')).length,
      thumbnail: normalizedProducts.filter(p => p.imageUrl.includes('thumbnail')).length,
      optimized: normalizedProducts.filter(p => p.imageUrl && !p.imageUrl.includes('thumbnail') && !p.imageUrl.includes('128x128')).length,
    };

    console.log('画像統計:');
    console.log(`  総商品数: ${imageStats.total}`);
    console.log(`  有効な画像URL: ${imageStats.withImage}`);
    console.log(`  プレースホルダー: ${imageStats.placeholder}`);
    console.log(`  サムネイル残存: ${imageStats.thumbnail}`);
    console.log(`  最適化済み: ${imageStats.optimized}`);

    // サンプル商品の詳細
    console.log('\n4️⃣ サンプル商品の詳細（最初の3件）:');
    normalizedProducts.slice(0, 3).forEach((product, index) => {
      console.log(`\n商品 ${index + 1}:`);
      console.log(`  ID: ${product.id}`);
      console.log(`  タイトル: ${product.title}`);
      console.log(`  画像URL: ${product.imageUrl}`);
      console.log(`  画像URL長: ${product.imageUrl.length}`);
      console.log(`  ブランド: ${product.brand}`);
      console.log(`  価格: ¥${product.price}`);
    });

    // コンポーネントに渡される形式を確認
    console.log('\n5️⃣ SwipeCard に渡されるデータ形式:');
    const sampleCardData = normalizedProducts[0];
    console.log(JSON.stringify({
      id: sampleCardData.id,
      title: sampleCardData.title,
      imageUrl: sampleCardData.imageUrl,
      brand: sampleCardData.brand,
      price: sampleCardData.price,
      tags: sampleCardData.tags,
    }, null, 2));

  } catch (error) {
    console.error('❌ テスト中にエラーが発生しました:', error);
  }
}

// 実行
testImageRendering();

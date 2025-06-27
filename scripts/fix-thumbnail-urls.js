require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * 楽天のサムネイルURLを高画質版に変換する
 */
function convertToHighQualityUrl(thumbnailUrl) {
  if (!thumbnailUrl || typeof thumbnailUrl !== 'string') return thumbnailUrl;
  
  try {
    // サムネイルドメインを通常の画像ドメインに変更
    let highQualityUrl = thumbnailUrl.replace('thumbnail.image.rakuten.co.jp', 'image.rakuten.co.jp');
    
    // URLパス内のサイズ指定を除去
    highQualityUrl = highQualityUrl
      .replace('/128x128/', '/')
      .replace('/64x64/', '/')
      .replace('/pc/', '/')
      .replace('/thumbnail/', '/');
    
    // クエリパラメータのサイズ指定を除去
    highQualityUrl = highQualityUrl
      .replace('?_ex=128x128', '')
      .replace('?_ex=64x64', '')
      .replace('&_ex=128x128', '')
      .replace('&_ex=64x64', '');
    
    return highQualityUrl;
  } catch (error) {
    console.error('Error converting URL:', error);
    return thumbnailUrl;
  }
}

async function fixThumbnailUrls() {
  console.log('🔧 Starting image URL fix process...\n');

  try {
    // 1. 楽天商品でサムネイルURLを持つ商品を取得
    let processedCount = 0;
    let offset = 0;
    const batchSize = 20; // バッチサイズを小さくして処理を安定化
    let hasMore = true;
    
    // まず対象商品の総数を確認
    const { count: totalCount } = await supabase
      .from('external_products')
      .select('id', { count: 'exact', head: true })
      .eq('source', 'rakuten')
      .like('image_url', '%thumbnail.image.rakuten.co.jp%');
    
    console.log(`📊 Total products to update: ${totalCount}`);
    
    if (totalCount === 0) {
      console.log('✅ No thumbnail URLs found. All images are already high quality!');
      return;
    }

    while (hasMore) {
      const { data: products, error } = await supabase
        .from('external_products')
        .select('id, image_url')
        .eq('source', 'rakuten')
        .like('image_url', '%thumbnail.image.rakuten.co.jp%')
        .range(offset, offset + batchSize - 1);

      if (error) {
        console.error('❌ Error fetching products:', error);
        break;
      }

      if (!products || products.length === 0) {
        hasMore = false;
        break;
      }

      console.log(`\n📦 Processing batch: ${offset} - ${offset + products.length}`);

      // 2. 各商品の画像URLを高画質版に変換
      for (const product of products) {
        const oldUrl = product.image_url;
        const newUrl = convertToHighQualityUrl(oldUrl);

        if (oldUrl !== newUrl) {
          // 3. データベースを更新
          const { error: updateError } = await supabase
            .from('external_products')
            .update({ image_url: newUrl })
            .eq('id', product.id);

          if (updateError) {
            console.error(`❌ Error updating product ${product.id}:`, updateError);
          } else {
            processedCount++;
            console.log(`✅ Updated: ${product.id}`);
            console.log(`   Old: ${oldUrl}`);
            console.log(`   New: ${newUrl}`);
          }
          
          // APIレート制限を避けるための遅延
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }

      offset += batchSize;
    }

    console.log(`\n✅ Process completed!`);
    console.log(`📊 Total products updated: ${processedCount}`);

    // 4. 更新後の確認
    const { data: sampleProducts } = await supabase
      .from('external_products')
      .select('id, title, image_url')
      .eq('source', 'rakuten')
      .limit(5);

    console.log('\n🔍 Sample of updated products:');
    for (const product of sampleProducts || []) {
      console.log(`- ${product.title?.substring(0, 30)}...`);
      console.log(`  URL: ${product.image_url}`);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// 実行
fixThumbnailUrls();

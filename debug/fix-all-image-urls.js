const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * 画像URLを修正するバッチスクリプト
 * 楽天のサムネイルURLを高画質版に一括変換
 */

// 楽天の画像URLを修正する関数
function fixRakutenImageUrl(url) {
  if (!url) return '';
  
  let fixedUrl = url;
  
  // HTTPをHTTPSに変換
  if (fixedUrl.startsWith('http://')) {
    fixedUrl = fixedUrl.replace('http://', 'https://');
  }
  
  // サムネイルドメインを通常の画像ドメインに変更
  if (fixedUrl.includes('thumbnail.image.rakuten.co.jp')) {
    fixedUrl = fixedUrl.replace('thumbnail.image.rakuten.co.jp', 'image.rakuten.co.jp');
  }
  
  // サイズ指定を削除
  fixedUrl = fixedUrl
    .replace('/128x128/', '/')
    .replace('/64x64/', '/')
    .replace('/pc/', '/')
    .replace('/thumbnail/', '/')
    .replace('?_ex=128x128', '')
    .replace('?_ex=64x64', '')
    .replace('&_ex=128x128', '')
    .replace('&_ex=64x64', '');
  
  return fixedUrl;
}

async function fixAllImageUrls() {
  console.log('🔧 画像URL修正バッチを開始します...\n');

  try {
    // 1. 問題のある画像URLを持つ商品を取得
    console.log('📦 問題のある画像URLを検索中...');
    
    const { data: products, error } = await supabase
      .from('products')
      .select('id, image_url')
      .or('image_url.ilike.%thumbnail.image.rakuten.co.jp%,image_url.ilike.%128x128%,image_url.ilike.%64x64%,image_url.ilike.http://%')
      .limit(1000);

    if (error) {
      console.error('❌ 商品取得エラー:', error);
      return;
    }

    console.log(`✅ ${products.length}件の修正対象商品を発見しました`);

    if (products.length === 0) {
      console.log('🎉 修正が必要な商品はありません！');
      return;
    }

    // 2. 各商品のURLを修正
    let fixedCount = 0;
    let errorCount = 0;
    const updatePromises = [];

    for (const product of products) {
      const originalUrl = product.image_url;
      const fixedUrl = fixRakutenImageUrl(originalUrl);

      if (originalUrl !== fixedUrl) {
        console.log(`\n📝 修正中: ${product.id}`);
        console.log(`   変更前: ${originalUrl.substring(0, 60)}...`);
        console.log(`   変更後: ${fixedUrl.substring(0, 60)}...`);

        // バッチ更新用のプロミスを作成
        const updatePromise = supabase
          .from('products')
          .update({ image_url: fixedUrl })
          .eq('id', product.id)
          .then(({ error }) => {
            if (error) {
              console.error(`   ❌ 更新エラー (ID: ${product.id}):`, error.message);
              errorCount++;
            } else {
              fixedCount++;
            }
          });

        updatePromises.push(updatePromise);

        // 10件ごとに実行してAPI制限を回避
        if (updatePromises.length >= 10) {
          await Promise.all(updatePromises);
          updatePromises.length = 0;
          console.log(`   ⏳ ${fixedCount}件処理済み...`);
          
          // 少し待機
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    }

    // 残りの更新を実行
    if (updatePromises.length > 0) {
      await Promise.all(updatePromises);
    }

    // 3. 結果サマリー
    console.log('\n📊 修正結果:');
    console.log('============');
    console.log(`✅ 成功: ${fixedCount}件`);
    console.log(`❌ エラー: ${errorCount}件`);
    console.log(`📋 合計: ${products.length}件`);

    // 4. 修正後の確認
    console.log('\n🔍 修正後の確認...');
    const { data: remainingIssues, error: checkError } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .or('image_url.ilike.%thumbnail.image.rakuten.co.jp%,image_url.ilike.%128x128%,image_url.ilike.%64x64%,image_url.ilike.http://%');

    if (!checkError) {
      const remainingCount = remainingIssues || 0;
      if (remainingCount === 0) {
        console.log('🎉 すべての画像URLが正常に修正されました！');
      } else {
        console.log(`⚠️ まだ${remainingCount}件の問題のある画像URLが残っています`);
        console.log('   再度スクリプトを実行することをお勧めします。');
      }
    }

  } catch (error) {
    console.error('❌ バッチ処理中にエラーが発生しました:', error);
  }
}

// 実行前の確認
console.log('⚠️  このスクリプトはデータベースの画像URLを直接更新します。');
console.log('   続行しますか？ (Ctrl+Cでキャンセル)\n');

// 3秒待機
setTimeout(() => {
  fixAllImageUrls();
}, 3000);

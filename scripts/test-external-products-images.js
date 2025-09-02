/**
 * external_productsテーブルから楽天画像URLをテスト
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase環境変数が設定されていません');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🧪 external_productsテーブルの楽天画像URLテスト\n');
console.log('================================\n');

async function testImageUrl(url, productTitle) {
  console.log(`\n📸 テスト中: ${productTitle ? productTitle.substring(0, 40) : 'Unknown'}...`);
  console.log(`   URL: ${url.substring(0, 80)}...`);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
        'Accept': 'image/*',
      }
    });
    
    console.log(`   ステータス: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const contentType = response.headers.get('content-type');
      const contentLength = response.headers.get('content-length');
      
      console.log(`   Content-Type: ${contentType || 'N/A'}`);
      
      if (contentLength) {
        const sizeKB = Math.round(parseInt(contentLength) / 1024);
        console.log(`   サイズ: ${sizeKB} KB`);
      }
      
      // 画像データの検証
      const buffer = await response.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      
      // 画像形式の判定
      if (bytes[0] === 0xFF && bytes[1] === 0xD8) {
        console.log('   ✅ 有効なJPEG画像');
      } else if (bytes[0] === 0x89 && bytes[1] === 0x50) {
        console.log('   ✅ 有効なPNG画像');
      } else if (bytes[0] === 0x47 && bytes[1] === 0x49) {
        console.log('   ✅ 有効なGIF画像');
      } else {
        console.log('   ⚠️ 不明な画像形式');
      }
      
      return true;
    } else {
      console.log('   ❌ 画像取得失敗');
      
      // より良いURLパターンを提案
      if (url.includes('rakuten')) {
        console.log('   💡 代替URL案:');
        
        // HTTPSに変換
        if (url.startsWith('http://')) {
          const httpsUrl = url.replace('http://', 'https://');
          console.log(`      → HTTPS版: ${httpsUrl.substring(0, 60)}...`);
        }
        
        // サイズパラメータを追加
        if (url.includes('thumbnail.image.rakuten') && !url.includes('_ex=')) {
          const sizedUrl = url.includes('?') ? url + '&_ex=800x800' : url + '?_ex=800x800';
          console.log(`      → サイズ指定版: ${sizedUrl.substring(0, 60)}...`);
        }
      }
      
      return false;
    }
    
  } catch (error) {
    console.error(`   ❌ エラー: ${error.message}`);
    return false;
  }
}

async function runTests() {
  try {
    // external_productsテーブルから楽天の商品を取得
    console.log('📋 external_productsテーブルから楽天商品を取得中...');
    
    // まず楽天の商品を検索
    const { data: rakutenProducts, error: rakutenError } = await supabase
      .from('external_products')
      .select('id, title, image_url, brand')
      .ilike('image_url', '%rakuten%')
      .limit(5);
    
    // 楽天以外の商品も少し取得して比較
    const { data: otherProducts, error: otherError } = await supabase
      .from('external_products')
      .select('id, title, image_url, brand')
      .not('image_url', 'ilike', '%rakuten%')
      .limit(2);
    
    if (rakutenError) {
      console.error('楽天商品取得エラー:', rakutenError.message);
    }
    
    const allProducts = [
      ...(rakutenProducts || []),
      ...(otherProducts || [])
    ];
    
    if (!allProducts || allProducts.length === 0) {
      console.log('商品が見つかりませんでした');
      return;
    }
    
    console.log(`\n✅ ${allProducts.length} 件の商品を取得しました`);
    console.log(`   楽天: ${(rakutenProducts || []).length} 件`);
    console.log(`   その他: ${(otherProducts || []).length} 件`);
    console.log('================================\n');
    
    let successCount = 0;
    let failureCount = 0;
    const failedProducts = [];
    const successfulProducts = [];
    
    for (const product of allProducts) {
      if (product.image_url) {
        const success = await testImageUrl(product.image_url, product.title);
        if (success) {
          successCount++;
          successfulProducts.push({
            id: product.id,
            title: product.title,
            url: product.image_url,
            isRakuten: product.image_url.includes('rakuten')
          });
        } else {
          failureCount++;
          failedProducts.push({
            id: product.id,
            title: product.title,
            url: product.image_url,
            isRakuten: product.image_url.includes('rakuten')
          });
        }
      }
    }
    
    console.log('\n\n📊 テスト結果サマリー');
    console.log('================================');
    console.log(`✅ 成功: ${successCount}/${allProducts.length}`);
    console.log(`❌ 失敗: ${failureCount}/${allProducts.length}`);
    
    if (successfulProducts.length > 0) {
      console.log('\n✅ 成功した画像URL:');
      successfulProducts.forEach(p => {
        console.log(`   ${p.isRakuten ? '🔴楽天' : '🔵その他'} ${p.title?.substring(0, 30)}...`);
      });
    }
    
    if (failedProducts.length > 0) {
      console.log('\n❌ 失敗した画像URL:');
      failedProducts.forEach(p => {
        console.log(`   ${p.isRakuten ? '🔴楽天' : '🔵その他'} ${p.title?.substring(0, 30)}...`);
        console.log(`      URL: ${p.url.substring(0, 70)}...`);
      });
    }
    
    console.log('\n\n🎯 診断結果');
    console.log('================================');
    
    const rakutenSuccessRate = successfulProducts.filter(p => p.isRakuten).length / 
                               (rakutenProducts || []).length;
    
    if (rakutenSuccessRate < 0.5) {
      console.log('⚠️ 楽天画像の多くが404エラーになっています');
      console.log('→ 楽天APIから最新データを再同期する必要があります');
    } else if (rakutenSuccessRate < 0.8) {
      console.log('⚠️ 一部の楽天画像URLが古くなっています');
      console.log('→ 定期的な同期処理の実装を推奨します');
    } else {
      console.log('✅ 楽天画像は概ね正常に取得できています');
    }
    
    console.log('\n\n💡 React Native/Expo環境での注意点');
    console.log('================================');
    console.log('1. CORSエラーは発生しません（ネイティブHTTPクライアント使用）');
    console.log('2. 404エラーの画像は自動的にフォールバック画像に切り替え（実装済み）');
    console.log('3. expo-imageのキャッシュ機能により高速表示');
    console.log('4. image_urlカラムを正しく参照する必要があります（imageUrlではない）');
    
  } catch (error) {
    console.error('テストエラー:', error);
  }
}

// テスト実行
runTests().then(() => {
  console.log('\n✨ テスト完了');
  process.exit(0);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

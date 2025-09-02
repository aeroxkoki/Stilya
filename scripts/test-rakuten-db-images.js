/**
 * データベースから実際の楽天画像URLを取得してテスト
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

console.log('🧪 データベースから楽天画像URLを取得してテスト\n');
console.log('================================\n');

async function testImageUrl(url, productTitle) {
  console.log(`\n📸 テスト中: ${productTitle || 'Unknown'}`);
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
      return false;
    }
    
  } catch (error) {
    console.error(`   ❌ エラー: ${error.message}`);
    return false;
  }
}

async function runTests() {
  try {
    // データベースから楽天の商品を取得
    console.log('📋 データベースから楽天商品を取得中...');
    
    const { data: products, error } = await supabase
      .from('products')
      .select('id, title, imageUrl, brand')
      .ilike('imageUrl', '%rakuten%')
      .limit(10);
    
    if (error) {
      console.error('データベースエラー:', error.message);
      return;
    }
    
    if (!products || products.length === 0) {
      console.log('楽天の商品が見つかりませんでした');
      return;
    }
    
    console.log(`\n✅ ${products.length} 件の楽天商品を取得しました`);
    console.log('================================\n');
    
    let successCount = 0;
    let failureCount = 0;
    const failedProducts = [];
    
    for (const product of products) {
      if (product.imageUrl) {
        const success = await testImageUrl(product.imageUrl, product.title);
        if (success) {
          successCount++;
        } else {
          failureCount++;
          failedProducts.push({
            id: product.id,
            title: product.title,
            url: product.imageUrl
          });
        }
      }
    }
    
    console.log('\n\n📊 テスト結果サマリー');
    console.log('================================');
    console.log(`✅ 成功: ${successCount}/${products.length}`);
    console.log(`❌ 失敗: ${failureCount}/${products.length}`);
    
    if (failureCount > 0) {
      console.log('\n\n❌ 失敗した商品:');
      failedProducts.forEach(p => {
        console.log(`   - ID: ${p.id}`);
        console.log(`     タイトル: ${p.title.substring(0, 50)}...`);
        console.log(`     URL: ${p.url.substring(0, 80)}...`);
      });
    }
    
    console.log('\n\n🎯 診断結果');
    console.log('================================');
    
    if (successCount === products.length) {
      console.log('✅ すべての楽天画像が正常に取得できました！');
      console.log('→ React Native/Expo環境では問題なく表示されるはずです');
    } else if (successCount > products.length / 2) {
      console.log('⚠️ 一部の画像URLに問題があります');
      console.log('→ 古いURLや無効なURLが混在している可能性があります');
      console.log('→ フォールバック画像の使用が有効に機能しているはずです');
    } else {
      console.log('❌ 多くの画像URLに問題があります');
      console.log('→ 楽天APIから最新のデータを再同期する必要があるかもしれません');
    }
    
    console.log('\n\n💡 推奨事項');
    console.log('================================');
    console.log('1. CORSはReact Native環境では影響しません');
    console.log('2. 404エラーの画像は自動的にフォールバック画像に切り替わります');
    console.log('3. 定期的に楽天APIから最新データを同期することを推奨');
    console.log('4. expo-imageのキャッシュ機能により、一度読み込んだ画像は高速表示されます');
    
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

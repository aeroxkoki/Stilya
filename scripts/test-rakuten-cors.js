/**
 * 楽天画像URLの検証テスト（Node.js版）
 * CORSと画像アクセスの問題を診断
 */

// テスト用の楽天画像URL
const testUrls = [
  'https://thumbnail.image.rakuten.co.jp/@0_mall/rakuten24/cabinet/474/4902370526474.jpg?_ex=800x800',
  'https://shop.r10s.jp/book/cabinet/4859/9784575524857_1_2.jpg',
  'https://image.rakuten.co.jp/mb/cabinet/img155/m30068875593_1.jpg',
  'http://thumbnail.image.rakuten.co.jp/@0_mall/rakuten24/cabinet/474/4902370526474.jpg', // HTTPバージョン
];

console.log('🧪 楽天画像URLテスト開始...\n');
console.log('================================');

async function testImageUrl(url) {
  console.log(`\n📸 テスト中: ${url.substring(0, 80)}...`);
  
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
        'Accept': 'image/*',
      }
    });
    
    console.log(`   ✅ ステータス: ${response.status} ${response.statusText}`);
    console.log(`   Content-Type: ${response.headers.get('content-type') || 'N/A'}`);
    
    const contentLength = response.headers.get('content-length');
    if (contentLength) {
      const sizeKB = Math.round(parseInt(contentLength) / 1024);
      console.log(`   サイズ: ${sizeKB} KB`);
    }
    
    // CORSヘッダーをチェック
    const corsHeaders = {
      'Access-Control-Allow-Origin': response.headers.get('access-control-allow-origin'),
      'Access-Control-Allow-Methods': response.headers.get('access-control-allow-methods'),
      'Access-Control-Allow-Headers': response.headers.get('access-control-allow-headers'),
    };
    
    let hasCors = false;
    for (const [key, value] of Object.entries(corsHeaders)) {
      if (value) {
        console.log(`   ${key}: ${value}`);
        hasCors = true;
      }
    }
    
    if (!hasCors) {
      console.log('   ⚠️ CORSヘッダーなし');
      console.log('   → React Native/Expo環境では問題ありません');
      console.log('   → ブラウザ環境では表示できない可能性があります');
    }
    
    // HTTPとHTTPSの違いをチェック
    if (url.startsWith('http://')) {
      console.log('   ⚠️ HTTPプロトコル使用中 - HTTPSへの変換が必要');
      
      // HTTPSバージョンもテスト
      const httpsUrl = url.replace('http://', 'https://');
      console.log(`   🔄 HTTPSバージョンをテスト: ${httpsUrl.substring(0, 50)}...`);
      
      const httpsResponse = await fetch(httpsUrl, {
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0'
        }
      });
      
      if (httpsResponse.ok) {
        console.log(`   ✅ HTTPSバージョンは有効: ${httpsResponse.status}`);
      } else {
        console.log(`   ❌ HTTPSバージョンも無効: ${httpsResponse.status}`);
      }
    }
    
    return response.ok;
    
  } catch (error) {
    console.error(`   ❌ エラー: ${error.message}`);
    
    if (error.cause) {
      console.error(`   原因: ${error.cause}`);
    }
    
    // ネットワークエラーの詳細
    if (error.message.includes('ENOTFOUND')) {
      console.error('   → ドメインが見つかりません');
    } else if (error.message.includes('ETIMEDOUT')) {
      console.error('   → タイムアウト');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.error('   → 接続が拒否されました');
    }
    
    return false;
  }
}

async function runTests() {
  console.log('📋 テスト環境情報:');
  console.log(`   Node.js: ${process.version}`);
  console.log(`   プラットフォーム: ${process.platform}`);
  console.log(`   実行時刻: ${new Date().toLocaleString('ja-JP')}`);
  console.log('================================\n');
  
  const results = [];
  
  for (const url of testUrls) {
    const isValid = await testImageUrl(url);
    results.push({ url: url.substring(0, 50) + '...', valid: isValid });
  }
  
  console.log('\n\n📊 テスト結果サマリー');
  console.log('================================');
  
  let successCount = 0;
  results.forEach(result => {
    console.log(`${result.valid ? '✅' : '❌'} ${result.url}`);
    if (result.valid) successCount++;
  });
  
  console.log(`\n成功: ${successCount}/${results.length}`);
  
  console.log('\n\n🎯 診断結果と推奨事項');
  console.log('================================');
  console.log('1. CORSヘッダーの欠如:');
  console.log('   - React Native/Expoアプリでは問題なし');
  console.log('   - WebView内での表示は不可');
  console.log('');
  console.log('2. 推奨される対策:');
  console.log('   - HTTPをHTTPSに変換する（実装済み）');
  console.log('   - expo-imageのキャッシュ機能を活用');
  console.log('   - エラー時のフォールバック画像を設定（実装済み）');
  console.log('');
  console.log('3. React Nativeでの画像表示:');
  console.log('   - CORSの影響を受けない');
  console.log('   - ネイティブのHTTPクライアントを使用');
  console.log('   - expo-imageが最適な表示を処理');
}

// テスト実行
runTests().catch(console.error);

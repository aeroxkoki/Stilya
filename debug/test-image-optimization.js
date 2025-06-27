/**
 * 画像URL最適化テストスクリプト
 * 実行方法: node debug/test-image-optimization.js
 */

// 最適化関数を直接実装（TypeScriptファイルをテストするため）
function optimizeImageUrl(url) {
  if (!url) return '';
  
  try {
    // 楽天画像URLの最適化
    if (url.includes('rakuten.co.jp')) {
      const urlObj = new URL(url);
      
      // 1. thumbnail.image.rakuten.co.jp → image.rakuten.co.jp に変更
      if (urlObj.hostname === 'thumbnail.image.rakuten.co.jp') {
        urlObj.hostname = 'image.rakuten.co.jp';
      }
      
      // 2. パスのサイズ指定を削除（オリジナルサイズにアクセス）
      urlObj.pathname = urlObj.pathname
        .replace(/\/128x128\//g, '/')
        .replace(/\/64x64\//g, '/')
        .replace(/\/pc\//g, '/')
        .replace(/\/thumbnail\//g, '/');
      
      // 3. クエリパラメータの最適化
      // _exパラメータを削除（オリジナルサイズを取得）
      urlObj.searchParams.delete('_ex');
      urlObj.searchParams.delete('_sc');
      
      // 4. 不要なクエリパラメータを削除してURLをクリーンに
      const cleanUrl = urlObj.toString();
      
      return cleanUrl;
    }
    
    // その他のURLはそのまま返す
    return url;
    
  } catch (error) {
    console.error('Error optimizing URL:', error);
    return url;
  }
}

// テストデータ
const testUrls = [
  {
    name: '楽天サムネイル画像（実際のDB例）',
    url: 'https://thumbnail.image.rakuten.co.jp/@0_mall/locondo/cabinet/x_commodity/6785000/aq3518ew00751_1.jpg?_ex=128x128'
  },
  {
    name: '楽天画像（別のサイズ）',
    url: 'https://thumbnail.image.rakuten.co.jp/@0_mall/locondo/cabinet/x_commodity/7191100/aq3518ew05146_1.jpg?_ex=64x64'
  },
  {
    name: 'Unsplash画像（テスト用）',
    url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab'
  }
];

console.log('=== 画像URL最適化テスト ===\n');

testUrls.forEach((test, index) => {
  console.log(`Test ${index + 1}: ${test.name}`);
  console.log('元のURL:', test.url);
  
  const optimized = optimizeImageUrl(test.url);
  console.log('最適化後:', optimized);
  console.log('変更あり:', test.url !== optimized);
  console.log('---\n');
});

// 実際に画像が取得できるかテスト
console.log('=== 画像取得テスト ===\n');

const https = require('https');

function testImageUrl(url, name) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      console.log(`${name}:`);
      console.log(`  ステータス: ${res.statusCode}`);
      console.log(`  Content-Type: ${res.headers['content-type']}`);
      console.log(`  Content-Length: ${res.headers['content-length']} bytes`);
      
      if (res.statusCode === 200) {
        console.log('  ✅ 画像取得成功');
      } else {
        console.log('  ❌ 画像取得失敗');
      }
      console.log('');
      resolve();
    }).on('error', (err) => {
      console.log(`${name}: ❌ エラー - ${err.message}\n`);
      resolve();
    });
  });
}

// 最初のテストURLで実際の画像取得をテスト
(async () => {
  const testUrl = testUrls[0];
  const optimizedUrl = optimizeImageUrl(testUrl.url);
  
  await testImageUrl(testUrl.url, '元のサムネイルURL');
  await testImageUrl(optimizedUrl, '最適化後のURL');
})();

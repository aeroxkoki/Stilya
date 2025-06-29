const https = require('https');
const http = require('http');

/**
 * 楽天画像サーバーへのアクセステスト
 * User-Agentやリファラーによるアクセス制限を確認
 */

const testUrls = [
  // 128x128 サムネイル
  'https://thumbnail.image.rakuten.co.jp/@0_mall/gladiatore/cabinet/tatras-01/tatras-01/tatras-287.jpg?_ex=128x128',
  // 300x300 サムネイル（高画質）
  'https://thumbnail.image.rakuten.co.jp/@0_mall/gladiatore/cabinet/tatras-01/tatras-01/tatras-287.jpg?_ex=300x300',
  // 400x400 サムネイル（より高画質）
  'https://thumbnail.image.rakuten.co.jp/@0_mall/gladiatore/cabinet/tatras-01/tatras-01/tatras-287.jpg?_ex=400x400',
  // 500x500 サムネイル（さらに高画質）
  'https://thumbnail.image.rakuten.co.jp/@0_mall/gladiatore/cabinet/tatras-01/tatras-01/tatras-287.jpg?_ex=500x500',
  // 800x800 サムネイル（最高画質）
  'https://thumbnail.image.rakuten.co.jp/@0_mall/gladiatore/cabinet/tatras-01/tatras-01/tatras-287.jpg?_ex=800x800',
  // パラメータなし
  'https://thumbnail.image.rakuten.co.jp/@0_mall/gladiatore/cabinet/tatras-01/tatras-01/tatras-287.jpg',
  // 高画質画像サーバー（アクセス不可の確認）
  'https://image.rakuten.co.jp/@0_mall/gladiatore/cabinet/tatras-01/tatras-01/tatras-287.jpg'
];

const userAgents = [
  // Expo/React Native デフォルト
  'Expo/SDK53 (https://expo.dev) Platform/ios',
  'Expo/SDK53 (https://expo.dev) Platform/android',
  // ブラウザ
  'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Mobile Safari/537.36',
  // 空のUser-Agent
  '',
];

async function testImageAccess(url, userAgent) {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'HEAD',
      headers: {
        'User-Agent': userAgent,
        'Accept': 'image/*',
        'Accept-Encoding': 'gzip, deflate, br',
      }
    };

    console.log(`\nテスト中: ${url}`);
    console.log(`User-Agent: ${userAgent || '(空)'}`);
    
    const req = protocol.request(options, (res) => {
      console.log(`  ステータス: ${res.statusCode}`);
      console.log(`  Content-Type: ${res.headers['content-type']}`);
      console.log(`  Content-Length: ${res.headers['content-length']}`);
      console.log(`  Cache-Control: ${res.headers['cache-control']}`);
      console.log(`  Access-Control-Allow-Origin: ${res.headers['access-control-allow-origin'] || '(なし)'}`);
      
      if (res.statusCode >= 200 && res.statusCode < 300) {
        resolve({ success: true, statusCode: res.statusCode });
      } else {
        resolve({ success: false, statusCode: res.statusCode });
      }
    });

    req.on('error', (err) => {
      console.log(`  エラー: ${err.message}`);
      resolve({ success: false, error: err.message });
    });

    req.setTimeout(10000, () => {
      console.log('  タイムアウト');
      req.destroy();
      resolve({ success: false, error: 'Timeout' });
    });

    req.end();
  });
}

async function runTests() {
  console.log('🔍 楽天画像サーバーアクセステスト開始...\n');
  
  const results = [];
  
  for (const url of testUrls) {
    console.log('=' * 60);
    console.log(`URL: ${url.substring(0, 60)}...`);
    
    for (const userAgent of userAgents) {
      const result = await testImageAccess(url, userAgent);
      results.push({
        url: url.substring(0, 40) + '...',
        userAgent: userAgent.substring(0, 30) + '...',
        ...result
      });
      
      // リクエスト間隔を空ける
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  console.log('\n\n📊 結果サマリー:');
  console.log('成功したリクエスト:');
  results.filter(r => r.success).forEach(r => {
    console.log(`  ✅ ${r.url} - User-Agent: ${r.userAgent}`);
  });
  
  console.log('\n失敗したリクエスト:');
  results.filter(r => !r.success).forEach(r => {
    console.log(`  ❌ ${r.url} - User-Agent: ${r.userAgent} - Status: ${r.statusCode || r.error}`);
  });
  
  // 楽天画像の成功率を計算
  const rakutenResults = results.filter(r => r.url.includes('rakuten'));
  const rakutenSuccess = rakutenResults.filter(r => r.success).length;
  console.log(`\n楽天画像の成功率: ${rakutenSuccess}/${rakutenResults.length} (${Math.round(rakutenSuccess/rakutenResults.length * 100)}%)`);
}

// 実行
runTests().catch(console.error);

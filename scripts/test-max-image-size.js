const https = require('https');

/**
 * 楽天画像サーバーがサポートする最大サイズをテスト
 */

const testSizes = [
  '600x600',
  '800x800',
  '1000x1000',
  '1200x1200',
  '1500x1500',
  '2000x2000',
];

const sampleUrl = 'https://thumbnail.image.rakuten.co.jp/@0_mall/gladiatore/cabinet/tatras-01/tatras-01/tatras-287.jpg';

async function testImageSize(size) {
  return new Promise((resolve) => {
    const url = `${sampleUrl}?_ex=${size}`;
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'HEAD',
      headers: {
        'User-Agent': 'Expo/SDK53 (https://expo.dev) Platform/ios',
        'Accept': 'image/*',
      }
    };

    const req = https.request(options, (res) => {
      resolve({
        size,
        statusCode: res.statusCode,
        contentLength: res.headers['content-length'],
        contentType: res.headers['content-type'],
        success: res.statusCode >= 200 && res.statusCode < 300
      });
    });

    req.on('error', (err) => {
      resolve({
        size,
        statusCode: 0,
        error: err.message,
        success: false
      });
    });

    req.setTimeout(5000, () => {
      req.destroy();
      resolve({
        size,
        statusCode: 0,
        error: 'Timeout',
        success: false
      });
    });

    req.end();
  });
}

async function runTest() {
  console.log('🔍 楽天画像サーバーの最大サイズテスト\n');
  console.log('テスト中...\n');
  
  const results = [];
  
  for (const size of testSizes) {
    const result = await testImageSize(size);
    results.push(result);
    
    console.log(`${size}:`);
    if (result.success) {
      console.log(`  ✅ 成功 - サイズ: ${result.contentLength} bytes`);
    } else {
      console.log(`  ❌ 失敗 - ${result.error || `ステータス: ${result.statusCode}`}`);
    }
    
    // リクエスト間隔を空ける
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n📊 結果サマリー:\n');
  
  const successfulSizes = results.filter(r => r.success);
  if (successfulSizes.length > 0) {
    console.log('利用可能なサイズ:');
    successfulSizes.forEach(r => {
      const sizeKB = Math.round(parseInt(r.contentLength) / 1024);
      console.log(`  - ${r.size} (${sizeKB}KB)`);
    });
    
    const largestSize = successfulSizes[successfulSizes.length - 1];
    console.log(`\n🎯 推奨最大サイズ: ${largestSize.size}`);
  } else {
    console.log('❌ 利用可能なサイズが見つかりませんでした');
  }
}

// 実行
runTest().catch(console.error);

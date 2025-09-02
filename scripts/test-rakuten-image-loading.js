/**
 * 楽天画像の読み込みテスト
 * 問題の根本原因を特定するためのテストスクリプト
 */

const { Image } = require('react-native');

// テスト用の楽天画像URL（実際の商品画像）
const testUrls = [
  'https://thumbnail.image.rakuten.co.jp/@0_mall/rakuten24/cabinet/474/4902370526474.jpg?_ex=800x800',
  'https://shop.r10s.jp/book/cabinet/4859/9784575524857_1_2.jpg',
  'https://image.rakuten.co.jp/mb/cabinet/img155/m30068875593_1.jpg',
];

console.log('🧪 楽天画像読み込みテスト開始...\n');

// React Nativeの画像プリフェッチを使用してテスト
async function testImageLoading() {
  for (const url of testUrls) {
    console.log(`\n📸 テスト中: ${url.substring(0, 80)}...`);
    
    try {
      // React NativeのImage.prefetchを使ってテスト
      const result = await Image.prefetch(url);
      console.log('✅ 成功: 画像を正常に読み込めました');
      console.log('   結果:', result);
    } catch (error) {
      console.error('❌ エラー: 画像の読み込みに失敗しました');
      console.error('   エラー詳細:', error.message || error);
      
      // CORSエラーかどうかチェック
      if (error.message && error.message.includes('CORS')) {
        console.error('   ⚠️ CORS問題が検出されました');
      }
    }
  }
  
  console.log('\n\n📊 テスト完了');
  console.log('================================');
  console.log('結論: React Native環境では通常CORSエラーは発生しません。');
  console.log('もし画像が表示されない場合、以下を確認してください:');
  console.log('1. ネットワーク接続の問題');
  console.log('2. 画像URLの有効性');
  console.log('3. expo-imageコンポーネントの設定');
  console.log('4. キャッシュの問題');
}

// Node.js環境でfetchを使ってテスト（CORSの影響を受けない）
async function testDirectFetch() {
  console.log('\n\n🌐 直接fetch テスト...\n');
  
  for (const url of testUrls) {
    console.log(`\n🔍 フェッチ中: ${url.substring(0, 80)}...`);
    
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
        }
      });
      
      console.log(`   ステータス: ${response.status} ${response.statusText}`);
      console.log(`   Content-Type: ${response.headers.get('content-type')}`);
      console.log(`   Content-Length: ${response.headers.get('content-length')} bytes`);
      
      // CORSヘッダーをチェック
      const corsHeader = response.headers.get('access-control-allow-origin');
      if (corsHeader) {
        console.log(`   CORS Header: ${corsHeader}`);
      } else {
        console.log('   ⚠️ CORSヘッダーなし（React Nativeでは問題なし）');
      }
      
      if (response.ok) {
        console.log('   ✅ 画像URLは有効です');
      } else {
        console.log('   ❌ 画像URLが無効です');
      }
    } catch (error) {
      console.error('   ❌ フェッチエラー:', error.message);
    }
  }
}

// テストを実行
async function runTests() {
  try {
    // React Native環境でない場合はfetchテストのみ実行
    if (typeof Image === 'undefined' || !Image.prefetch) {
      console.log('ℹ️ React Native環境ではないため、fetchテストのみ実行します');
      await testDirectFetch();
    } else {
      await testImageLoading();
      await testDirectFetch();
    }
  } catch (error) {
    console.error('テスト実行エラー:', error);
  }
}

// テスト実行
runTests();

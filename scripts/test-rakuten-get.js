/**
 * 楽天画像URLの詳細テスト（GET版）
 * 実際に画像をダウンロードして検証
 */

const testUrls = [
  'https://thumbnail.image.rakuten.co.jp/@0_mall/rakuten24/cabinet/474/4902370526474.jpg?_ex=800x800',
  'https://shop.r10s.jp/book/cabinet/4859/9784575524857_1_2.jpg',
  'https://image.rakuten.co.jp/mb/cabinet/img155/m30068875593_1.jpg',
];

console.log('🧪 楽天画像GET リクエストテスト\n');
console.log('================================\n');

async function testImageWithGet(url) {
  console.log(`\n📸 GET リクエスト: ${url.substring(0, 70)}...`);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
        'Accept': 'image/*',
      }
    });
    
    console.log(`   ステータス: ${response.status} ${response.statusText}`);
    console.log(`   Content-Type: ${response.headers.get('content-type') || 'N/A'}`);
    
    const contentLength = response.headers.get('content-length');
    if (contentLength) {
      const sizeKB = Math.round(parseInt(contentLength) / 1024);
      console.log(`   サイズ: ${sizeKB} KB`);
    }
    
    // CORSヘッダーをチェック
    const corsHeader = response.headers.get('access-control-allow-origin');
    if (corsHeader) {
      console.log(`   CORS: ${corsHeader}`);
    } else {
      console.log('   CORS: ヘッダーなし');
    }
    
    if (response.ok) {
      // 画像データの最初の数バイトを読み取って検証
      const buffer = await response.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      
      // JPEGのマジックナンバーをチェック
      if (bytes[0] === 0xFF && bytes[1] === 0xD8) {
        console.log('   ✅ 有効なJPEG画像です');
      }
      // PNGのマジックナンバーをチェック
      else if (bytes[0] === 0x89 && bytes[1] === 0x50) {
        console.log('   ✅ 有効なPNG画像です');
      }
      // GIFのマジックナンバーをチェック
      else if (bytes[0] === 0x47 && bytes[1] === 0x49) {
        console.log('   ✅ 有効なGIF画像です');
      } else {
        console.log('   ⚠️ 画像形式が不明です');
      }
      
      console.log(`   画像サイズ: ${Math.round(buffer.byteLength / 1024)} KB`);
      return true;
    } else {
      console.log('   ❌ 画像の取得に失敗しました');
      return false;
    }
    
  } catch (error) {
    console.error(`   ❌ エラー: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('📋 テスト開始時刻:', new Date().toLocaleString('ja-JP'));
  console.log('================================\n');
  
  let successCount = 0;
  
  for (const url of testUrls) {
    const success = await testImageWithGet(url);
    if (success) successCount++;
  }
  
  console.log('\n\n📊 結果サマリー');
  console.log('================================');
  console.log(`成功: ${successCount}/${testUrls.length}`);
  
  if (successCount === testUrls.length) {
    console.log('\n✅ すべての画像URLが有効です！');
    console.log('→ React Native/Expoアプリでは問題なく表示できるはずです');
  } else {
    console.log('\n⚠️ 一部の画像URLに問題があります');
    console.log('→ フォールバック画像の使用を推奨します');
  }
  
  console.log('\n\n💡 React Native での解決策');
  console.log('================================');
  console.log('1. expo-imageコンポーネントを使用（実装済み）');
  console.log('2. HTTPをHTTPSに変換（実装済み）');
  console.log('3. エラー時のフォールバック画像（実装済み）');
  console.log('4. キャッシュポリシーを"memory-disk"に設定（実装済み）');
  console.log('');
  console.log('✨ CORSはReact Nativeでは影響しません！');
}

// テスト実行
runTests().catch(console.error);

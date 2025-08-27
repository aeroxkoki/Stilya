/**
 * 画像読み込み問題の詳細診断スクリプト（改善版）
 * 実行: node scripts/diagnose-image-detailed.js
 */

const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');
const dotenv = require('dotenv');
const path = require('path');

// 環境変数を読み込み
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ 環境変数が設定されていません');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkImageUrlWithGet(url) {
  try {
    // GETリクエストで実際に画像を取得
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15',
        'Accept': 'image/*',
        'Referer': 'https://www.rakuten.co.jp/'
      },
      redirect: 'follow',
      timeout: 15000
    });
    
    const contentType = response.headers.get('content-type');
    const contentLength = response.headers.get('content-length');
    
    // 画像データの最初の部分を読み込んで確認
    const buffer = await response.buffer();
    const isValidImage = buffer && buffer.length > 0;
    
    return {
      isAccessible: response.ok && isValidImage,
      statusCode: response.status,
      contentType: contentType || undefined,
      contentLength: contentLength ? parseInt(contentLength) : buffer.length,
      isImage: contentType ? contentType.startsWith('image/') : false,
      actualDataReceived: buffer.length > 0
    };
  } catch (error) {
    return {
      isAccessible: false,
      error: error.message
    };
  }
}

async function testDirectAccess() {
  console.log('\n🌐 Step 6: ブラウザ直接アクセステスト\n');
  console.log('========================================');
  console.log('以下のURLをブラウザで直接開いて確認してください：\n');
  
  const testUrl = 'https://thumbnail.image.rakuten.co.jp/@0_mall/stylife/cabinet/item/052/pb9052-01_1.jpg?_ex=800x800';
  console.log(`テストURL: ${testUrl}`);
  console.log('\n✅ ブラウザで画像が表示される場合：');
  console.log('   → CORSの問題か、アプリからのアクセス制限の可能性');
  console.log('\n❌ ブラウザでも画像が表示されない場合：');
  console.log('   → URLの問題か、楽天側のアクセス制限\n');
}

async function diagnoseImageIssues() {
  console.log('🔍 画像読み込み問題の詳細診断を開始します...\n');
  
  // 1. データベースから商品を取得
  console.log('📊 Step 1: データベースから商品を取得...');
  const { data: products, error } = await supabase
    .from('external_products')
    .select('id, title, image_url')
    .eq('is_active', true)
    .limit(3); // 詳細テストなので3件に絞る
  
  if (error) {
    console.error('❌ データベースエラー:', error);
    return;
  }
  
  if (!products || products.length === 0) {
    console.log('⚠️ アクティブな商品が見つかりません');
    return;
  }
  
  console.log(`✅ ${products.length}件の商品を取得しました\n`);
  
  // 2. 各画像URLをGETリクエストで詳細診断
  console.log('🖼️ Step 2: GETリクエストで画像を実際に取得...\n');
  
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const url = product.image_url;
    
    console.log(`[${i + 1}/${products.length}] テスト中: ${product.id}`);
    console.log(`  商品: ${product.title?.substring(0, 40)}...`);
    console.log(`  URL: ${url?.substring(0, 100)}...`);
    
    if (!url) {
      console.log('  ❌ URLが存在しません\n');
      continue;
    }
    
    const result = await checkImageUrlWithGet(url);
    
    if (result.isAccessible) {
      console.log('  ✅ 画像取得成功！');
      console.log(`  - Content-Type: ${result.contentType}`);
      console.log(`  - サイズ: ${(result.contentLength / 1024).toFixed(2)} KB`);
      console.log(`  - 画像データ: ${result.actualDataReceived ? '正常' : '異常'}`);
    } else {
      console.log('  ❌ 画像取得失敗');
      if (result.statusCode) {
        console.log(`  - HTTPステータス: ${result.statusCode}`);
      }
      if (result.error) {
        console.log(`  - エラー: ${result.error}`);
      }
    }
    console.log('');
  }
  
  // 3. React Native / Expo環境での制限を説明
  console.log('\n📱 Step 3: React Native/Expo環境での考慮事項\n');
  console.log('========================================');
  console.log('1. 楽天画像サーバーのアクセス制限:');
  console.log('   - User-Agent制限がある可能性');
  console.log('   - Refererチェックがある可能性');
  console.log('   - 外部アプリからの直接アクセスを制限している可能性\n');
  
  console.log('2. CORS (Cross-Origin Resource Sharing) 制限:');
  console.log('   - WebViewでは問題になる可能性');
  console.log('   - React Nativeネイティブ環境では通常問題にならない\n');
  
  console.log('3. SSL証明書の問題:');
  console.log('   - 古いAndroidデバイスでSSL証明書エラーの可能性\n');
  
  // 4. 解決策の提案
  console.log('\n💡 Step 4: 推奨される解決策\n');
  console.log('========================================');
  console.log('【短期的解決策】');
  console.log('1. ✅ 実装済み: リトライ機能とフォールバック画像');
  console.log('2. 画像URLのキャッシュ期限を確認（楽天側で変更される可能性）');
  console.log('3. User-AgentやRefererヘッダーの調整\n');
  
  console.log('【根本的解決策】');
  console.log('1. 🎯 画像プロキシサーバーの構築:');
  console.log('   - Supabase Edge FunctionsやVercel APIで画像を中継');
  console.log('   - 楽天の画像を取得してキャッシュ\n');
  
  console.log('2. 🗄️ Supabase Storageへの画像保存:');
  console.log('   - 商品登録時に画像をダウンロードして保存');
  console.log('   - 自前のCDNから配信\n');
  
  console.log('3. 📦 楽天APIの正式な画像URL取得方法の確認:');
  console.log('   - APIドキュメントを再確認');
  console.log('   - 画像URLの有効期限や制限を確認\n');
  
  await testDirectAccess();
  
  console.log('✨ 詳細診断完了\n');
}

// 実行
diagnoseImageIssues().catch(console.error);

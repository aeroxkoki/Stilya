/**
 * 画像読み込み問題の診断スクリプト
 * 実行: node scripts/diagnose-image-issue.js
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

async function checkImageUrl(url) {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15'
      },
      redirect: 'follow',
      timeout: 10000
    });
    
    return {
      isAccessible: response.ok,
      statusCode: response.status,
      contentType: response.headers.get('content-type') || undefined
    };
  } catch (error) {
    return {
      isAccessible: false,
      error: error.message
    };
  }
}

async function diagnoseImageIssues() {
  console.log('🔍 画像読み込み問題の診断を開始します...\n');
  
  // 1. データベースから商品を取得
  console.log('📊 Step 1: データベースから商品を取得...');
  const { data: products, error } = await supabase
    .from('external_products')
    .select('id, title, image_url')
    .eq('is_active', true)
    .limit(10);
  
  if (error) {
    console.error('❌ データベースエラー:', error);
    return;
  }
  
  if (!products || products.length === 0) {
    console.log('⚠️ アクティブな商品が見つかりません');
    return;
  }
  
  console.log(`✅ ${products.length}件の商品を取得しました\n`);
  
  // 2. 各画像URLを診断
  console.log('🖼️ Step 2: 各画像URLを診断...\n');
  const results = [];
  
  for (const product of products) {
    const url = product.image_url;
    const isHttps = url?.startsWith('https://');
    const isValid = !!url && url.length > 0;
    
    let accessibility = { isAccessible: false, error: 'No URL' };
    if (url) {
      accessibility = await checkImageUrl(url);
    }
    
    const result = {
      productId: product.id,
      title: product.title?.substring(0, 50) + '...',
      imageUrl: url || 'NULL',
      urlValid: isValid,
      isHttps,
      ...accessibility
    };
    
    results.push(result);
    
    // 結果を表示
    console.log(`[${results.length}/${products.length}] ${product.id}`);
    console.log(`  タイトル: ${result.title}`);
    console.log(`  URL: ${url?.substring(0, 80)}...`);
    console.log(`  HTTPS: ${isHttps ? '✅' : '❌'}`);
    console.log(`  アクセス可能: ${accessibility.isAccessible ? '✅' : '❌'}`);
    if (accessibility.statusCode) {
      console.log(`  ステータス: ${accessibility.statusCode}`);
    }
    if (accessibility.contentType) {
      console.log(`  Content-Type: ${accessibility.contentType}`);
    }
    if (accessibility.error) {
      console.log(`  エラー: ${accessibility.error}`);
    }
    console.log('');
  }
  
  // 3. 統計を表示
  console.log('\n📈 Step 3: 診断結果の統計\n');
  console.log('========================================');
  
  const validUrls = results.filter(r => r.urlValid).length;
  const httpsUrls = results.filter(r => r.isHttps).length;
  const accessibleUrls = results.filter(r => r.isAccessible).length;
  
  console.log(`✅ 有効なURL: ${validUrls}/${results.length}`);
  console.log(`🔒 HTTPS URL: ${httpsUrls}/${results.length}`);
  console.log(`🌐 アクセス可能: ${accessibleUrls}/${results.length}`);
  
  // 4. 問題のパターンを分析
  console.log('\n🔍 Step 4: 問題パターンの分析\n');
  console.log('========================================');
  
  const issues = results.filter(r => !r.isAccessible);
  if (issues.length > 0) {
    console.log(`⚠️ ${issues.length}件の画像がアクセス不可:\n`);
    
    // エラーパターンを集計
    const errorPatterns = {};
    issues.forEach(issue => {
      const key = issue.error || `HTTP ${issue.statusCode}`;
      errorPatterns[key] = (errorPatterns[key] || 0) + 1;
    });
    
    Object.entries(errorPatterns).forEach(([error, count]) => {
      console.log(`  - ${error}: ${count}件`);
    });
    
    // HTTPの画像
    const httpUrls = results.filter(r => !r.isHttps);
    if (httpUrls.length > 0) {
      console.log(`\n⚠️ HTTP URLの商品 (HTTPSへの変換が必要):`);
      httpUrls.forEach(r => {
        console.log(`  - ${r.productId}: ${r.imageUrl.substring(0, 50)}...`);
      });
    }
    
    // 楽天の画像
    const rakutenUrls = results.filter(r => r.imageUrl.includes('rakuten'));
    if (rakutenUrls.length > 0) {
      const rakutenAccessible = rakutenUrls.filter(r => r.isAccessible).length;
      console.log(`\n📦 楽天の画像: ${rakutenAccessible}/${rakutenUrls.length}件がアクセス可能`);
    }
  } else {
    console.log('✅ すべての画像がアクセス可能です！');
  }
  
  // 5. 推奨される解決策
  console.log('\n💡 Step 5: 推奨される解決策\n');
  console.log('========================================');
  
  if (accessibleUrls < results.length) {
    console.log('以下の対策を検討してください：\n');
    
    if (httpsUrls < results.length) {
      console.log('1. すべてのURLをHTTPSに変換する');
    }
    
    const corsIssues = issues.filter(i => 
      i.error?.includes('CORS') || 
      i.error?.includes('Failed to fetch') ||
      i.error?.includes('Network')
    );
    if (corsIssues.length > 0) {
      console.log('2. CORSの問題が疑われます - プロキシサーバーの使用を検討');
    }
    
    const notFoundIssues = issues.filter(i => i.statusCode === 404);
    if (notFoundIssues.length > 0) {
      console.log('3. 404エラーの画像URLを更新する必要があります');
    }
    
    console.log('4. 画像URLの取得元（楽天API）の仕様を確認');
    console.log('5. CloudinaryやSupabase Storageなどの画像ホスティングサービスの使用を検討');
  } else {
    console.log('✅ 画像URLは正常です。アプリ側の実装を確認してください。');
  }
  
  console.log('\n✨ 診断完了\n');
}

// 実行
diagnoseImageIssues().catch(console.error);

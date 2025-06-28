// 画像表示問題の根本原因を診断するスクリプト

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

// 画像URLの検証
function validateImageUrl(url) {
  if (!url) return { valid: false, reason: 'URLが空です' };
  
  try {
    const urlObj = new URL(url);
    
    // HTTPSチェック
    if (urlObj.protocol !== 'https:') {
      return { valid: false, reason: 'HTTPSではありません' };
    }
    
    // 楽天の画像URLパターンチェック
    if (url.includes('image.rakuten.co.jp')) {
      // 楽天の正規の画像URLパターンをチェック
      if (url.includes('@0_mall')) {
        return { valid: true, type: 'rakuten_mall' };
      }
      return { valid: true, type: 'rakuten_other' };
    }
    
    // その他のURL
    return { valid: true, type: 'other' };
  } catch (e) {
    return { valid: false, reason: 'URLパース失敗: ' + e.message };
  }
}

// 画像URLの最適化をシミュレート
function simulateOptimizeImageUrl(url) {
  if (!url) return '';
  
  let optimized = url;
  
  // HTTPをHTTPSに変換
  if (optimized.startsWith('http://')) {
    optimized = optimized.replace('http://', 'https://');
  }
  
  // サムネイルドメインを通常の画像ドメインに変更
  if (optimized.includes('thumbnail.image.rakuten.co.jp')) {
    optimized = optimized.replace('thumbnail.image.rakuten.co.jp', 'image.rakuten.co.jp');
  }
  
  // サイズ指定を削除
  optimized = optimized
    .replace('/128x128/', '/')
    .replace('/64x64/', '/')
    .replace('/pc/', '/')
    .replace('/thumbnail/', '/')
    .replace('?_ex=128x128', '')
    .replace('?_ex=64x64', '')
    .replace('&_ex=128x128', '')
    .replace('&_ex=64x64', '');
  
  return optimized;
}

// HTTPリクエストで画像の存在を確認
const https = require('https');
function checkImageExists(url) {
  return new Promise((resolve) => {
    if (!url) {
      resolve({ exists: false, reason: 'URLが空です' });
      return;
    }
    
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        resolve({ exists: true, statusCode: res.statusCode });
      } else {
        resolve({ exists: false, statusCode: res.statusCode, reason: `HTTPステータス: ${res.statusCode}` });
      }
    }).on('error', (err) => {
      resolve({ exists: false, reason: 'ネットワークエラー: ' + err.message });
    });
  });
}

async function diagnoseProblem() {
  console.log('🔍 画像表示問題の根本原因診断を開始します...\n');
  
  try {
    // 1. アクティブな商品を取得
    console.log('📥 データベースから商品を取得中...');
    const { data: products, error } = await supabase
      .from('external_products')
      .select('id, title, image_url, source')
      .eq('is_active', true)
      .limit(5);
    
    if (error) {
      console.error('❌ エラー:', error);
      return;
    }
    
    console.log(`✅ ${products.length}件の商品を取得しました\n`);
    
    // 2. 各商品の画像を詳細に診断
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`[${i + 1}/${products.length}] ${product.title.substring(0, 40)}...`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      
      // URL検証
      const validation = validateImageUrl(product.image_url);
      console.log(`\n📋 URL検証結果:`);
      console.log(`   - 有効: ${validation.valid ? '✅' : '❌'}`);
      if (!validation.valid) {
        console.log(`   - 理由: ${validation.reason}`);
      } else {
        console.log(`   - タイプ: ${validation.type}`);
      }
      
      // オリジナルURL
      console.log(`\n🔗 オリジナルURL:`);
      console.log(`   ${product.image_url}`);
      
      // URL最適化シミュレーション
      const optimizedUrl = simulateOptimizeImageUrl(product.image_url);
      const wasOptimized = optimizedUrl !== product.image_url;
      
      console.log(`\n🔧 URL最適化:`);
      console.log(`   - 最適化が必要: ${wasOptimized ? '✅' : '❌'}`);
      if (wasOptimized) {
        console.log(`   - 最適化後URL: ${optimizedUrl}`);
      }
      
      // 画像の存在確認（オリジナル）
      console.log(`\n🌐 画像アクセス確認（オリジナル）:`);
      const originalCheck = await checkImageExists(product.image_url);
      console.log(`   - アクセス可能: ${originalCheck.exists ? '✅' : '❌'}`);
      if (!originalCheck.exists) {
        console.log(`   - 理由: ${originalCheck.reason}`);
      } else if (originalCheck.statusCode) {
        console.log(`   - HTTPステータス: ${originalCheck.statusCode}`);
      }
      
      // 最適化されたURLの場合、そちらも確認
      if (wasOptimized) {
        console.log(`\n🌐 画像アクセス確認（最適化後）:`);
        const optimizedCheck = await checkImageExists(optimizedUrl);
        console.log(`   - アクセス可能: ${optimizedCheck.exists ? '✅' : '❌'}`);
        if (!optimizedCheck.exists) {
          console.log(`   - 理由: ${optimizedCheck.reason}`);
        } else if (optimizedCheck.statusCode) {
          console.log(`   - HTTPステータス: ${optimizedCheck.statusCode}`);
        }
      }
    }
    
    // 3. 問題の要約
    console.log('\n\n📊 診断結果の要約:');
    console.log('================');
    
    const totalProducts = products.length;
    let validUrls = 0;
    let accessibleImages = 0;
    let needsOptimization = 0;
    
    for (const product of products) {
      const validation = validateImageUrl(product.image_url);
      if (validation.valid) validUrls++;
      
      const check = await checkImageExists(product.image_url);
      if (check.exists) accessibleImages++;
      
      const optimized = simulateOptimizeImageUrl(product.image_url);
      if (optimized !== product.image_url) needsOptimization++;
    }
    
    console.log(`- URL検証合格: ${validUrls}/${totalProducts}`);
    console.log(`- 画像アクセス可能: ${accessibleImages}/${totalProducts}`);
    console.log(`- URL最適化が必要: ${needsOptimization}/${totalProducts}`);
    
    // 推奨アクション
    console.log('\n\n💡 推奨アクション:');
    console.log('===============');
    
    if (accessibleImages < totalProducts) {
      console.log('⚠️  画像にアクセスできない商品があります');
      console.log('   → ネットワーク設定やCORS設定を確認してください');
    }
    
    if (needsOptimization > 0) {
      console.log('⚠️  URL最適化が必要な商品があります');
      console.log('   → optimizeImageUrl関数が正しく動作しているか確認してください');
    }
    
    console.log('\n✅ 診断完了');
    
  } catch (error) {
    console.error('❌ 予期しないエラー:', error);
  }
}

// 実行
diagnoseProblem();

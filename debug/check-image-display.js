/**
 * 画像表示問題の診断スクリプト
 * Supabaseから商品データを取得し、画像URLの状態を確認
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase環境変数が設定されていません');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 画像最適化関数（本番と同じロジック）
function optimizeImageUrl(url) {
  if (!url) return '';
  
  try {
    if (url.includes('rakuten.co.jp')) {
      const urlObj = new URL(url);
      
      if (urlObj.hostname === 'thumbnail.image.rakuten.co.jp') {
        urlObj.hostname = 'image.rakuten.co.jp';
      }
      
      urlObj.pathname = urlObj.pathname
        .replace(/\/128x128\//g, '/')
        .replace(/\/64x64\//g, '/')
        .replace(/\/pc\//g, '/')
        .replace(/\/thumbnail\//g, '/');
      
      urlObj.searchParams.delete('_ex');
      urlObj.searchParams.delete('_sc');
      
      return urlObj.toString();
    }
    
    return url;
  } catch (error) {
    console.error('Error optimizing URL:', error);
    return url;
  }
}

async function checkImages() {
  console.log('=== 画像表示問題の診断 ===\n');
  
  // 1. データベースから商品を取得
  const { data: products, error } = await supabase
    .from('external_products')
    .select('id, title, image_url, source')
    .eq('is_active', true)
    .limit(10);
  
  if (error) {
    console.error('❌ データベースエラー:', error);
    return;
  }
  
  console.log(`📦 取得した商品数: ${products.length}\n`);
  
  // 2. 各商品の画像URLをチェック
  for (const product of products) {
    console.log(`【${product.title}】`);
    console.log(`  ID: ${product.id}`);
    console.log(`  Source: ${product.source}`);
    console.log(`  元のURL: ${product.image_url}`);
    
    const optimizedUrl = optimizeImageUrl(product.image_url);
    console.log(`  最適化後: ${optimizedUrl}`);
    console.log(`  変更あり: ${product.image_url !== optimizedUrl}`);
    
    // URLのパターンを分析
    if (product.image_url) {
      if (product.image_url.includes('thumbnail.image.rakuten.co.jp')) {
        console.log('  ⚠️  楽天サムネイルURL検出');
      }
      if (product.image_url.includes('_ex=')) {
        console.log('  ⚠️  サイズ指定パラメータ検出');
      }
    }
    
    console.log('');
  }
  
  // 3. 画像URLのパターン統計
  console.log('\n=== 画像URLパターン統計 ===');
  
  const patterns = {
    total: products.length,
    rakutenThumbnail: 0,
    unsplash: 0,
    noImage: 0,
    others: 0
  };
  
  products.forEach(product => {
    if (!product.image_url) {
      patterns.noImage++;
    } else if (product.image_url.includes('thumbnail.image.rakuten.co.jp')) {
      patterns.rakutenThumbnail++;
    } else if (product.image_url.includes('unsplash.com')) {
      patterns.unsplash++;
    } else {
      patterns.others++;
    }
  });
  
  console.log(`総商品数: ${patterns.total}`);
  console.log(`楽天サムネイル: ${patterns.rakutenThumbnail} (${(patterns.rakutenThumbnail/patterns.total*100).toFixed(1)}%)`);
  console.log(`Unsplash: ${patterns.unsplash} (${(patterns.unsplash/patterns.total*100).toFixed(1)}%)`);
  console.log(`画像なし: ${patterns.noImage} (${(patterns.noImage/patterns.total*100).toFixed(1)}%)`);
  console.log(`その他: ${patterns.others} (${(patterns.others/patterns.total*100).toFixed(1)}%)`);
  
  // 4. 実際に画像が取得できるかテスト
  console.log('\n=== 画像取得テスト（最初の3商品） ===');
  
  const https = require('https');
  
  async function testImageUrl(url, title) {
    return new Promise((resolve) => {
      if (!url) {
        console.log(`❌ ${title}: URLなし`);
        resolve();
        return;
      }
      
      https.get(url, (res) => {
        if (res.statusCode === 200) {
          console.log(`✅ ${title}: 取得成功 (${res.headers['content-type']})`);
        } else {
          console.log(`❌ ${title}: HTTPエラー ${res.statusCode}`);
        }
        resolve();
      }).on('error', (err) => {
        console.log(`❌ ${title}: ネットワークエラー - ${err.message}`);
        resolve();
      });
    });
  }
  
  for (let i = 0; i < Math.min(3, products.length); i++) {
    const product = products[i];
    const optimizedUrl = optimizeImageUrl(product.image_url);
    
    console.log(`\n商品: ${product.title}`);
    await testImageUrl(product.image_url, '元のURL');
    if (product.image_url !== optimizedUrl) {
      await testImageUrl(optimizedUrl, '最適化後');
    }
  }
}

// 実行
checkImages().catch(console.error);

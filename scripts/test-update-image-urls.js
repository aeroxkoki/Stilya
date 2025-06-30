#!/usr/bin/env node
/**
 * 画像URL更新テストスクリプト
 * 少数のサンプルで800x800への更新をテスト
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// 環境変数の読み込み
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 必要な環境変数が設定されていません');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 画像URLを最適化する関数（アプリと同じロジック）
function optimizeImageUrl(url) {
  const PLACEHOLDER_IMAGE = 'https://picsum.photos/800/800?grayscale';
  
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return PLACEHOLDER_IMAGE;
  }
  
  let optimizedUrl = url.trim();
  
  try {
    // HTTPをHTTPSに変換
    if (optimizedUrl.startsWith('http://')) {
      optimizedUrl = optimizedUrl.replace('http://', 'https://');
    }
    
    // 楽天の画像URLの場合の最適化
    if (optimizedUrl.includes('rakuten.co.jp')) {
      if (optimizedUrl.includes('thumbnail.image.rakuten.co.jp') && optimizedUrl.includes('_ex=')) {
        // 既存のサイズパラメータを800x800に変更
        optimizedUrl = optimizedUrl.replace(/_ex=\d+x\d+/g, '_ex=800x800');
      } else if (optimizedUrl.includes('thumbnail.image.rakuten.co.jp') && !optimizedUrl.includes('_ex=')) {
        // サイズパラメータがない場合は追加
        optimizedUrl += optimizedUrl.includes('?') ? '&_ex=800x800' : '?_ex=800x800';
      }
    }
    
    new URL(optimizedUrl); // URLとして有効かチェック
    return optimizedUrl;
    
  } catch (error) {
    console.warn('[ImageOptimizer] Invalid URL:', url, error);
    return PLACEHOLDER_IMAGE;
  }
}

async function testUpdateImageUrls() {
  console.log('🧪 画像URL更新テストを開始します...\n');
  
  try {
    // テスト用に10件のみ取得
    const { data: products, error: fetchError } = await supabase
      .from('external_products')
      .select('id, image_url, title, source_brand')
      .not('image_url', 'is', null)
      .limit(10);
    
    if (fetchError) {
      console.error('❌ データ取得エラー:', fetchError);
      return;
    }
    
    console.log(`📦 ${products.length}件の商品でテストします\n`);
    
    // 更新前後の比較
    console.log('🔍 更新前後の比較:');
    console.log('='.repeat(100));
    
    for (const product of products) {
      const originalUrl = product.image_url;
      const optimizedUrl = optimizeImageUrl(originalUrl);
      
      console.log(`\n商品名: ${product.title} (${product.source_brand})`);
      console.log(`変更前: ${originalUrl}`);
      console.log(`変更後: ${optimizedUrl}`);
      
      if (originalUrl !== optimizedUrl) {
        console.log('✅ 更新が必要');
        
        // 実際に更新
        const { error: updateError } = await supabase
          .from('external_products')
          .update({ image_url: optimizedUrl })
          .eq('id', product.id);
        
        if (updateError) {
          console.error(`❌ 更新エラー:`, updateError.message);
        } else {
          console.log('✅ 更新完了');
        }
      } else {
        console.log('ℹ️ 更新不要（すでに最適化済み）');
      }
    }
    
    // 更新後の確認
    console.log('\n\n📸 更新後の確認:');
    console.log('='.repeat(100));
    
    const { data: updatedProducts } = await supabase
      .from('external_products')
      .select('id, image_url, title, source_brand')
      .in('id', products.map(p => p.id));
    
    if (updatedProducts) {
      updatedProducts.forEach(product => {
        console.log(`\n商品名: ${product.title} (${product.source_brand})`);
        console.log(`現在のURL: ${product.image_url}`);
        
        if (product.image_url?.includes('_ex=800x800')) {
          console.log('✅ 800x800に最適化済み');
        } else if (product.image_url?.includes('_ex=')) {
          const match = product.image_url.match(/_ex=(\d+x\d+)/);
          console.log(`⚠️ サイズ: ${match?.[1] || '不明'}`);
        } else {
          console.log('⚠️ サイズ指定なし');
        }
      });
    }
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
  }
}

// 実行
testUpdateImageUrls();

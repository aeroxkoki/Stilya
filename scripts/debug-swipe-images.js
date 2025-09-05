#!/usr/bin/env node

/**
 * スワイプ画面の画像表示問題をデバッグするスクリプト
 * 
 * 確認項目:
 * 1. external_productsテーブルの商品データ確認
 * 2. 画像URLの形式確認
 * 3. 画像URLのアクセス可能性確認
 * 4. データベースの整合性確認
 */

const { createClient } = require('@supabase/supabase-js');
const https = require('https');
const http = require('http');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
);

// 画像URLのアクセス可能性をチェック
function checkImageUrl(url) {
  return new Promise((resolve) => {
    if (!url) {
      resolve({ url, accessible: false, error: 'URL is empty' });
      return;
    }

    const protocol = url.startsWith('https') ? https : http;
    const options = {
      method: 'HEAD',
      timeout: 5000,
    };

    try {
      const req = protocol.request(url, options, (res) => {
        resolve({
          url,
          accessible: res.statusCode === 200,
          statusCode: res.statusCode,
          contentType: res.headers['content-type']
        });
      });

      req.on('error', (error) => {
        resolve({
          url,
          accessible: false,
          error: error.message
        });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({
          url,
          accessible: false,
          error: 'Timeout'
        });
      });

      req.end();
    } catch (error) {
      resolve({
        url,
        accessible: false,
        error: error.message
      });
    }
  });
}

async function debugSwipeImages() {
  console.log('='.repeat(80));
  console.log('スワイプ画面画像デバッグレポート');
  console.log('='.repeat(80));

  try {
    // 1. データベース接続確認
    console.log('\n[1] データベース接続確認');
    console.log('-'.repeat(40));
    
    const { data: testData, error: testError } = await supabase
      .from('external_products')
      .select('id')
      .limit(1);
    
    if (testError) {
      console.error('❌ データベース接続エラー:', testError.message);
      return;
    }
    console.log('✅ データベース接続成功');

    // 2. 商品データの確認
    console.log('\n[2] 商品データの確認');
    console.log('-'.repeat(40));
    
    const { data: products, error: productsError } = await supabase
      .from('external_products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (productsError) {
      console.error('❌ 商品データ取得エラー:', productsError.message);
      return;
    }

    console.log(`📦 取得した商品数: ${products.length}`);
    
    // 3. 画像URLフィールドの確認
    console.log('\n[3] 画像URLフィールドの分析');
    console.log('-'.repeat(40));
    
    let hasImageUrl = 0;
    let hasImage_url = 0;
    let hasImage = 0;
    let hasThumbnail = 0;
    let emptyUrls = 0;
    let httpUrls = 0;
    let httpsUrls = 0;
    let rakutenUrls = 0;
    
    products.forEach(product => {
      if (product.imageUrl) hasImageUrl++;
      if (product.image_url) hasImage_url++;
      if (product.image) hasImage++;
      if (product.thumbnail) hasThumbnail++;
      
      const url = product.imageUrl || product.image_url || product.image || product.thumbnail || '';
      if (!url || url.trim() === '') {
        emptyUrls++;
      } else {
        if (url.startsWith('http://')) httpUrls++;
        if (url.startsWith('https://')) httpsUrls++;
        if (url.includes('rakuten.co.jp')) rakutenUrls++;
      }
    });
    
    console.log('画像フィールド統計:');
    console.log(`  - imageUrl フィールド: ${hasImageUrl}/${products.length}`);
    console.log(`  - image_url フィールド: ${hasImage_url}/${products.length}`);
    console.log(`  - image フィールド: ${hasImage}/${products.length}`);
    console.log(`  - thumbnail フィールド: ${hasThumbnail}/${products.length}`);
    console.log(`  - 空のURL: ${emptyUrls}/${products.length}`);
    console.log(`  - HTTP URL: ${httpUrls}/${products.length}`);
    console.log(`  - HTTPS URL: ${httpsUrls}/${products.length}`);
    console.log(`  - 楽天URL: ${rakutenUrls}/${products.length}`);
    
    // 4. サンプル商品の詳細確認
    console.log('\n[4] サンプル商品の詳細');
    console.log('-'.repeat(40));
    
    const sampleProducts = products.slice(0, 5);
    for (const product of sampleProducts) {
      const imageUrl = product.imageUrl || product.image_url || product.image || product.thumbnail || '';
      console.log(`\n商品: ${product.title?.substring(0, 50)}...`);
      console.log(`  ID: ${product.id}`);
      console.log(`  ブランド: ${product.brand || 'なし'}`);
      console.log(`  価格: ¥${product.price}`);
      console.log(`  画像URL: ${imageUrl ? imageUrl.substring(0, 100) + '...' : '❌ なし'}`);
      
      // 画像URLのアクセス確認
      if (imageUrl) {
        const result = await checkImageUrl(imageUrl);
        if (result.accessible) {
          console.log(`  画像アクセス: ✅ 成功 (${result.contentType})`);
        } else {
          console.log(`  画像アクセス: ❌ 失敗 (${result.error || `ステータスコード: ${result.statusCode}`})`);
        }
      }
    }
    
    // 5. テーブル構造の確認
    console.log('\n[5] テーブル構造の確認');
    console.log('-'.repeat(40));
    
    const { data: columns, error: columnsError } = await supabase.rpc('get_table_columns', {
      table_name: 'external_products'
    }).single();
    
    if (columnsError) {
      console.log('⚠️ カラム情報取得をスキップ（RPCが存在しない可能性）');
    } else if (columns) {
      console.log('external_productsテーブルのカラム:');
      columns.forEach(col => {
        if (col.includes('image') || col.includes('url') || col.includes('thumbnail')) {
          console.log(`  - ${col}`);
        }
      });
    }
    
    // 6. 推奨事項
    console.log('\n[6] 診断結果と推奨事項');
    console.log('-'.repeat(40));
    
    const issues = [];
    
    if (emptyUrls > products.length * 0.1) {
      issues.push('⚠️ 10%以上の商品に画像URLがありません');
    }
    
    if (httpUrls > 0) {
      issues.push('⚠️ HTTPのURLが存在します（HTTPSへの変換が必要）');
    }
    
    if (!hasImageUrl && !hasImage_url) {
      issues.push('❌ imageUrlまたはimage_urlフィールドが存在しません');
    }
    
    if (issues.length === 0) {
      console.log('✅ 画像データは正常に見えます');
    } else {
      console.log('問題点:');
      issues.forEach(issue => console.log(`  ${issue}`));
      
      console.log('\n推奨アクション:');
      if (emptyUrls > 0) {
        console.log('  1. 画像URLが空の商品を修正するか、削除してください');
      }
      if (httpUrls > 0) {
        console.log('  2. HTTPのURLをHTTPSに変換してください');
      }
      if (!hasImageUrl && !hasImage_url) {
        console.log('  3. データベーススキーマを確認し、適切な画像フィールドを追加してください');
      }
    }
    
    // 7. 現在アクティブな商品数
    console.log('\n[7] アクティブ商品の統計');
    console.log('-'.repeat(40));
    
    const { count: totalCount } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);
    
    const { count: withImageCount } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .not('imageUrl', 'is', null);
    
    console.log(`アクティブな商品総数: ${totalCount}`);
    console.log(`画像付きの商品数: ${withImageCount}`);
    console.log(`画像なしの商品数: ${totalCount - withImageCount}`);
    console.log(`画像カバー率: ${((withImageCount / totalCount) * 100).toFixed(1)}%`);
    
  } catch (error) {
    console.error('\n❌ デバッグ中にエラーが発生しました:', error);
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('デバッグ完了');
  console.log('='.repeat(80));
}

// スクリプト実行
debugSwipeImages().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

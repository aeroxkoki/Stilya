#!/usr/bin/env node
/**
 * 画像URL整合性詳細チェックスクリプト
 * サイズ指定なしの商品を特定して表示
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

async function checkUnoptimizedImages() {
  console.log('🔍 サイズ未指定の画像URLを調査します...\n');
  
  try {
    // サイズ指定がない画像URLを持つ商品を検索
    const { data: products, error } = await supabase
      .from('external_products')
      .select('id, image_url, title, source_brand, last_synced')
      .not('image_url', 'is', null)
      .filter('image_url', 'like', '%rakuten.co.jp%')
      .filter('image_url', 'not.like', '%_ex=%')
      .limit(20);
    
    if (error) {
      console.error('❌ データ取得エラー:', error);
      return;
    }
    
    console.log(`📊 サイズ未指定の商品: ${products.length}件\n`);
    
    if (products.length === 0) {
      console.log('✅ すべての楽天商品画像にサイズが指定されています！');
      
      // 別の条件でチェック（800x800以外のサイズ）
      const { data: otherSizeProducts } = await supabase
        .from('external_products')
        .select('id, image_url, title, source_brand')
        .not('image_url', 'is', null)
        .filter('image_url', 'like', '%_ex=%')
        .filter('image_url', 'not.like', '%_ex=800x800%')
        .limit(10);
      
      if (otherSizeProducts && otherSizeProducts.length > 0) {
        console.log('\n⚠️ 800x800以外のサイズを使用している商品:');
        console.log('='.repeat(80));
        
        otherSizeProducts.forEach((product, index) => {
          const sizeMatch = product.image_url.match(/_ex=(\d+x\d+)/);
          console.log(`\n${index + 1}. ${product.title} (${product.source_brand})`);
          console.log(`   サイズ: ${sizeMatch?.[1] || '不明'}`);
          console.log(`   URL: ${product.image_url}`);
        });
      }
      
      return;
    }
    
    // サイズ未指定の商品を表示
    console.log('📋 サイズ未指定の商品リスト:');
    console.log('='.repeat(100));
    
    products.forEach((product, index) => {
      const syncDate = new Date(product.last_synced);
      const daysAgo = Math.floor((Date.now() - syncDate) / (1000 * 60 * 60 * 24));
      
      console.log(`\n${index + 1}. ${product.title}`);
      console.log(`   ブランド: ${product.source_brand}`);
      console.log(`   最終同期: ${daysAgo}日前`);
      console.log(`   URL: ${product.image_url}`);
      
      // 推奨される更新後のURL
      const recommendedUrl = product.image_url + 
        (product.image_url.includes('?') ? '&_ex=800x800' : '?_ex=800x800');
      console.log(`   推奨URL: ${recommendedUrl}`);
    });
    
    // 統計情報
    console.log('\n\n📊 統計情報:');
    console.log('='.repeat(50));
    
    // 全体の件数を取得
    const { count: totalCount } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true })
      .not('image_url', 'is', null);
    
    const { count: optimizedCount } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true })
      .filter('image_url', 'like', '%_ex=800x800%');
    
    const { count: unoptimizedCount } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true })
      .filter('image_url', 'like', '%rakuten.co.jp%')
      .filter('image_url', 'not.like', '%_ex=%');
    
    console.log(`総商品数: ${totalCount || 0}件`);
    console.log(`800x800最適化済み: ${optimizedCount || 0}件 (${((optimizedCount / totalCount) * 100).toFixed(1)}%)`);
    console.log(`サイズ未指定: ${unoptimizedCount || 0}件 (${((unoptimizedCount / totalCount) * 100).toFixed(1)}%)`);
    
    if (unoptimizedCount > 0) {
      console.log('\n💡 推奨アクション:');
      console.log('   node scripts/update-image-urls-to-800.js を実行して');
      console.log('   すべての画像URLを800x800に更新してください。');
    }
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
  }
}

// 実行
checkUnoptimizedImages();

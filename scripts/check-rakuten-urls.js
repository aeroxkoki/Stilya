#!/usr/bin/env node
/**
 * 楽天画像URLの詳細チェックスクリプト
 * データベースの画像URLの状態を詳しく確認します
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase設定
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase環境変数が設定されていません');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkImageUrls() {
  console.log('楽天画像URLの詳細チェック\n');
  
  try {
    // サンプル商品を取得
    const { data: products, error } = await supabase
      .from('external_products')
      .select('id, title, image_url')
      .ilike('image_url', '%rakuten.co.jp%')
      .is('is_active', true)
      .limit(5);
    
    if (error) {
      console.error('エラー:', error.message);
      return;
    }
    
    console.log(`${products.length}件の商品をチェック:\n`);
    
    for (const product of products) {
      console.log(`商品: ${product.title?.substring(0, 50)}...`);
      console.log(`ID: ${product.id}`);
      console.log(`URL: ${product.image_url}`);
      
      // URLパラメータを解析
      if (product.image_url.includes('?')) {
        const url = new URL(product.image_url);
        console.log('パラメータ:', url.search);
        
        // _exパラメータの有無をチェック
        if (url.searchParams.has('_ex')) {
          console.log(`✅ _exパラメータあり: ${url.searchParams.get('_ex')}`);
        } else {
          console.log('❌ _exパラメータなし');
        }
      } else {
        console.log('❌ パラメータなし');
      }
      
      console.log('---');
    }
    
  } catch (error) {
    console.error('エラー:', error.message);
  }
}

checkImageUrls().catch(console.error);

#!/usr/bin/env node
/**
 * 楽天APIから商品データを取得して、Supabaseに保存するスクリプト
 * anon keyを使用するため、RLSポリシーに従った操作のみ可能
 */

const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

// 環境変数の読み込み
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Supabaseクライアントの作成（EXPO_PUBLIC_プレフィックス付きの環境変数を使用）
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const rakutenAppId = process.env.RAKUTEN_APP_ID;
const rakutenAffiliateId = process.env.RAKUTEN_AFFILIATE_ID;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase環境変数が設定されていません');
  process.exit(1);
}

if (!rakutenAppId || !rakutenAffiliateId) {
  console.error('❌ 楽天API環境変数が設定されていません');
  process.exit(1);
}

console.log('✅ 環境変数の確認');
console.log(`- Supabase URL: ${supabaseUrl}`);
console.log(`- Supabase Key: ${supabaseKey.substring(0, 20)}...`);
console.log(`- 楽天 App ID: ${rakutenAppId}`);
console.log(`- 楽天 Affiliate ID: ${rakutenAffiliateId}`);

const supabase = createClient(supabaseUrl, supabaseKey);

// レート制限対策
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 楽天APIから商品データを取得
 */
async function fetchRakutenProducts(genreId = '100371', page = 1, hits = 30) {
  const url = 'https://app.rakuten.co.jp/services/api/IchibaItem/Search/20170706';
  const params = {
    applicationId: rakutenAppId,
    affiliateId: rakutenAffiliateId,
    genreId: genreId,
    hits: hits,
    page: page,
    format: 'json'
  };

  try {
    const response = await axios.get(url, { params });
    return response.data;
  } catch (error) {
    console.error('楽天API エラー:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * 商品データをSupabaseに保存
 */
async function saveProducts(products) {
  console.log(`\n📦 ${products.length}件の商品を保存中...`);
  
  const productsToInsert = products.map(item => {
    const product = item.Item;
    return {
      id: product.itemCode,
      title: product.itemName,
      image_url: product.mediumImageUrls[0]?.imageUrl || '',
      brand: product.shopName,
      price: product.itemPrice,
      tags: extractTags(product),
      category: '100371', // 女性ファッション
      affiliate_url: product.affiliateUrl || product.itemUrl,
      source: 'rakuten',
      is_active: true,
      last_synced: new Date().toISOString()
    };
  });

  try {
    // 既存の商品をチェック
    const existingIds = productsToInsert.map(p => p.id);
    const { data: existing } = await supabase
      .from('external_products')
      .select('id')
      .in('id', existingIds);

    const existingIdSet = new Set(existing?.map(p => p.id) || []);
    const newProducts = productsToInsert.filter(p => !existingIdSet.has(p.id));
    const updateProducts = productsToInsert.filter(p => existingIdSet.has(p.id));

    // 新規商品を挿入
    if (newProducts.length > 0) {
      const { error: insertError } = await supabase
        .from('external_products')
        .insert(newProducts);

      if (insertError) {
        console.error('❌ 挿入エラー:', insertError);
      } else {
        console.log(`✅ ${newProducts.length}件の新規商品を追加`);
      }
    }

    // 既存商品を更新
    if (updateProducts.length > 0) {
      for (const product of updateProducts) {
        const { error: updateError } = await supabase
          .from('external_products')
          .update({
            title: product.title,
            price: product.price,
            is_active: true,
            last_synced: product.last_synced
          })
          .eq('id', product.id);

        if (updateError) {
          console.error(`❌ 更新エラー (${product.id}):`, updateError);
        }
      }
      console.log(`✅ ${updateProducts.length}件の既存商品を更新`);
    }

  } catch (error) {
    console.error('❌ 保存エラー:', error);
  }
}

// 高精度タグ抽出モジュールをインポート
const { extractEnhancedTags } = require('./enhanced-tag-extractor');

/**
 * 商品からタグを抽出（高精度版）
 */
function extractTags(product) {
  return extractEnhancedTags(product);
}

/**
 * メイン処理
 */
async function main() {
  console.log('\n🚀 楽天商品同期を開始します...\n');

  try {
    // 複数ページから商品を取得
    const pages = 3; // 3ページ分取得
    const itemsPerPage = 30;
    let allProducts = [];

    for (let page = 1; page <= pages; page++) {
      console.log(`\n📄 ページ ${page}/${pages} を取得中...`);
      
      const data = await fetchRakutenProducts('100371', page, itemsPerPage);
      
      if (data.Items && data.Items.length > 0) {
        allProducts = allProducts.concat(data.Items);
        console.log(`✅ ${data.Items.length}件の商品を取得`);
        
        // レート制限対策
        if (page < pages) {
          console.log('⏳ 2秒待機中...');
          await sleep(2000);
        }
      }
    }

    console.log(`\n📊 合計 ${allProducts.length}件の商品を取得しました`);

    // 商品をSupabaseに保存
    await saveProducts(allProducts);

    // 最終確認
    const { count } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true });

    console.log(`\n✅ 同期完了！ 現在の商品数: ${count}件`);

  } catch (error) {
    console.error('\n❌ エラーが発生しました:', error);
    process.exit(1);
  }
}

// 実行
main().then(() => {
  console.log('\n✨ すべての処理が完了しました');
  process.exit(0);
}).catch((error) => {
  console.error('\n❌ 予期しないエラー:', error);
  process.exit(1);
});

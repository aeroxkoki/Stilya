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
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Supabaseクライアントの作成（EXPO_PUBLIC_プレフィックス付きの環境変数を使用）
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
// 楽天API設定 - EXPO_PUBLIC_プレフィックス付きの環境変数を使用
const rakutenAppId = process.env.EXPO_PUBLIC_RAKUTEN_APP_ID || process.env.RAKUTEN_APP_ID;
const rakutenAffiliateId = process.env.EXPO_PUBLIC_RAKUTEN_AFFILIATE_ID || process.env.RAKUTEN_AFFILIATE_ID;

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
    format: 'json',
    imageFlag: '1', // 画像ありのみ
    sort: '+updateTimestamp', // 新着順
    // 画像サイズを指定して高画質画像を要求
    elements: 'itemName,itemPrice,itemCode,itemUrl,shopName,shopUrl,affiliateUrl,mediumImageUrls,imageUrl,smallImageUrls,itemCaption,genreId',
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
 * 楽天APIの画像URLを取得（rakutenService.tsと同じロジック）
 */
function getImageUrl(product) {
  // 優先順位: mediumImageUrls > imageUrl > smallImageUrls
  
  // 1. mediumImageUrlsがある場合は最初のURLを使用（通常300x300程度）
  if (product.mediumImageUrls && product.mediumImageUrls.length > 0) {
    const mediumUrl = product.mediumImageUrls[0];
    // オブジェクト形式の場合と文字列形式の場合に対応
    if (typeof mediumUrl === 'string') {
      return mediumUrl;
    } else if (mediumUrl.imageUrl) {
      return mediumUrl.imageUrl;
    }
  }
  
  // 2. imageUrlがある場合（通常128x128）
  if (product.imageUrl) {
    return product.imageUrl;
  }
  
  // 3. smallImageUrlsがある場合（通常64x64）
  if (product.smallImageUrls && product.smallImageUrls.length > 0) {
    const smallUrl = product.smallImageUrls[0];
    if (typeof smallUrl === 'string') {
      return smallUrl;
    } else if (smallUrl.imageUrl) {
      return smallUrl.imageUrl;
    }
  }
  
  // 画像が見つからない場合
  return '';
}

/**
 * 商品データをSupabaseに保存
 */
async function saveProducts(products) {
  console.log(`\n📦 ${products.length}件の商品を保存中...`);
  
  const productsToInsert = products.map(item => {
    const product = item.Item;
    const imageUrl = getImageUrl(product);
    
    // 画像URLが無効な商品はスキップ
    if (!imageUrl || imageUrl.trim() === '') {
      console.log(`⚠️ 画像URLが無効: ${product.itemName}`);
      return null;
    }
    
    // タグを抽出
    const tags = extractTags(product);
    // カテゴリを決定（genreIdベース）
    const category = product.genreId === '551177' ? 'メンズファッション' : '女性ファッション';
    
    // スタイルタグを判定
    const styleTag = determineProductStyleAdvanced(tags, category);
    
    return {
      id: product.itemCode,
      title: product.itemName,
      image_url: imageUrl,
      brand: product.shopName,
      price: product.itemPrice,
      tags: tags,
      style_tags: [styleTag], // 適切なスタイルタグを設定
      category: category,
      affiliate_url: product.affiliateUrl || product.itemUrl,
      source: 'rakuten',
      is_active: true,
      last_synced: new Date().toISOString()
    };
  }).filter(p => p !== null); // 無効な商品を除外

  console.log(`\n📸 有効な画像URLを持つ商品: ${productsToInsert.length}件`);

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

    // 既存商品を更新（画像URLとstyle_tagsも更新）
    if (updateProducts.length > 0) {
      for (const product of updateProducts) {
        const { error: updateError } = await supabase
          .from('external_products')
          .update({
            title: product.title,
            price: product.price,
            image_url: product.image_url, // 画像URLも更新
            style_tags: product.style_tags, // スタイルタグも更新
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
// タグマッピングユーティリティをインポート
const { determineProductStyleAdvanced } = require('../utils/tag-mapping-utils');

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
  console.log('🛍️ 楽天商品データ同期開始...\n');
  
  // 最初に不正なデータをクリーンアップ
  console.log('🧹 不正なデータのクリーンアップ...');
  const { error: cleanupError } = await supabase
    .from('external_products')
    .delete()
    .or('image_url.is.null,image_url.eq.')
    .eq('source', 'rakuten');
  
  if (!cleanupError) {
    console.log('✅ 不正なデータをクリーンアップしました');
  }

  const genreIds = {
    'レディースファッション': '100371',
    'メンズファッション': '551177',
  };

  for (const [genreName, genreId] of Object.entries(genreIds)) {
    console.log(`\n📂 ${genreName}の商品を取得中...`);
    
    try {
      // 3ページ分取得（1ページ30件 × 3 = 90件）
      for (let page = 1; page <= 3; page++) {
        console.log(`  ページ ${page}/3 を処理中...`);
        
        const data = await fetchRakutenProducts(genreId, page, 30);
        
        if (data.Items && data.Items.length > 0) {
          await saveProducts(data.Items);
        } else {
          console.log('  商品が見つかりませんでした');
        }
        
        // レート制限対策
        await sleep(1000);
      }
    } catch (error) {
      console.error(`❌ ${genreName}の処理でエラー:`, error.message);
    }
  }

  console.log('\n✅ 同期完了！');
}

// エラーハンドリング
process.on('unhandledRejection', (error) => {
  console.error('未処理のエラー:', error);
  process.exit(1);
});

// スクリプト実行
if (require.main === module) {
  main();
}

// エクスポート
module.exports = { main };

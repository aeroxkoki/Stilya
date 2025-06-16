#!/usr/bin/env node
/**
 * 楽天APIからの商品データ同期バッチ処理
 * 
 * このスクリプトは以下の処理を行います：
 * 1. 楽天APIから商品データを取得
 * 2. 取得したデータを加工して、Supabaseのexternal_productsテーブルに保存
 * 3. 古いデータを非アクティブ化
 * 
 * 使用方法：
 * - 開発環境：`npm run sync-products`
 * - 本番環境：GitHub Actionsで定期実行
 */

const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

// 環境変数の読み込み
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Supabaseクライアントの作成
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('環境変数が設定されていません: SUPABASE_URL, SUPABASE_SERVICE_KEY');
  process.exit(1);
}

console.log('Supabase URL:', supabaseUrl);
console.log('Using service key:', supabaseKey.startsWith('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkeXBncGxqcHJsanFyYmxwdWxpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSI') ? 'Yes' : 'No');

const supabase = createClient(supabaseUrl, supabaseKey);

// 楽天API設定
const RAKUTEN_APP_ID = process.env.RAKUTEN_APP_ID;
const RAKUTEN_AFFILIATE_ID = process.env.RAKUTEN_AFFILIATE_ID;

if (!RAKUTEN_APP_ID || !RAKUTEN_AFFILIATE_ID) {
  console.error('環境変数が設定されていません: RAKUTEN_APP_ID, RAKUTEN_AFFILIATE_ID');
  process.exit(1);
}

// レート制限対策
const RATE_LIMIT_DELAY = 2000; // 2秒の遅延（より安全なマージンを取る）
const MAX_RETRIES = 3;
const RETRY_DELAY = 10000; // 10秒

// 遅延処理
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// カテゴリ設定（楽天APIの正しいジャンルIDに修正）
const CATEGORIES = [
  { genreId: 100371, name: 'レディースファッション' },
  { genreId: 551177, name: 'メンズファッション' },
  { genreId: 216129, name: 'レディースバッグ・小物・ブランド雑貨' },
  { genreId: 558885, name: 'メンズバッグ・小物・ブランド雑貨' },
  { genreId: 558885, name: '靴' },  // 靴は男女共通カテゴリ
  { genreId: 216131, name: 'ジュエリー・アクセサリー' },
];

/**
 * 楽天APIから商品を取得
 */
async function fetchRakutenProducts(
  genreId,
  page = 1,
  hits = 30,
  retryCount = 0
) {
  try {
    const params = {
      applicationId: RAKUTEN_APP_ID,
      affiliateId: RAKUTEN_AFFILIATE_ID,
      genreId: genreId.toString(),
      hits,
      page,
      format: 'json',
      sort: '-updateTimestamp', // 更新日時の新しい順
    };

    console.log(`楽天API呼び出し: ジャンル${genreId}, ページ${page}`);
    
    const response = await axios.get(
      'https://app.rakuten.co.jp/services/api/IchibaItem/Search/20170706',
      { params }
    );

    const { Items } = response.data;
    
    if (!Items || Items.length === 0) {
      return [];
    }

    return Items.map((item) => item.Item);
  } catch (error) {
    if (error.response?.status === 429 && retryCount < MAX_RETRIES) {
      console.log(`レート制限に達しました。${RETRY_DELAY / 1000}秒後にリトライします... (${retryCount + 1}/${MAX_RETRIES})`);
      await sleep(RETRY_DELAY);
      return fetchRakutenProducts(genreId, page, hits, retryCount + 1);
    }
    
    console.error(`楽天API エラー (ジャンル${genreId}):`, error.message);
    throw error;
  }
}

/**
 * タグを抽出
 */
function extractTags(product) {
  const tags = [];
  
  // ジャンルベースのタグ
  const genreId = parseInt(product.genreId);
  if (genreId === 100371 || genreId === 216129) {
    tags.push('レディース');
  }
  if (genreId === 551177 || genreId === 558885) {
    tags.push('メンズ');
  }
  
  // 商品名からタグを抽出
  const itemName = product.itemName;
  const tagKeywords = {
    'シャツ': 'シャツ',
    'ブラウス': 'ブラウス',
    'Tシャツ': 'Tシャツ',
    'カットソー': 'カットソー',
    'ワンピース': 'ワンピース',
    'スカート': 'スカート',
    'パンツ': 'パンツ',
    'デニム': 'デニム',
    'ジーンズ': 'ジーンズ',
    'ジャケット': 'ジャケット',
    'コート': 'コート',
    'セーター': 'セーター',
    'ニット': 'ニット',
    'バッグ': 'バッグ',
    '靴': '靴',
    'スニーカー': 'スニーカー',
    'ブーツ': 'ブーツ',
    'パンプス': 'パンプス',
    'サンダル': 'サンダル',
    'アクセサリー': 'アクセサリー',
    'ネックレス': 'ネックレス',
    'リング': 'リング',
    'ピアス': 'ピアス',
    'イヤリング': 'イヤリング',
    '春': '春',
    '夏': '夏',
    '秋': '秋',
    '冬': '冬',
    'カジュアル': 'カジュアル',
    'フォーマル': 'フォーマル',
    'オフィス': 'オフィス',
    'デート': 'デート',
  };
  
  Object.entries(tagKeywords).forEach(([keyword, tag]) => {
    if (itemName.includes(keyword) && !tags.includes(tag)) {
      tags.push(tag);
    }
  });
  
  // 価格帯のタグ
  const price = product.itemPrice;
  if (price < 3000) {
    tags.push('プチプラ');
  } else if (price >= 10000) {
    tags.push('ハイプライス');
  }
  
  return [...new Set(tags)]; // 重複を削除
}

/**
 * 楽天商品をアプリの形式に変換
 */
function normalizeProduct(product, category) {
  return {
    id: product.itemCode,
    title: product.itemName,
    price: product.itemPrice,
    brand: product.shopName,
    image_url: product.mediumImageUrls[0]?.imageUrl.replace('?_ex=128x128', '?_ex=500x500') || '',
    description: product.itemCaption || '',
    tags: extractTags(product),
    category: category,
    genre_id: parseInt(product.genreId),
    affiliate_url: product.affiliateUrl,
    source: 'rakuten',
    is_active: true,
    last_synced: new Date().toISOString(),
  };
}

/**
 * Supabaseに商品を保存
 */
async function saveProductsToSupabase(products) {
  try {
    if (products.length === 0) return 0;

    // バッチサイズを設定（一度に保存する商品数）
    const batchSize = 100;
    let savedCount = 0;

    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      
      // デバッグ: 最初の商品データを確認
      if (i === 0 && batch.length > 0) {
        console.log('デバッグ: 保存する商品データのサンプル:');
        console.log(JSON.stringify(batch[0], null, 2));
      }
      
      const { data, error } = await supabase
        .from('external_products')
        .upsert(batch, {
          onConflict: 'id',
          ignoreDuplicates: false,
        })
        .select();  // 追加: .select()を明示的に呼び出す

      if (error) {
        console.error('Supabase保存エラー:');
        console.error('  Code:', error.code);
        console.error('  Message:', error.message);
        console.error('  Details:', error.details);
        console.error('  Hint:', error.hint);
        console.error('  Full error:', JSON.stringify(error, null, 2));
        continue;
      }

      // デバッグ: 返されたデータを確認
      if (i === 0) {
        console.log('Upsert response data:', data ? `${data.length} items` : 'null');
      }

      savedCount += batch.length;
      console.log(`${savedCount}/${products.length}件保存完了`);
    }

    return savedCount;
  } catch (error) {
    console.error('商品保存エラー:', error);
    return 0;
  }
}

/**
 * 古い商品を非アクティブ化
 */
async function deactivateOldProducts(daysOld = 7) {
  try {
    const date = new Date();
    date.setDate(date.getDate() - daysOld);
    const dateString = date.toISOString();

    const { data, error } = await supabase
      .from('external_products')
      .update({ is_active: false })
      .lt('last_synced', dateString)
      .eq('is_active', true);

    if (error) {
      console.error('古いデータの非アクティブ化エラー:', JSON.stringify(error, null, 2));
      return 0;
    }

    return data?.length || 0;
  } catch (error) {
    console.error('非アクティブ化エラー:', error);
    return 0;
  }
}

/**
 * メイン処理
 */
async function main() {
  console.log('=== 楽天API商品同期開始 ===');
  console.log(`実行時刻: ${new Date().toLocaleString('ja-JP')}`);
  
  try {
    let totalProducts = 0;
    let totalSaved = 0;

    // カテゴリごとに商品を取得
    for (const category of CATEGORIES) {
      console.log(`\n【${category.name}】の取得開始`);
      
      const allProducts = [];
      const maxPages = 3; // 各カテゴリ最大3ページ（90商品）まで
      
      for (let page = 1; page <= maxPages; page++) {
        try {
          // レート制限対策のため遅延
          if (page > 1) {
            await sleep(RATE_LIMIT_DELAY);
          }
          
          const products = await fetchRakutenProducts(category.genreId, page);
          
          if (products.length === 0) {
            console.log(`ページ${page}: 商品なし`);
            break;
          }
          
          const normalizedProducts = products.map(p => 
            normalizeProduct(p, category.name)
          );
          
          allProducts.push(...normalizedProducts);
          console.log(`ページ${page}: ${products.length}件取得`);
        } catch (error) {
          console.error(`ページ${page}の取得エラー:`, error);
          continue;
        }
      }
      
      // カテゴリの商品を保存
      if (allProducts.length > 0) {
        const saved = await saveProductsToSupabase(allProducts);
        totalProducts += allProducts.length;
        totalSaved += saved;
        console.log(`【${category.name}】完了: ${allProducts.length}件中${saved}件保存`);
      }
      
      // カテゴリ間の遅延
      await sleep(RATE_LIMIT_DELAY);
    }
    
    // 古いデータの非アクティブ化
    console.log('\n古いデータの非アクティブ化...');
    const deactivated = await deactivateOldProducts(7);
    console.log(`${deactivated}件を非アクティブ化しました`);
    
    console.log('\n=== 同期完了 ===');
    console.log(`取得商品数: ${totalProducts}`);
    console.log(`保存商品数: ${totalSaved}`);
    console.log(`非アクティブ化: ${deactivated}`);
    
  } catch (error) {
    console.error('同期処理エラー:', error);
    process.exit(1);
  }
}

// スクリプト実行
if (require.main === module) {
  main().then(() => {
    console.log('\n処理が完了しました');
    process.exit(0);
  }).catch((error) => {
    console.error('エラーが発生しました:', error);
    process.exit(1);
  });
}

module.exports = { syncRakutenProducts: main };

/**
 * 商品データ同期バッチ処理
 * 
 * このスクリプトは以下の処理を行います：
 * 1. LinkShareやA8.netなどのアフィリエイトAPIから商品データを取得
 * 2. 取得したデータを加工して、Supabaseのproductsテーブルに保存
 * 3. 一定期間で古くなったデータを削除
 * 
 * 使用方法：
 * - 開発環境：`npm run sync-products`
 * - 本番環境：Supabase Edge Functionsとして登録し、定期実行するスケジューラを設定
 */

import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import dotenv from 'dotenv';

// 環境変数の読み込み
dotenv.config();

// Supabaseクライアントの作成
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('環境変数が設定されていません: SUPABASE_URL, SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// LinkShare API設定
const linkShareApiKey = process.env.LINKSHARE_API_KEY;
const linkShareMerchantId = process.env.LINKSHARE_MERCHANT_ID;

if (!linkShareApiKey || !linkShareMerchantId) {
  console.error('環境変数が設定されていません: LINKSHARE_API_KEY, LINKSHARE_MERCHANT_ID');
  process.exit(1);
}

/**
 * LinkShare APIから商品データを取得
 */
async function fetchProductsFromLinkShare(
  keyword: string,
  limit: number = 20,
  category: string = ''
) {
  try {
    const url = 'https://api.linksynergy.com/v1/search/products';
    const params = {
      keyword,
      cat: category,
      max: limit,
      merchandiseId: linkShareMerchantId,
      apiKey: linkShareApiKey,
    };

    const response = await axios.get(url, { params });
    return response.data.products || [];
  } catch (error) {
    console.error('LinkShare APIエラー:', error);
    return [];
  }
}

/**
 * 商品データを正規化して保存用フォーマットに変換
 */
function normalizeProduct(product: any, source: string) {
  // タグの抽出（カテゴリから一部を抽出）
  const extractedTags = [];
  if (product.category) {
    // カテゴリをタグに変換
    const categoryParts = product.category.split(' > ');
    extractedTags.push(...categoryParts);
  }
  
  // ブランド名を追加
  if (product.brand) {
    extractedTags.push(product.brand);
  }

  // 性別タグの抽出
  if (product.keywords) {
    if (product.keywords.includes('mens') || product.keywords.includes('男性')) {
      extractedTags.push('メンズ');
    }
    if (product.keywords.includes('womens') || product.keywords.includes('女性')) {
      extractedTags.push('レディース');
    }
  }

  // 重複を削除
  const uniqueTags = [...new Set(extractedTags)];

  return {
    title: product.productName || 'Untitled',
    brand: product.brand || '',
    price: parseFloat(product.price) || 0,
    image_url: product.imageUrl || '',
    description: product.description || '',
    tags: uniqueTags,
    category: product.category?.split(' > ')[0] || '',
    affiliate_url: product.productUrl || '',
    source: source,
    created_at: new Date().toISOString(),
  };
}

/**
 * 商品データをSupabaseに保存
 */
async function saveProductsToSupabase(products: any[]) {
  try {
    const { data, error } = await supabase
      .from('products')
      .upsert(products, { onConflict: 'affiliate_url' });

    if (error) {
      console.error('Supabase保存エラー:', error);
      return false;
    }

    console.log(`${products.length}件の商品が保存されました`);
    return true;
  } catch (error) {
    console.error('Supabase保存エラー:', error);
    return false;
  }
}

/**
 * 古い商品データを削除
 */
async function deleteOldProducts(daysOld: number = 30) {
  try {
    const date = new Date();
    date.setDate(date.getDate() - daysOld);
    const dateString = date.toISOString();

    const { data, error } = await supabase
      .from('products')
      .delete()
      .lt('created_at', dateString);

    if (error) {
      console.error('古いデータの削除エラー:', error);
      return false;
    }

    console.log(`${daysOld}日より古い商品が削除されました`);
    return true;
  } catch (error) {
    console.error('古いデータの削除エラー:', error);
    return false;
  }
}

/**
 * メイン処理
 */
async function main() {
  try {
    console.log('商品データ同期を開始します...');

    // ファッションカテゴリからデータを取得
    const mensFashionProducts = await fetchProductsFromLinkShare('mens fashion', 50, 'クロージング');
    const womensFashionProducts = await fetchProductsFromLinkShare('womens fashion', 50, 'クロージング');
    
    // データの正規化
    const normalizedMensProducts = mensFashionProducts.map((p: any) => normalizeProduct(p, 'linkshare'));
    const normalizedWomensProducts = womensFashionProducts.map((p: any) => normalizeProduct(p, 'linkshare'));
    
    // Supabaseに保存
    const allProducts = [...normalizedMensProducts, ...normalizedWomensProducts];
    await saveProductsToSupabase(allProducts);
    
    // 30日以上前の古いデータを削除
    await deleteOldProducts(30);
    
    console.log('商品データ同期が完了しました');
  } catch (error) {
    console.error('商品データ同期エラー:', error);
  }
}

// スクリプト実行
main().catch(console.error);

// Supabase Edge Functionsでの実行用エクスポート
export const syncProducts = main;

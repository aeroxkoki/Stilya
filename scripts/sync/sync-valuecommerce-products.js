#!/usr/bin/env node
/**
 * バリューコマースAPIから商品データを取得して、Supabaseに保存するスクリプト
 * 注意: 現在は実装のみで、実際の同期は無効化されています
 */

const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

// 環境変数の読み込み
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Supabaseクライアントの作成
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const vcToken = process.env.VALUECOMMERCE_TOKEN;
const vcEnabled = process.env.VALUECOMMERCE_ENABLED === 'true';

// バリューコマースAPIが有効かチェック
if (!vcEnabled) {
  console.log('⚠️ バリューコマースAPIは無効になっています。');
  console.log('有効にするには、.envファイルで VALUECOMMERCE_ENABLED=true を設定してください。');
  console.log('現在の設定: VALUECOMMERCE_ENABLED =', process.env.VALUECOMMERCE_ENABLED || '未設定');
  process.exit(0);
}

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase環境変数が設定されていません');
  console.error('必要な環境変数:');
  console.error('- EXPO_PUBLIC_SUPABASE_URL または SUPABASE_URL');
  console.error('- EXPO_PUBLIC_SUPABASE_ANON_KEY または SUPABASE_ANON_KEY');
  console.error('現在の状態:');
  console.error('- SUPABASE_URL:', process.env.SUPABASE_URL ? '設定済み' : '未設定');
  console.error('- EXPO_PUBLIC_SUPABASE_URL:', process.env.EXPO_PUBLIC_SUPABASE_URL ? '設定済み' : '未設定');
  process.exit(1);
}

if (!vcToken) {
  console.error('❌ バリューコマースAPI環境変数が設定されていません');
  console.error('必要な環境変数: VALUECOMMERCE_TOKEN');
  process.exit(1);
}

console.log('✅ 環境変数の確認');
console.log(`- Supabase URL: ${supabaseUrl}`);
console.log(`- Supabase Key: ${supabaseKey.substring(0, 20)}...`);
console.log(`- ValueCommerce Token: ${vcToken.substring(0, 20)}...`);

const supabase = createClient(supabaseUrl, supabaseKey);

// レート制限対策
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * バリューコマースAPIから商品データを取得
 */
async function fetchValueCommerceProducts(keyword = 'ファッション', page = 1, hits = 50) {
  const url = 'https://api.valuecommerce.com/ps/api/search';
  const params = {
    token: vcToken,
    keyword: keyword,
    output: 'json',
    results: hits,
    page: page,
    sortOrder: 'desc', // 新着順
    sortBy: 'date',
  };

  try {
    const response = await axios.get(url, { params });
    return response.data;
  } catch (error) {
    console.error('ValueCommerce API エラー:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * 商品からタグを抽出
 */
function extractTags(product) {
  const tags = [];
  const title = (product.title || '').toLowerCase();
  const description = (product.description || '').toLowerCase();
  const category = (product.vc?.category || '').toLowerCase();
  
  // カテゴリベースのタグ
  if (category.includes('レディース')) tags.push('レディース');
  if (category.includes('メンズ')) tags.push('メンズ');
  
  // 商品タイプのタグ
  const productTypes = {
    'ワンピース': ['ワンピース', 'ドレス'],
    'トップス': ['トップス', 'シャツ', 'ブラウス', 'tシャツ', 't-shirt'],
    'パンツ': ['パンツ', 'ズボン', 'スラックス'],
    'スカート': ['スカート'],
    'アウター': ['アウター', 'コート', 'ジャケット'],
    'バッグ': ['バッグ', '鞄', 'かばん'],
    'シューズ': ['シューズ', '靴', 'スニーカー', 'パンプス', 'ブーツ'],
    'アクセサリー': ['アクセサリー', 'ネックレス', 'ピアス', 'イヤリング'],
  };
  
  for (const [tag, keywords] of Object.entries(productTypes)) {
    if (keywords.some(keyword => title.includes(keyword) || description.includes(keyword))) {
      tags.push(tag);
    }
  }
  
  // スタイルタグ
  const styleTypes = {
    'カジュアル': ['カジュアル', 'casual', 'ラフ'],
    'フォーマル': ['フォーマル', 'formal', 'ビジネス', 'オフィス'],
    'ストリート': ['ストリート', 'street', 'ヒップホップ'],
    'フェミニン': ['フェミニン', 'feminine', 'ガーリー', '可愛い'],
    'モード': ['モード', 'mode', 'モダン'],
    'ナチュラル': ['ナチュラル', 'natural', 'シンプル'],
  };
  
  for (const [tag, keywords] of Object.entries(styleTypes)) {
    if (keywords.some(keyword => title.includes(keyword) || description.includes(keyword))) {
      tags.push(tag);
    }
  }
  
  // 重複を除去
  return [...new Set(tags)];
}

/**
 * 商品データをSupabaseに保存
 */
async function saveProducts(products) {
  console.log(`\n📦 ${products.length}件の商品を保存中...`);
  
  const productsToInsert = products.map(item => {
    // adタグを抽出
    const adTag = item.vc?.pvImg || '';
    
    // 画像URLが無効な商品はスキップ
    const imageUrl = item.vc?.imageUrl || '';
    if (!imageUrl || imageUrl.trim() === '') {
      console.log(`⚠️ 画像URLが無効: ${item.title}`);
      return null;
    }
    
    return {
      id: `vc_${item.guid || Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: item.title,
      image_url: imageUrl,
      brand: item.vc?.merchantName || 'ブランド不明',
      price: parseInt(item.vc?.price || '0'),
      tags: extractTags(item),
      category: item.vc?.category || 'その他',
      affiliate_url: item.link || '',
      source: 'valuecommerce',
      is_active: true,
      last_synced: new Date().toISOString(),
      // adタグをmetadataに保存
      metadata: {
        ad_tag: adTag,
        merchant_id: item.vc?.merchantId || '',
        original_id: item.guid || ''
      }
    };
  }).filter(p => p !== null);

  console.log(`\n📸 有効な画像URLを持つ商品: ${productsToInsert.length}件`);

  if (productsToInsert.length === 0) {
    console.log('保存する商品がありません。');
    return;
  }

  try {
    // バッチ処理で挿入（50件ずつ）
    const batchSize = 50;
    for (let i = 0; i < productsToInsert.length; i += batchSize) {
      const batch = productsToInsert.slice(i, i + batchSize);
      
      const { error } = await supabase
        .from('external_products')
        .upsert(batch, { onConflict: 'id' });

      if (error) {
        console.error(`❌ バッチ ${Math.floor(i / batchSize) + 1} の保存エラー:`, error);
      } else {
        console.log(`✅ ${batch.length}件の商品を保存しました`);
      }
      
      // レート制限対策
      await sleep(500);
    }

  } catch (error) {
    console.error('❌ 保存エラー:', error);
  }
}

/**
 * メイン処理
 */
async function main() {
  console.log('🛍️ バリューコマース商品データ同期開始...\n');
  console.log('⚠️ 注意: この機能は現在テスト実装です。\n');

  const keywords = [
    'レディースファッション',
    'メンズファッション',
    'ワンピース',
    'トップス',
    'パンツ',
    'スカート',
  ];

  for (const keyword of keywords) {
    console.log(`\n🔍 「${keyword}」の商品を取得中...`);
    
    try {
      // 2ページ分取得（1ページ50件 × 2 = 100件）
      for (let page = 1; page <= 2; page++) {
        console.log(`  ページ ${page}/2 を処理中...`);
        
        const data = await fetchValueCommerceProducts(keyword, page, 50);
        
        if (data.items && data.items.length > 0) {
          await saveProducts(data.items);
        } else {
          console.log('  商品が見つかりませんでした');
        }
        
        // レート制限対策
        await sleep(1000);
      }
    } catch (error) {
      console.error(`❌ ${keyword}の処理でエラー:`, error.message);
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

module.exports = { fetchValueCommerceProducts, saveProducts };

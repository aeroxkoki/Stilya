#!/usr/bin/env node
/**
 * GitHub Actions専用: 楽天APIから商品データを取得してSupabaseに保存
 * 環境変数から認証情報を取得し、service roleキーを使用可能にする
 */

const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

// enhanced-tag-extractorモジュールの安全な読み込み
let extractEnhancedTags;
try {
  const path = require('path');
  const tagExtractorPath = path.join(__dirname, 'enhanced-tag-extractor.js');
  const tagExtractor = require(tagExtractorPath);
  extractEnhancedTags = tagExtractor.extractEnhancedTags;
  console.log('✅ 高精度タグ抽出モジュールを読み込みました');
} catch (error) {
  console.warn('⚠️ 高精度タグ抽出モジュールが見つかりません。基本的なタグ抽出を使用します。');
  console.warn('エラー詳細:', error.message);
  
  // フォールバック: 基本的なタグ抽出
  extractEnhancedTags = function(product) {
    const tags = [];
    const itemName = product.itemName || '';
    const keywords = {
      'ワンピース': 'ワンピース',
      'シャツ': 'シャツ',
      'ブラウス': 'ブラウス',
      'スカート': 'スカート',
      'パンツ': 'パンツ',
      'ジャケット': 'ジャケット',
      'コート': 'コート',
      'ニット': 'ニット',
      'カーディガン': 'カーディガン',
      'Tシャツ': 'Tシャツ',
      'デニム': 'デニム',
      'カジュアル': 'カジュアル',
      'フォーマル': 'フォーマル',
      'オフィス': 'オフィス'
    };

    Object.entries(keywords).forEach(([key, tag]) => {
      if (itemName.includes(key)) {
        tags.push(tag);
      }
    });

    tags.push('レディース');
    return [...new Set(tags)];
  };
}

// 環境変数から直接取得（GitHub Secretsから）
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const rakutenAppId = process.env.RAKUTEN_APP_ID || '1070253780037975195';
const rakutenAffiliateId = process.env.RAKUTEN_AFFILIATE_ID || '3ad7bc23.8866b306.3ad7bc24.393c3977';

console.log('=== 楽天商品同期 (GitHub Actions) ===');
console.log(`環境: ${process.env.NODE_ENV || 'development'}`);
console.log(`Supabase URL: ${supabaseUrl}`);
console.log(`使用キータイプ: ${process.env.SUPABASE_SERVICE_KEY ? 'Service Role' : 'Anon Key'}`);
console.log(`楽天 App ID: ${rakutenAppId ? '設定済み' : '未設定'}`);

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 必須の環境変数が設定されていません');
  console.error('必要な環境変数:');
  console.error('- EXPO_PUBLIC_SUPABASE_URL または SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_KEY または EXPO_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

if (!rakutenAppId || !rakutenAffiliateId) {
  console.error('❌ 楽天API認証情報が設定されていません');
  process.exit(1);
}

// Supabaseクライアントの初期化
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

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
    imageFlag: 1  // 画像ありの商品のみ
  };

  try {
    console.log(`📡 楽天APIから商品を取得中... (page: ${page})`);
    const response = await axios.get(url, { params });
    return response.data;
  } catch (error) {
    if (error.response?.status === 429) {
      console.log('⏳ レート制限に達しました。5秒待機します...');
      await sleep(5000);
      return fetchRakutenProducts(genreId, page, hits);
    }
    console.error('楽天API エラー:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * 商品データをSupabaseに保存（RLSを考慮）
 */
async function saveProducts(products) {
  console.log(`\\n📦 ${products.length}件の商品を保存中...`);
  
  const productsToInsert = products.map(item => {
    const product = item.Item;
    // 高画質画像を優先的に使用（largeImageUrls → mediumImageUrls → smallImageUrls）
    const imageUrl = product.largeImageUrls?.[0]?.imageUrl || 
                     product.mediumImageUrls?.[0]?.imageUrl || 
                     product.smallImageUrls?.[0]?.imageUrl || '';
    
    return {
      id: product.itemCode,
      title: product.itemName,
      image_url: imageUrl,
      brand: product.shopName,
      price: product.itemPrice,
      tags: extractTags(product),
      category: product.categoryId || '100371',
      affiliate_url: product.affiliateUrl || product.itemUrl,
      source: 'rakuten',
      is_active: true,
      last_synced: new Date().toISOString()
    };
  });

  try {
    // service roleキーを使用している場合はRLSをバイパスできる
    const isServiceRole = process.env.SUPABASE_SERVICE_KEY ? true : false;
    
    if (isServiceRole) {
      console.log('✅ Service Roleキーを使用してRLSをバイパス');
    } else {
      console.log('⚠️  Anon Keyを使用 - RLSポリシーに従います');
      console.log('ℹ️  書き込み権限がない場合はエラーになる可能性があります');
    }

    // バッチで挿入（upsertを使用して重複を防ぐ）
    const batchSize = 50;
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < productsToInsert.length; i += batchSize) {
      const batch = productsToInsert.slice(i, i + batchSize);
      
      const { error } = await supabase
        .from('external_products')
        .upsert(batch, { onConflict: 'id' });

      if (error) {
        errorCount += batch.length;
        console.error(`❌ バッチ ${Math.floor(i/batchSize) + 1} エラー:`, error.message);
        if (error.message.includes('row-level security')) {
          console.error('⚠️  RLSポリシーエラー: SUPABASE_SERVICE_KEYが必要です');
          throw error;
        }
      } else {
        successCount += batch.length;
        console.log(`✅ バッチ ${Math.floor(i/batchSize) + 1}/${Math.ceil(productsToInsert.length/batchSize)} 完了`);
      }
    }
    
    console.log(`\\n📊 保存結果: 成功 ${successCount}件 / エラー ${errorCount}件`);

  } catch (error) {
    console.error('❌ 保存エラー:', error);
    throw error;
  }
}

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
  console.log('\\n🚀 楽天商品同期を開始します...\\n');

  try {
    // データベース容量チェック
    const { count: currentCount } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true });
    
    console.log(`📊 現在の商品数: ${currentCount}件`);
    
    // 安全な上限値の設定（5万商品）
    const SAFE_LIMIT = 50000;
    const remainingCapacity = SAFE_LIMIT - currentCount;
    
    if (remainingCapacity <= 0) {
      console.log('⚠️  商品数が上限に達しています。古い商品の削除を検討してください。');
      return;
    }

    // 動的なページ取得戦略
    const today = new Date();
    const dayOfMonth = today.getDate();
    const hourOfDay = today.getHours();
    
    // 時間帯によって異なるカテゴリを取得
    const categories = [
      { id: '100371', name: 'レディースファッション' },
      { id: '551177', name: 'メンズファッション' },
      { id: '216131', name: 'バッグ・小物・ブランド雑貨' },
      { id: '558885', name: '靴' },
      { id: '509892', name: 'アクセサリー' }
    ];
    
    // 時間帯でカテゴリを選択（朝と夕方で異なるカテゴリ）
    const categoryIndex = hourOfDay < 12 ? dayOfMonth % 3 : (dayOfMonth % 3) + 2;
    const selectedCategory = categories[categoryIndex % categories.length];
    
    console.log(`📂 選択カテゴリ: ${selectedCategory.name}`);
    
    // ページ番号を日付ベースで動的に設定
    const startPage = ((dayOfMonth - 1) * 20) % 100 + 1;
    const pagesToFetch = Math.min(
      20, // 最大20ページ（600件）
      Math.floor(remainingCapacity / 30) // 容量に応じて調整
    );
    
    console.log(`📄 取得ページ: ${startPage}〜${startPage + pagesToFetch - 1}`);
    
    const itemsPerPage = 30;
    let allProducts = [];

    for (let i = 0; i < pagesToFetch; i++) {
      const page = startPage + i;
      console.log(`\\n📄 ページ ${i + 1}/${pagesToFetch} を取得中... (API page: ${page})`);
      
      const data = await fetchRakutenProducts(selectedCategory.id, page, itemsPerPage);
      
      if (data.Items && data.Items.length > 0) {
        allProducts = allProducts.concat(data.Items);
        console.log(`✅ ${data.Items.length}件の商品を取得`);
        
        // レート制限対策
        if (i < pagesToFetch - 1) {
          console.log('⏳ 2秒待機中...');
          await sleep(2000);
        }
      }
    }

    console.log(`\\n📊 合計 ${allProducts.length}件の商品を取得しました`);

    if (process.env.DRY_RUN === 'true') {
      console.log('\\n🔍 DRY RUNモード - データベースへの保存をスキップ');
      console.log('取得した商品の例:');
      allProducts.slice(0, 3).forEach((item, i) => {
        console.log(`${i + 1}. ${item.Item.itemName} - ¥${item.Item.itemPrice}`);
      });
    } else {
      // 商品をSupabaseに保存（カテゴリ情報も保存）
      const productsWithCategory = allProducts.map(item => ({
        ...item,
        Item: {
          ...item.Item,
          categoryId: selectedCategory.id,
          categoryName: selectedCategory.name
        }
      }));
      await saveProducts(productsWithCategory);
      
      // 古い商品の自動削除（30日以上前の商品）
      if (currentCount > 30000) {
        console.log('\\n🗑️ 古い商品を削除中...');
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const { error: deleteError } = await supabase
          .from('external_products')
          .delete()
          .lt('last_synced', thirtyDaysAgo.toISOString())
          .eq('source', 'rakuten');
          
        if (!deleteError) {
          console.log('✅ 古い商品を削除しました');
        }
      }
    }

    // 最終確認
    const { count } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    console.log(`\\n✅ 同期完了！ 現在のアクティブ商品数: ${count}件`);
    console.log(`📈 使用率: ${((count / SAFE_LIMIT) * 100).toFixed(1)}%`);

  } catch (error) {
    console.error('\\n❌ エラーが発生しました:', error.message);
    
    // GitHub Actions用の詳細エラー出力
    console.error('\\n=== エラー詳細 ===');
    console.error('エラータイプ:', error.constructor.name);
    console.error('エラーメッセージ:', error.message);
    if (error.response) {
      console.error('APIレスポンス:', error.response.data);
    }
    if (error.stack) {
      console.error('\\nスタックトレース:');
      console.error(error.stack);
    }
    
    process.exit(1);
  }
}

// 実行
main().then(() => {
  console.log('\\n✨ すべての処理が完了しました');
  process.exit(0);
}).catch((error) => {
  console.error('\\n❌ 予期しないエラー:', error);
  process.exit(1);
});

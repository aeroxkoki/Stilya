#!/usr/bin/env node
/**
 * 大規模MVP商品同期スクリプト V3
 * 目標：数万件レベルの商品データを効率的に管理
 */

const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs').promises;

// 環境変数の読み込み
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Supabaseクライアントの作成
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const rakutenAppId = process.env.RAKUTEN_APP_ID;
const rakutenAffiliateId = process.env.RAKUTEN_AFFILIATE_ID;

if (!supabaseUrl || !supabaseKey || !rakutenAppId || !rakutenAffiliateId) {
  console.error('❌ 必要な環境変数が設定されていません');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 同期履歴ファイルのパス
const SYNC_HISTORY_FILE = path.join(__dirname, '..', 'data', 'sync-history-v3.json');

// 大規模対応ブランドリスト（大幅に拡張）
const MASSIVE_MVP_BRANDS = [
  // Super Priority (超大量商品): 最重要ブランド
  { 
    name: 'UNIQLO',
    shopCode: 'uniqlo',
    priority: 0,
    tags: ['ベーシック', 'シンプル', '機能的', '定番'],
    category: 'basic',
    targetAge: '20-40',
    initialProducts: 5000,     // 300 → 5000
    maxProducts: 10000,        // 2000 → 10000
    rotationDays: 2            // 2日ごとに更新
  },
  { 
    name: 'GU',
    shopCode: 'gu-official', 
    priority: 0,
    tags: ['トレンド', 'プチプラ', 'カジュアル', 'ファストファッション'],
    category: 'basic',
    targetAge: '20-30',
    initialProducts: 4000,     // 300 → 4000
    maxProducts: 8000,         // 2000 → 8000
    rotationDays: 2
  },
  {
    name: '無印良品',
    keywords: ['無印良品', 'MUJI'],
    priority: 0,
    tags: ['シンプル', 'ナチュラル', 'ベーシック', 'ミニマル'],
    category: 'basic',
    targetAge: '25-40',
    initialProducts: 3000,     // 200 → 3000
    maxProducts: 6000,         // 1000 → 6000
    rotationDays: 3
  },

  // Priority 1: 主要ファストファッション（大量商品）
  {
    name: 'ZARA',
    keywords: ['ZARA ザラ'],
    priority: 1,
    tags: ['欧州トレンド', 'モード', 'ファスト', 'トレンド'],
    category: 'fast-fashion',
    targetAge: '20-35',
    initialProducts: 2000,     // 10 → 2000
    maxProducts: 5000,         // 40 → 5000
    rotationDays: 2
  },
  {
    name: 'H&M',
    keywords: ['H&M エイチアンドエム'],
    priority: 1,
    tags: ['北欧', 'トレンド', 'カジュアル', 'サステナブル'],
    category: 'fast-fashion',
    targetAge: '20-30',
    initialProducts: 2000,     // 10 → 2000
    maxProducts: 5000,         // 40 → 5000
    rotationDays: 2
  },
  {
    name: 'GAP',
    keywords: ['GAP ギャップ'],
    priority: 1,
    tags: ['アメカジ', 'カジュアル', 'ベーシック', 'デニム'],
    category: 'fast-fashion',
    targetAge: '20-40',
    initialProducts: 1500,
    maxProducts: 4000,
    rotationDays: 3
  },
  {
    name: 'FOREVER21',
    keywords: ['FOREVER21 フォーエバー'],
    priority: 1,
    tags: ['LAカジュアル', 'トレンド', 'プチプラ', 'パーティー'],
    category: 'fast-fashion',
    targetAge: '18-25',
    initialProducts: 1500,
    maxProducts: 4000,
    rotationDays: 2
  },

  // Priority 2: 人気ECブランド（中量商品）
  { 
    name: 'coca',
    keywords: ['coca コカ'],
    priority: 2,
    tags: ['ナチュラル', 'カジュアル', 'リラックス', '大人カジュアル'],
    category: 'ec-brand',
    targetAge: '25-35',
    initialProducts: 500,      // 20 → 500
    maxProducts: 2000,         // 60 → 2000
    rotationDays: 3
  },
  { 
    name: 'pierrot',
    keywords: ['pierrot ピエロ'],
    priority: 2,
    tags: ['大人カジュアル', 'きれいめ', 'オフィス', 'プチプラ'],
    category: 'ec-brand',
    targetAge: '25-40',
    initialProducts: 500,      // 20 → 500
    maxProducts: 2000,         // 60 → 2000
    rotationDays: 3
  },
  {
    name: 'Re:EDIT',
    keywords: ['Re:EDIT リエディ'],
    priority: 2,
    tags: ['トレンド', 'モード', 'カジュアル', 'ワンマイル'],
    category: 'ec-brand',
    targetAge: '20-35',
    initialProducts: 400,      // 20 → 400
    maxProducts: 1500,         // 60 → 1500
    rotationDays: 4
  },
  {
    name: 'fifth',
    keywords: ['fifth フィフス'],
    priority: 2,
    tags: ['韓国系', 'トレンド', 'プチプラ', 'ガーリー'],
    category: 'ec-brand',
    targetAge: '20-30',
    initialProducts: 400,      // 20 → 400
    maxProducts: 1500,         // 60 → 1500
    rotationDays: 4
  },
  {
    name: 'titivate',
    keywords: ['titivate ティティベイト'],
    priority: 2,
    tags: ['きれいめ', 'オフィス', '大人カジュアル', 'ママ'],
    category: 'ec-brand',
    targetAge: '25-40',
    initialProducts: 400,      // 20 → 400
    maxProducts: 1500,         // 60 → 1500
    rotationDays: 4
  },
  {
    name: 'aquagarage',
    keywords: ['aquagarage アクアガレージ'],
    priority: 2,
    tags: ['プチプラ', 'カジュアル', 'トレンド', 'デイリー'],
    category: 'ec-brand',
    targetAge: '20-35',
    initialProducts: 300,
    maxProducts: 1200,
    rotationDays: 4
  },
  {
    name: 'Ranan',
    keywords: ['Ranan ラナン'],
    priority: 2,
    tags: ['大きいサイズ', 'カジュアル', '体型カバー', 'ゆったり'],
    category: 'ec-brand',
    targetAge: '30-50',
    initialProducts: 300,
    maxProducts: 1200,
    rotationDays: 5
  },

  // Priority 3: セレクトショップ（中量商品）
  { 
    name: 'URBAN RESEARCH',
    keywords: ['URBAN RESEARCH アーバンリサーチ'],
    priority: 3,
    tags: ['都会的', 'セレクト', 'カジュアル', 'トレンド'],
    category: 'select',
    targetAge: '25-40',
    initialProducts: 300,      // 15 → 300
    maxProducts: 1000,         // 50 → 1000
    rotationDays: 4
  },
  {
    name: 'nano・universe',
    keywords: ['nano universe ナノユニバース'],
    priority: 3,
    tags: ['トレンド', 'きれいめ', 'モード', '都会的'],
    category: 'select',
    targetAge: '20-35',
    initialProducts: 300,      // 15 → 300
    maxProducts: 1000,         // 50 → 1000
    rotationDays: 4
  },
  {
    name: 'BEAMS',
    keywords: ['BEAMS ビームス'],
    priority: 3,
    tags: ['カジュアル', 'セレクト', 'トレンド', 'アメカジ'],
    category: 'select',
    targetAge: '25-40',
    initialProducts: 300,      // 15 → 300
    maxProducts: 1000,         // 50 → 1000
    rotationDays: 4
  },
  {
    name: 'UNITED ARROWS',
    keywords: ['UNITED ARROWS ユナイテッドアローズ'],
    priority: 3,
    tags: ['きれいめ', '上品', 'オフィス', 'トラッド'],
    category: 'select',
    targetAge: '30-40',
    initialProducts: 250,      // 15 → 250
    maxProducts: 800,          // 50 → 800
    rotationDays: 5
  },
  {
    name: 'SHIPS',
    keywords: ['SHIPS シップス'],
    priority: 3,
    tags: ['トラッド', '上品', 'きれいめ', 'マリン'],
    category: 'select',
    targetAge: '30-40',
    initialProducts: 250,      // 15 → 250
    maxProducts: 800,          // 50 → 800
    rotationDays: 5
  },
  {
    name: 'JOURNAL STANDARD',
    keywords: ['JOURNAL STANDARD ジャーナルスタンダード'],
    priority: 3,
    tags: ['カジュアル', 'ナチュラル', 'ヴィンテージ', 'リラックス'],
    category: 'select',
    targetAge: '25-40',
    initialProducts: 200,
    maxProducts: 700,
    rotationDays: 5
  },

  // 追加ブランド（様々なテイスト）
  {
    name: 'DHOLIC',
    keywords: ['DHOLIC ディーホリック'],
    priority: 2,
    tags: ['韓国', 'トレンド', 'フェミニン', 'プチプラ'],
    category: 'korean',
    targetAge: '20-30',
    initialProducts: 500,
    maxProducts: 2000,
    rotationDays: 3
  },
  {
    name: '17kg',
    keywords: ['17kg イチナナキログラム'],
    priority: 2,
    tags: ['韓国', 'ガーリー', 'トレンド', 'カワイイ'],
    category: 'korean',
    targetAge: '18-25',
    initialProducts: 400,
    maxProducts: 1500,
    rotationDays: 3
  },
  {
    name: 'SHOPLIST',
    keywords: ['SHOPLIST ショップリスト'],
    priority: 2,
    tags: ['総合', 'プチプラ', 'トレンド', 'バラエティ'],
    category: 'marketplace',
    targetAge: '20-35',
    initialProducts: 800,
    maxProducts: 3000,
    rotationDays: 2
  },
  {
    name: 'SHEIN',
    keywords: ['SHEIN シーイン'],
    priority: 1,
    tags: ['超プチプラ', 'トレンド', '中国発', 'ファスト'],
    category: 'ultra-fast',
    targetAge: '15-25',
    initialProducts: 2000,
    maxProducts: 8000,
    rotationDays: 1
  },
  
  // その他の既存ブランド（数量調整）
  {
    name: 'LOWRYS FARM',
    keywords: ['LOWRYS FARM ローリーズファーム'],
    priority: 4,
    tags: ['ガーリー', 'カジュアル', 'フェミニン', 'ナチュラル'],
    category: 'lifestyle',
    targetAge: '20-30',
    initialProducts: 200,      // 15 → 200
    maxProducts: 800,          // 40 → 800
    rotationDays: 5
  },
  {
    name: 'GLOBAL WORK',
    keywords: ['GLOBAL WORK グローバルワーク'],
    priority: 4,
    tags: ['カジュアル', 'ファミリー', 'ベーシック', 'ユニセックス'],
    category: 'casual',
    targetAge: '25-40',
    initialProducts: 200,      // 10 → 200
    maxProducts: 800,          // 30 → 800
    rotationDays: 5
  },
  {
    name: 'niko and...',
    keywords: ['niko and ニコアンド'],
    priority: 4,
    tags: ['カジュアル', '雑貨', 'ライフスタイル', 'リラックス'],
    category: 'casual',
    targetAge: '20-35',
    initialProducts: 200,      // 10 → 200
    maxProducts: 800,          // 30 → 800
    rotationDays: 5
  },
  {
    name: 'coen',
    keywords: ['coen コーエン'],
    priority: 4,
    tags: ['カジュアル', 'アメカジ', 'ベーシック', 'リーズナブル'],
    category: 'casual',
    targetAge: '20-35',
    initialProducts: 200,      // 10 → 200
    maxProducts: 800,          // 30 → 800
    rotationDays: 5
  },
  {
    name: 'WEGO',
    keywords: ['WEGO ウィゴー'],
    priority: 4,
    tags: ['ストリート', 'カジュアル', 'プチプラ', '原宿系'],
    category: 'casual',
    targetAge: '15-25',
    initialProducts: 200,      // 10 → 200
    maxProducts: 800,          // 30 → 800
    rotationDays: 4
  }
];

// 容量制限を大幅に緩和
const CAPACITY_LIMITS = {
  WARNING_THRESHOLD: 200000,   // 50000 → 200000（20万件）
  CRITICAL_THRESHOLD: 400000,  // 90000 → 400000（40万件）
  TARGET_ACTIVE: 150000        // アクティブ商品の目標数
};

// レート制限対策
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 並行処理の制御
const CONCURRENT_BRANDS = 3; // 同時に処理するブランド数
const API_DELAY = 1000; // API呼び出し間隔（ミリ秒）

// 同期履歴の読み込み
async function loadSyncHistory() {
  try {
    await fs.mkdir(path.dirname(SYNC_HISTORY_FILE), { recursive: true });
    const data = await fs.readFile(SYNC_HISTORY_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
}

// 同期履歴の保存
async function saveSyncHistory(history) {
  await fs.mkdir(path.dirname(SYNC_HISTORY_FILE), { recursive: true });
  await fs.writeFile(SYNC_HISTORY_FILE, JSON.stringify(history, null, 2));
}

// Supabaseの容量チェック（緩和版）
async function checkDatabaseCapacity() {
  try {
    const { count: totalCount } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true });

    const { count: activeCount } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    console.log(`\n📊 データベース容量状況:`);
    console.log(`  総商品数: ${totalCount?.toLocaleString()}件`);
    console.log(`  アクティブ商品数: ${activeCount?.toLocaleString()}件`);
    console.log(`  目標アクティブ数: ${CAPACITY_LIMITS.TARGET_ACTIVE.toLocaleString()}件`);

    if (totalCount > CAPACITY_LIMITS.CRITICAL_THRESHOLD) {
      console.error(`\n⚠️  警告: データベース容量が危険域です！(${totalCount?.toLocaleString()}/${CAPACITY_LIMITS.CRITICAL_THRESHOLD.toLocaleString()})`);
      // 古いデータの大規模削除を推奨
      return { canSync: true, needsCleanup: true, totalCount, activeCount };
    } else if (totalCount > CAPACITY_LIMITS.WARNING_THRESHOLD) {
      console.warn(`\n⚠️  注意: データベース容量が警告域です (${totalCount?.toLocaleString()}/${CAPACITY_LIMITS.WARNING_THRESHOLD.toLocaleString()})`);
    }

    return { canSync: true, needsCleanup: false, totalCount, activeCount };
  } catch (error) {
    console.error('❌ データベース容量チェックエラー:', error);
    return { canSync: true, totalCount: 0, activeCount: 0 };
  }
}

// ブランドごとの同期商品数を計算（積極的な増加）
function calculateSyncCount(brand, syncHistory) {
  const brandHistory = syncHistory[brand.name] || {};
  const syncCount = brandHistory.syncCount || 0;
  const lastSync = brandHistory.lastSync ? new Date(brandHistory.lastSync) : null;
  
  // 初回同期の場合
  if (syncCount === 0) {
    return brand.initialProducts;
  }
  
  // 前回同期からの経過日数
  const daysSinceLastSync = lastSync ? 
    (new Date() - lastSync) / (1000 * 60 * 60 * 24) : 999;
  
  // ローテーション期間を過ぎている場合
  if (daysSinceLastSync >= brand.rotationDays) {
    // 50%増加（最大値を超えない）
    const increase = Math.ceil(syncCount * 0.5);
    const newCount = Math.min(syncCount + increase, brand.maxProducts);
    return newCount;
  }
  
  // それ以外は現在の商品数の10%増加
  const smallIncrease = Math.ceil(syncCount * 0.1);
  return Math.min(syncCount + smallIncrease, brand.maxProducts);
}

/**
 * 楽天APIから商品データを取得（複数ページ対応）
 */
async function fetchBrandProducts(brand, startPage = 1, totalNeeded = 30) {
  const allProducts = [];
  const maxApiHits = 30; // APIの1回あたりの最大取得数
  const totalPages = Math.ceil(totalNeeded / maxApiHits);
  
  for (let page = startPage; page <= startPage + totalPages - 1 && allProducts.length < totalNeeded; page++) {
    const url = 'https://app.rakuten.co.jp/services/api/IchibaItem/Search/20170706';
    const params = {
      applicationId: rakutenAppId,
      affiliateId: rakutenAffiliateId,
      hits: maxApiHits,
      page: page,
      sort: '-updateTimestamp',
      imageFlag: 1,
      genreId: '100371', // 女性ファッション
      format: 'json'
    };

    if (brand.shopCode) {
      params.shopCode = brand.shopCode;
    } else if (brand.keywords) {
      params.keyword = brand.keywords.join(' ');
    }

    try {
      console.log(`  🔍 ${brand.name} ページ ${page} を取得中...`);
      const response = await axios.get(url, { params, timeout: 10000 });
      
      if (response.data?.Items && response.data.Items.length > 0) {
        allProducts.push(...response.data.Items);
        await sleep(API_DELAY); // レート制限対策
      } else {
        break; // これ以上商品がない
      }
    } catch (error) {
      if (error.response?.status === 429) {
        console.warn(`  ⚠️  レート制限に達しました。待機中...`);
        await sleep(5000);
        page--; // リトライ
      } else {
        console.error(`  ❌ APIエラー:`, error.message);
        break;
      }
    }
  }
  
  return allProducts.slice(0, totalNeeded);
}

// 高精度タグ抽出
async function loadEnhancedTagExtractor() {
  try {
    const { extractEnhancedTags } = require('./enhanced-tag-extractor');
    return extractEnhancedTags;
  } catch (error) {
    // フォールバック: 基本的なタグ抽出
    return (product) => {
      const tags = [];
      const title = product.itemName || '';
      
      // 基本的なタグ抽出
      if (title.includes('ワンピース')) tags.push('ワンピース');
      if (title.includes('スカート')) tags.push('スカート');
      if (title.includes('パンツ')) tags.push('パンツ');
      if (title.includes('トップス')) tags.push('トップス');
      if (title.includes('ニット')) tags.push('ニット');
      if (title.includes('カーディガン')) tags.push('カーディガン');
      if (title.includes('ブラウス')) tags.push('ブラウス');
      if (title.includes('Tシャツ')) tags.push('Tシャツ');
      if (title.includes('デニム')) tags.push('デニム');
      
      return tags;
    };
  }
}

/**
 * 商品データを整形して保存（バッチ処理最適化）
 */
async function saveProducts(products, brand, extractTags) {
  if (!products || products.length === 0) {
    return { new: 0, updated: 0 };
  }

  console.log(`  📦 ${products.length}件の商品を保存中...`);
  
  const productsToInsert = products.map(item => {
    const product = item.Item;
    
    const extractedTags = extractTags(product);
    const combinedTags = [...new Set([...extractedTags, ...brand.tags])];
    
    // 年齢層タグ
    if (brand.targetAge) {
      const [minAge, maxAge] = brand.targetAge.split('-').map(Number);
      if (minAge <= 20) combinedTags.push('10代', '20代');
      if (minAge <= 30 || (minAge <= 25 && maxAge >= 30)) combinedTags.push('30代');
      if (maxAge >= 35) combinedTags.push('40代');
    }
    
    return {
      id: product.itemCode,
      title: product.itemName,
      image_url: product.mediumImageUrls[0]?.imageUrl || '',
      brand: brand.name,
      price: product.itemPrice,
      tags: combinedTags.slice(0, 25), // タグ数を増やす
      category: brand.category || '100371',
      affiliate_url: product.affiliateUrl || product.itemUrl,
      source: 'rakuten',
      source_brand: brand.name.toLowerCase().replace(/\s+/g, '_'),
      is_active: true,
      priority: brand.priority,
      last_synced: new Date().toISOString(),
      review_count: product.reviewCount || 0,
      rating: product.reviewAverage || 0,
      // 以下のカラムは現在のテーブルに存在しないため除外
      // shop_name: product.shopName || brand.name,
      // item_update_timestamp: product.itemUpdateTimestamp || new Date().toISOString(),
      // is_seasonal: combinedTags.some(tag => 
      //   ['春', '夏', '秋', '冬', '春夏', '秋冬', 'SS', 'AW'].includes(tag)
      // )
    };
  });

  try {
    // バッチサイズを大きくして効率化
    const BATCH_SIZE = 500; // 100 → 500
    let insertCount = 0;
    
    for (let i = 0; i < productsToInsert.length; i += BATCH_SIZE) {
      const batch = productsToInsert.slice(i, i + BATCH_SIZE);
      
      const { error: insertError, data } = await supabase
        .from('external_products')
        .upsert(batch, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        });

      if (insertError) {
        console.error(`  ❌ バッチ挿入エラー:`, insertError);
      } else {
        insertCount += batch.length;
      }
      
      // バッチ間の待機
      if (i + BATCH_SIZE < productsToInsert.length) {
        await sleep(500);
      }
    }
    
    return { new: insertCount, updated: 0 };

  } catch (error) {
    console.error(`  ❌ 保存エラー:`, error);
    return { new: 0, updated: 0 };
  }
}

/**
 * 古い商品の効率的な無効化
 */
async function deactivateOldProducts(daysOld = 3) {
  const oldDate = new Date();
  oldDate.setDate(oldDate.getDate() - daysOld);

  try {
    // バッチで無効化
    const { data, error } = await supabase
      .from('external_products')
      .update({ is_active: false })
      .lt('last_synced', oldDate.toISOString())
      .eq('source', 'rakuten')
      .select('id');

    if (error) {
      console.error('❌ 古い商品の無効化エラー:', error);
    } else {
      console.log(`✅ ${daysOld}日以上前の${data?.length || 0}件を無効化`);
    }
    
    // 非常に古いデータは削除（30日以上）
    const veryOldDate = new Date();
    veryOldDate.setDate(veryOldDate.getDate() - 30);
    
    const { error: deleteError } = await supabase
      .from('external_products')
      .delete()
      .lt('last_synced', veryOldDate.toISOString())
      .eq('is_active', false);
      
    if (!deleteError) {
      console.log('✅ 30日以上前の非アクティブデータを削除');
    }
    
  } catch (error) {
    console.error('❌ クリーンアップエラー:', error);
  }
}

/**
 * ブランドの並行処理
 */
async function processBrandsConcurrently(brands, syncHistory, extractTags) {
  const results = [];
  
  // 優先度でグループ化
  const priorityGroups = {};
  brands.forEach(brand => {
    if (!priorityGroups[brand.priority]) {
      priorityGroups[brand.priority] = [];
    }
    priorityGroups[brand.priority].push(brand);
  });
  
  // 優先度順に処理
  const priorities = Object.keys(priorityGroups).sort((a, b) => a - b);
  
  for (const priority of priorities) {
    const brandsInPriority = priorityGroups[priority];
    console.log(`\n🎯 Priority ${priority} のブランドを処理中...`);
    
    // 同一優先度内で並行処理
    for (let i = 0; i < brandsInPriority.length; i += CONCURRENT_BRANDS) {
      const batch = brandsInPriority.slice(i, i + CONCURRENT_BRANDS);
      
      const batchPromises = batch.map(async (brand) => {
        console.log(`\n🏷️  ${brand.name} の処理開始`);
        
        const targetCount = calculateSyncCount(brand, syncHistory);
        console.log(`  📊 目標: ${targetCount.toLocaleString()}件 (最大: ${brand.maxProducts.toLocaleString()}件)`);
        
        const products = await fetchBrandProducts(brand, 1, targetCount);
        
        if (products.length > 0) {
          const result = await saveProducts(products, brand, extractTags);
          
          // 履歴更新
          syncHistory[brand.name] = {
            syncCount: products.length,
            lastSync: new Date().toISOString(),
            totalSynced: (syncHistory[brand.name]?.totalSynced || 0) + result.new
          };
          
          return {
            brand: brand.name,
            priority: brand.priority,
            category: brand.category,
            targetCount,
            actualCount: products.length,
            ...result
          };
        }
        
        return null;
      });
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults.filter(r => r !== null));
      
      // バッチ間の待機
      if (i + CONCURRENT_BRANDS < brandsInPriority.length) {
        await sleep(2000);
      }
    }
  }
  
  return results;
}

/**
 * 統計情報の表示（改良版）
 */
async function showStatistics() {
  try {
    const { data: stats } = await supabase
      .from('external_products')
      .select('source_brand, category, priority')
      .eq('is_active', true);

    const brandStats = {};
    const categoryStats = {};
    
    stats?.forEach(item => {
      const brand = item.source_brand || 'unknown';
      const category = item.category || 'other';
      
      brandStats[brand] = (brandStats[brand] || 0) + 1;
      categoryStats[category] = (categoryStats[category] || 0) + 1;
    });

    console.log('\n📊 統計情報:');
    console.log('\n【カテゴリ別】');
    Object.entries(categoryStats)
      .sort((a, b) => b[1] - a[1])
      .forEach(([category, count]) => {
        console.log(`  ${category}: ${count.toLocaleString()}件`);
      });

    console.log('\n【上位ブランド】');
    Object.entries(brandStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([brand, count]) => {
        console.log(`  ${brand}: ${count.toLocaleString()}件`);
      });

    const { count: totalActive } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    console.log(`\n✨ アクティブ商品総数: ${totalActive?.toLocaleString()}件`);
    console.log(`📈 目標達成率: ${Math.round((totalActive / CAPACITY_LIMITS.TARGET_ACTIVE) * 100)}%`);

  } catch (error) {
    console.error('❌ 統計情報取得エラー:', error);
  }
}

/**
 * メイン処理
 */
async function main() {
  console.log('\n🚀 大規模MVP商品同期 V3 を開始します...\n');
  console.log(`📋 対象ブランド数: ${MASSIVE_MVP_BRANDS.length}ブランド`);
  console.log(`🎯 目標アクティブ商品数: ${CAPACITY_LIMITS.TARGET_ACTIVE.toLocaleString()}件`);
  console.log(`⚡ 並行処理: ${CONCURRENT_BRANDS}ブランド同時実行\n`);

  // 容量チェック
  const capacityCheck = await checkDatabaseCapacity();
  
  if (capacityCheck.needsCleanup) {
    console.log('\n🧹 データベースクリーンアップを実行中...');
    await deactivateOldProducts(3);
  }

  // 同期履歴とタグ抽出機能の読み込み
  const syncHistory = await loadSyncHistory();
  const extractTags = await loadEnhancedTagExtractor();

  try {
    // ブランドの並行処理
    const results = await processBrandsConcurrently(
      MASSIVE_MVP_BRANDS,
      syncHistory,
      extractTags
    );

    // 履歴保存
    await saveSyncHistory(syncHistory);

    // 結果集計
    const totalNew = results.reduce((sum, r) => sum + r.new, 0);
    const totalProducts = results.reduce((sum, r) => sum + r.actualCount, 0);

    console.log('\n📈 同期結果:');
    console.log(`  処理ブランド数: ${results.length}`);
    console.log(`  新規追加: ${totalNew.toLocaleString()}件`);
    console.log(`  合計取得: ${totalProducts.toLocaleString()}件`);

    // 最終クリーンアップ
    await deactivateOldProducts(5);

    // 統計表示
    await showStatistics();

  } catch (error) {
    console.error('\n❌ エラーが発生しました:', error);
    process.exit(1);
  }
}

// 実行
if (require.main === module) {
  main().then(() => {
    console.log('\n✨ 大規模同期が完了しました！');
    console.log('💡 次回実行時はさらに商品数が増加します');
    process.exit(0);
  }).catch((error) => {
    console.error('\n❌ 予期しないエラー:', error);
    process.exit(1);
  });
}

module.exports = { MASSIVE_MVP_BRANDS, CAPACITY_LIMITS };

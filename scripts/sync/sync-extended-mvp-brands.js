#!/usr/bin/env node
/**
 * 大規模商品同期スクリプト - 目標50,000件以上
 * 効率的なローテーションシステムと高度なタグ付け機能付き
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
const SYNC_HISTORY_FILE = path.join(__dirname, '..', 'data', 'sync-history.json');

// 大規模ブランドリスト（目標50,000件以上）
const MASSIVE_BRAND_LIST = [
  // Tier 1: メガブランド（各5,000件以上）
  { 
    name: 'UNIQLO',
    shopCode: 'uniqlo',
    priority: 1,
    tags: ['ベーシック', 'シンプル', '機能的', '定番'],
    category: 'mega-brand',
    targetAge: '20-40',
    initialProducts: 2000,     // 300 → 2000
    maxProducts: 8000,        // 2000 → 8000
    rotationDays: 1,          // 毎日更新
    seasonalBoost: true       // 季節商品を優先
  },
  { 
    name: 'GU',
    shopCode: 'gu-official', 
    priority: 1,
    tags: ['トレンド', 'プチプラ', 'カジュアル', 'ファストファッション'],
    category: 'mega-brand',
    targetAge: '20-30',
    initialProducts: 2000,
    maxProducts: 8000,
    rotationDays: 1,
    seasonalBoost: true
  },
  {
    name: 'しまむら',
    keywords: ['しまむら', 'shimamura'],
    priority: 1,
    tags: ['プチプラ', 'ファミリー', 'カジュアル'],
    category: 'mega-brand',
    targetAge: '20-50',
    initialProducts: 1500,
    maxProducts: 6000,
    rotationDays: 2
  },
  {
    name: '無印良品',
    keywords: ['無印良品', 'MUJI'],
    priority: 1,
    tags: ['シンプル', 'ナチュラル', 'ベーシック', 'サステナブル'],
    category: 'mega-brand',
    targetAge: '25-40',
    initialProducts: 1000,
    maxProducts: 5000,
    rotationDays: 3,
    seasonalBoost: true
  },
  {
    name: '楽天ファッション総合',
    keywords: ['レディース ファッション', 'トップス', 'ボトムス', 'ワンピース'],
    priority: 1,
    tags: ['総合', 'トレンド', 'バラエティ'],
    category: 'marketplace',
    targetAge: '20-50',
    initialProducts: 3000,
    maxProducts: 10000,
    rotationDays: 1,
    multiKeyword: true  // 複数キーワードで検索
  },
  
  // Tier 2: 大手ECブランド（各1,000-3,000件）
  { 
    name: 'ZOZOTOWN出品',
    keywords: ['ZOZOTOWN', 'ゾゾタウン'],
    priority: 2,
    tags: ['セレクト', 'トレンド', 'ブランドMIX'],
    category: 'ec-platform',
    targetAge: '20-35',
    initialProducts: 1000,
    maxProducts: 3000,
    rotationDays: 2
  },
  { 
    name: 'coca',
    keywords: ['coca コカ', 'coca ファッション'],
    priority: 2,
    tags: ['ナチュラル', 'カジュアル', 'リラックス', '大人可愛い'],
    category: 'ec-brand',
    targetAge: '25-35',
    initialProducts: 500,
    maxProducts: 2000,
    rotationDays: 3
  },
  { 
    name: 'pierrot',
    keywords: ['pierrot ピエロ', 'ピエロ ファッション'],
    priority: 2,
    tags: ['大人カジュアル', 'きれいめ', 'オフィス', 'プチプラ'],
    category: 'ec-brand',
    targetAge: '25-40',
    initialProducts: 500,
    maxProducts: 2000,
    rotationDays: 3
  },
  {
    name: 'Re:EDIT',
    keywords: ['Re:EDIT リエディ', 'リエディ ファッション'],
    priority: 2,
    tags: ['トレンド', 'モード', 'カジュアル', '韓国系'],
    category: 'ec-brand',
    targetAge: '20-35',
    initialProducts: 500,
    maxProducts: 2000,
    rotationDays: 3
  },
  {
    name: 'fifth',
    keywords: ['fifth フィフス', 'フィフス ファッション'],
    priority: 2,
    tags: ['韓国系', 'トレンド', 'プチプラ', 'ガーリー'],
    category: 'ec-brand',
    targetAge: '20-30',
    initialProducts: 500,
    maxProducts: 2000,
    rotationDays: 3
  },
  {
    name: 'titivate',
    keywords: ['titivate ティティベイト'],
    priority: 2,
    tags: ['きれいめ', 'オフィス', '大人カジュアル', 'トレンド'],
    category: 'ec-brand',
    targetAge: '25-40',
    initialProducts: 500,
    maxProducts: 2000,
    rotationDays: 3
  },
  {
    name: 'SHOPLIST',
    keywords: ['SHOPLIST', 'ショップリスト'],
    priority: 2,
    tags: ['プチプラ', 'トレンド', 'まとめ買い'],
    category: 'ec-platform',
    targetAge: '20-35',
    initialProducts: 1000,
    maxProducts: 3000,
    rotationDays: 2
  },
  
  // Tier 3: セレクトショップ系（各500-1,500件）
  { 
    name: 'URBAN RESEARCH',
    keywords: ['URBAN RESEARCH アーバンリサーチ', 'アーバンリサーチ'],
    priority: 3,
    tags: ['都会的', 'セレクト', 'カジュアル', 'トレンド'],
    category: 'select',
    targetAge: '25-40',
    initialProducts: 300,
    maxProducts: 1500,
    rotationDays: 4
  },
  {
    name: 'nano・universe',
    keywords: ['nano universe ナノユニバース', 'ナノユニバース'],
    priority: 3,
    tags: ['トレンド', 'きれいめ', 'モード', 'セレクト'],
    category: 'select',
    targetAge: '20-35',
    initialProducts: 300,
    maxProducts: 1500,
    rotationDays: 4
  },
  {
    name: 'BEAMS',
    keywords: ['BEAMS ビームス', 'ビームス レディース'],
    priority: 3,
    tags: ['カジュアル', 'セレクト', 'トレンド', 'アメカジ'],
    category: 'select',
    targetAge: '25-40',
    initialProducts: 300,
    maxProducts: 1500,
    rotationDays: 4
  },
  {
    name: 'UNITED ARROWS',
    keywords: ['UNITED ARROWS ユナイテッドアローズ', 'ユナイテッドアローズ'],
    priority: 3,
    tags: ['きれいめ', '上品', 'オフィス', 'セレクト'],
    category: 'select',
    targetAge: '30-40',
    initialProducts: 300,
    maxProducts: 1500,
    rotationDays: 4
  },
  {
    name: 'SHIPS',
    keywords: ['SHIPS シップス', 'シップス レディース'],
    priority: 3,
    tags: ['トラッド', '上品', 'きれいめ', 'セレクト'],
    category: 'select',
    targetAge: '30-40',
    initialProducts: 300,
    maxProducts: 1500,
    rotationDays: 4
  },
  {
    name: 'JOURNAL STANDARD',
    keywords: ['JOURNAL STANDARD ジャーナルスタンダード'],
    priority: 3,
    tags: ['アメカジ', 'カジュアル', 'セレクト'],
    category: 'select',
    targetAge: '25-40',
    initialProducts: 300,
    maxProducts: 1500,
    rotationDays: 4
  },
  
  // Tier 4: 専門店・ライフスタイル系（各300-1,000件）
  {
    name: 'studio CLIP',
    keywords: ['studio CLIP スタディオクリップ'],
    priority: 4,
    tags: ['ナチュラル', '雑貨', 'リラックス', 'ライフスタイル'],
    category: 'lifestyle',
    targetAge: '25-40',
    initialProducts: 200,
    maxProducts: 1000,
    rotationDays: 5
  },
  {
    name: 'SM2',
    keywords: ['SM2 サマンサモスモス', 'サマンサモスモス'],
    priority: 4,
    tags: ['ナチュラル', 'ほっこり', 'カジュアル', 'ゆったり'],
    category: 'lifestyle',
    targetAge: '25-40',
    initialProducts: 200,
    maxProducts: 1000,
    rotationDays: 5
  },
  {
    name: 'earth music&ecology',
    keywords: ['earth music ecology アースミュージックエコロジー'],
    priority: 4,
    tags: ['カジュアル', 'ナチュラル', 'エコ', 'プチプラ'],
    category: 'lifestyle',
    targetAge: '20-30',
    initialProducts: 200,
    maxProducts: 1000,
    rotationDays: 5
  },
  {
    name: 'LOWRYS FARM',
    keywords: ['LOWRYS FARM ローリーズファーム'],
    priority: 4,
    tags: ['ガーリー', 'カジュアル', 'フェミニン', 'トレンド'],
    category: 'lifestyle',
    targetAge: '20-30',
    initialProducts: 200,
    maxProducts: 1000,
    rotationDays: 5
  },
  {
    name: 'GLOBAL WORK',
    keywords: ['GLOBAL WORK グローバルワーク'],
    priority: 4,
    tags: ['カジュアル', 'ファミリー', 'ベーシック', 'デイリー'],
    category: 'lifestyle',
    targetAge: '25-40',
    initialProducts: 200,
    maxProducts: 1000,
    rotationDays: 5
  },
  {
    name: 'niko and...',
    keywords: ['niko and ニコアンド'],
    priority: 4,
    tags: ['カジュアル', '雑貨', 'ライフスタイル', 'ナチュラル'],
    category: 'lifestyle',
    targetAge: '20-35',
    initialProducts: 200,
    maxProducts: 1000,
    rotationDays: 5
  },
  
  // Tier 5: トレンド・ターゲット別ブランド（各200-800件）
  {
    name: 'ZARA',
    keywords: ['ZARA ザラ', 'ザラ レディース'],
    priority: 5,
    tags: ['欧州トレンド', 'モード', 'ファスト', 'トレンド'],
    category: 'trend',
    targetAge: '20-35',
    initialProducts: 200,
    maxProducts: 800,
    rotationDays: 3,
    seasonalBoost: true
  },
  {
    name: 'H&M',
    keywords: ['H&M エイチアンドエム', 'H&M レディース'],
    priority: 5,
    tags: ['北欧', 'トレンド', 'カジュアル', 'ファスト'],
    category: 'trend',
    targetAge: '20-30',
    initialProducts: 200,
    maxProducts: 800,
    rotationDays: 3,
    seasonalBoost: true
  },
  {
    name: 'SNIDEL',
    keywords: ['SNIDEL スナイデル'],
    priority: 5,
    tags: ['フェミニン', 'エレガント', 'トレンド', 'ガーリー'],
    category: 'trend',
    targetAge: '20-30',
    initialProducts: 150,
    maxProducts: 600,
    rotationDays: 5
  },
  {
    name: 'FRAY I.D',
    keywords: ['FRAY ID フレイアイディー'],
    priority: 5,
    tags: ['エレガント', 'モード', 'フェミニン', '大人可愛い'],
    category: 'trend',
    targetAge: '25-35',
    initialProducts: 150,
    maxProducts: 600,
    rotationDays: 5
  },
  {
    name: 'WEGO',
    keywords: ['WEGO ウィゴー'],
    priority: 5,
    tags: ['ストリート', 'カジュアル', 'プチプラ', '原宿系'],
    category: 'trend',
    targetAge: '18-25',
    initialProducts: 200,
    maxProducts: 800,
    rotationDays: 4
  },
  {
    name: 'coen',
    keywords: ['coen コーエン'],
    priority: 5,
    tags: ['カジュアル', 'アメカジ', 'ベーシック', 'デイリー'],
    category: 'trend',
    targetAge: '20-35',
    initialProducts: 150,
    maxProducts: 600,
    rotationDays: 5
  },
  
  // Tier 6: ニッチ・専門カテゴリ（各100-500件）
  {
    name: 'PLST',
    keywords: ['PLST プラステ'],
    priority: 6,
    tags: ['大人ベーシック', 'きれいめ', '上質', 'オフィス'],
    category: 'age-specific',
    targetAge: '30-40',
    initialProducts: 100,
    maxProducts: 500,
    rotationDays: 6
  },
  {
    name: 'vis',
    keywords: ['vis ビス'],
    priority: 6,
    tags: ['オフィス', 'きれいめ', 'フェミニン', '通勤'],
    category: 'age-specific',
    targetAge: '25-35',
    initialProducts: 100,
    maxProducts: 500,
    rotationDays: 6
  },
  {
    name: 'ROPE',
    keywords: ['ROPE ロペ'],
    priority: 6,
    tags: ['エレガント', 'きれいめ', 'オフィス', '上品'],
    category: 'age-specific',
    targetAge: '25-40',
    initialProducts: 100,
    maxProducts: 500,
    rotationDays: 6
  },
  {
    name: 'NATURAL BEAUTY BASIC',
    keywords: ['NATURAL BEAUTY BASIC ナチュラルビューティーベーシック'],
    priority: 6,
    tags: ['オフィス', 'きれいめ', 'ベーシック', '通勤'],
    category: 'age-specific',
    targetAge: '25-40',
    initialProducts: 100,
    maxProducts: 500,
    rotationDays: 6
  },
  
  // 追加：カテゴリ別総合検索（大量商品取得用）
  {
    name: 'トップス総合',
    keywords: ['レディース トップス', 'ブラウス', 'シャツ', 'ニット'],
    priority: 1,
    tags: ['トップス', '総合'],
    category: 'category-search',
    targetAge: '20-50',
    initialProducts: 2000,
    maxProducts: 5000,
    rotationDays: 1,
    multiKeyword: true
  },
  {
    name: 'ボトムス総合',
    keywords: ['レディース パンツ', 'スカート', 'デニム'],
    priority: 1,
    tags: ['ボトムス', '総合'],
    category: 'category-search',
    targetAge: '20-50',
    initialProducts: 2000,
    maxProducts: 5000,
    rotationDays: 1,
    multiKeyword: true
  },
  {
    name: 'ワンピース総合',
    keywords: ['レディース ワンピース', 'ドレス', 'チュニック'],
    priority: 1,
    tags: ['ワンピース', '総合'],
    category: 'category-search',
    targetAge: '20-50',
    initialProducts: 2000,
    maxProducts: 5000,
    rotationDays: 1,
    multiKeyword: true
  }
];

// レート制限対策
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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

// Supabaseの容量チェック（拡張版）
async function checkDatabaseCapacity() {
  try {
    const { count: totalCount } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true });

    const { count: activeCount } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // カテゴリ別の商品数を取得
    const { data: categoryStats } = await supabase
      .from('external_products')
      .select('category, source_brand')
      .eq('is_active', true);

    const categoryBreakdown = {};
    categoryStats?.forEach(item => {
      const cat = item.category || 'unknown';
      categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1;
    });

    console.log(`\n📊 データベース容量状況:`);
    console.log(`  総商品数: ${totalCount}件`);
    console.log(`  アクティブ商品数: ${activeCount}件`);
    console.log(`  非アクティブ商品数: ${totalCount - activeCount}件`);
    
    console.log(`\n📊 カテゴリ別分布:`);
    Object.entries(categoryBreakdown).forEach(([cat, count]) => {
      console.log(`  ${cat}: ${count}件`);
    });

    // 容量の警告閾値（目標50,000件以上）
    const TARGET_PRODUCTS = 50000;
    const WARNING_THRESHOLD = 80000;
    const CRITICAL_THRESHOLD = 95000;

    if (totalCount > CRITICAL_THRESHOLD) {
      console.error(`\n⚠️  警告: データベース容量が危険域です！(${totalCount}/${CRITICAL_THRESHOLD})`);
      return { canSync: false, totalCount, activeCount, needsCleanup: true };
    } else if (totalCount > WARNING_THRESHOLD) {
      console.warn(`\n⚠️  注意: データベース容量が警告域です (${totalCount}/${WARNING_THRESHOLD})`);
      return { canSync: true, totalCount, activeCount, needsCleanup: true };
    } else if (activeCount < TARGET_PRODUCTS) {
      console.log(`\n📈 目標まであと ${TARGET_PRODUCTS - activeCount}件の商品が必要です`);
    }

    return { canSync: true, totalCount, activeCount, needsCleanup: false };
  } catch (error) {
    console.error('❌ データベース容量チェックエラー:', error);
    return { canSync: true, totalCount: 0, activeCount: 0, needsCleanup: false };
  }
}

// 動的な同期商品数計算（改良版）
function calculateSyncCount(brand, syncHistory, currentActiveCount) {
  const brandHistory = syncHistory[brand.name] || {};
  const syncCount = brandHistory.syncCount || 0;
  const lastSync = brandHistory.lastSync ? new Date(brandHistory.lastSync) : null;
  
  // 初回同期
  if (syncCount === 0) {
    return brand.initialProducts;
  }
  
  // 前回同期からの経過日数
  const daysSinceLastSync = lastSync ? 
    (new Date() - lastSync) / (1000 * 60 * 60 * 24) : 999;
  
  // ローテーション期間を過ぎた場合
  if (daysSinceLastSync >= brand.rotationDays) {
    // 現在のアクティブ商品数に応じて増加率を調整
    let increaseRate = 0.3; // デフォルト30%増
    
    if (currentActiveCount < 10000) {
      increaseRate = 0.5; // 50%増（初期段階）
    } else if (currentActiveCount < 30000) {
      increaseRate = 0.4; // 40%増（中期段階）
    } else if (currentActiveCount < 50000) {
      increaseRate = 0.3; // 30%増（後期段階）
    } else {
      increaseRate = 0.2; // 20%増（維持段階）
    }
    
    // 優先度による調整
    if (brand.priority === 1) {
      increaseRate *= 1.5; // 優先度1は1.5倍
    } else if (brand.priority === 2) {
      increaseRate *= 1.2; // 優先度2は1.2倍
    }
    
    const increase = Math.ceil(syncCount * increaseRate);
    const newCount = Math.min(syncCount + increase, brand.maxProducts);
    
    console.log(`  📈 増加率: ${(increaseRate * 100).toFixed(0)}% (${syncCount} → ${newCount}件)`);
    return newCount;
  }
  
  // 維持
  return syncCount;
}

// 楽天APIから商品データを取得（拡張版）
async function fetchBrandProducts(brand, page = 1, maxHits = 30) {
  const url = 'https://app.rakuten.co.jp/services/api/IchibaItem/Search/20170706';
  const params = {
    applicationId: rakutenAppId,
    affiliateId: rakutenAffiliateId,
    hits: Math.min(maxHits, 30),
    page: page,
    imageFlag: 1,
    genreId: '100371', // 女性ファッション
    format: 'json',
    sort: '-updateTimestamp' // 新着順
  };

  // 季節商品の優先取得
  if (brand.seasonalBoost) {
    const currentMonth = new Date().getMonth() + 1;
    let seasonKeyword = '';
    
    if (currentMonth >= 3 && currentMonth <= 5) {
      seasonKeyword = '春';
    } else if (currentMonth >= 6 && currentMonth <= 8) {
      seasonKeyword = '夏';
    } else if (currentMonth >= 9 && currentMonth <= 11) {
      seasonKeyword = '秋';
    } else {
      seasonKeyword = '冬';
    }
    
    params.keyword = seasonKeyword + ' ';
  }

  // ショップコードがある場合
  if (brand.shopCode) {
    params.shopCode = brand.shopCode;
  } 
  // マルチキーワード検索
  else if (brand.multiKeyword && brand.keywords) {
    // キーワードをローテーション
    const keywordIndex = (page - 1) % brand.keywords.length;
    params.keyword = (params.keyword || '') + brand.keywords[keywordIndex];
  }
  // 通常のキーワード検索
  else if (brand.keywords) {
    params.keyword = (params.keyword || '') + brand.keywords.join(' ');
  }

  // 価格帯フィルタ（ブランドに応じて）
  if (brand.category === 'mega-brand' || brand.tags.includes('プチプラ')) {
    params.minPrice = 1000;
    params.maxPrice = 15000;
  } else if (brand.category === 'select') {
    params.minPrice = 5000;
    params.maxPrice = 50000;
  }

  try {
    console.log(`🔍 ${brand.name} の商品を検索中... (page: ${page}, keyword: ${params.keyword || 'なし'})`);
    const response = await axios.get(url, { params, timeout: 15000 });
    return response.data;
  } catch (error) {
    if (error.response?.status === 429) {
      console.warn(`⚠️  ${brand.name} APIレート制限に達しました。待機中...`);
      await sleep(10000); // 10秒待機
      return fetchBrandProducts(brand, page, maxHits);
    }
    console.error(`❌ ${brand.name} API エラー:`, error.response?.data || error.message);
    return null;
  }
}

// 高度なタグ抽出（強化版）
const { extractEnhancedTags } = require('./enhanced-tag-extractor');

// AIベースのタグ生成（シミュレーション）
function generateAITags(product, brand) {
  const aiTags = [];
  
  // 価格帯による自動タグ付け
  const price = product.itemPrice;
  if (price < 2000) {
    aiTags.push('超プチプラ', '2000円以下');
  } else if (price < 5000) {
    aiTags.push('プチプラ', '5000円以下');
  } else if (price < 10000) {
    aiTags.push('お手頃', '1万円以下');
  } else if (price < 20000) {
    aiTags.push('ミドルプライス');
  } else {
    aiTags.push('高級', 'ハイプライス');
  }
  
  // レビュー評価によるタグ
  if (product.reviewAverage >= 4.5) {
    aiTags.push('高評価', '人気商品');
  } else if (product.reviewAverage >= 4.0) {
    aiTags.push('おすすめ');
  }
  
  // 新着商品タグ
  const itemDate = new Date(product.itemUpdateTimestamp || product.startTime);
  const daysSinceUpdate = (new Date() - itemDate) / (1000 * 60 * 60 * 24);
  if (daysSinceUpdate <= 7) {
    aiTags.push('新着', 'NEW');
  } else if (daysSinceUpdate <= 30) {
    aiTags.push('今月の新作');
  }
  
  // ブランドカテゴリによる追加タグ
  if (brand.category === 'mega-brand') {
    aiTags.push('人気ブランド', 'メジャーブランド');
  } else if (brand.category === 'ec-brand') {
    aiTags.push('ネット専売', 'EC限定');
  } else if (brand.category === 'select') {
    aiTags.push('セレクトショップ', 'こだわり');
  }
  
  return aiTags;
}

// 商品データを整形してSupabaseに保存（最適化版）
async function saveProducts(products, brand) {
  if (!products || products.length === 0) {
    console.log(`📦 ${brand.name} の保存する商品がありません`);
    return { new: 0, updated: 0 };
  }

  console.log(`📦 ${brand.name} の ${products.length}件の商品を処理中...`);
  
  const productsToInsert = products.map(item => {
    const product = item.Item;
    
    // 基本タグ抽出
    const extractedTags = extractEnhancedTags(product);
    // AIタグ生成
    const aiTags = generateAITags(product, brand);
    // ブランドタグ
    const brandTags = brand.tags || [];
    
    // すべてのタグを統合（重複排除）
    const allTags = [...new Set([...extractedTags, ...aiTags, ...brandTags])];
    
    // 年齢層タグ
    if (brand.targetAge) {
      const ageRanges = brand.targetAge.split('-');
      if (ageRanges[0] <= 20) allTags.push('10代〜20代');
      if (ageRanges[0] <= 25) allTags.push('20代');
      if (ageRanges[0] <= 35 && ageRanges[1] >= 30) allTags.push('30代');
      if (ageRanges[1] >= 35) allTags.push('40代');
      if (ageRanges[1] >= 45) allTags.push('40代以上');
    }
    
    // タグの優先度付け（最大25個まで拡張）
    const finalTags = allTags.slice(0, 25);
    
    return {
      id: product.itemCode,
      title: product.itemName,
      image_url: product.mediumImageUrls[0]?.imageUrl || '',
      brand: brand.name,
      price: product.itemPrice,
      tags: finalTags,
      category: brand.category || '100371',
      affiliate_url: product.affiliateUrl || product.itemUrl,
      source: 'rakuten',
      source_brand: brand.name.toLowerCase().replace(/\s+/g, '_'),
      is_active: true,
      priority: brand.priority,
      last_synced: new Date().toISOString(),
      // Phase 2フィールド
      shop_name: product.shopName || brand.name,
      review_count: product.reviewCount || 0,
      review_average: product.reviewAverage || 0,
      item_update_timestamp: product.itemUpdateTimestamp || new Date().toISOString(),
      is_seasonal: finalTags.some(tag => 
        ['春', '夏', '秋', '冬', '春夏', '秋冬', 'NEW', '新着'].includes(tag)
      ),
      // 追加フィールド
      original_price: product.itemPrice,
      is_sale: product.pointRate > 1 || product.itemPrice < (product.itemPrice * 0.9),
      discount_percentage: product.pointRate > 1 ? Math.round((product.pointRate - 1) * 100) : 0
    };
  });

  try {
    // バッチサイズを大きくして効率化
    const BATCH_SIZE = 200; // 100 → 200
    let insertCount = 0;
    let updateCount = 0;

    // 既存商品のチェック（バッチ処理）
    for (let i = 0; i < productsToInsert.length; i += BATCH_SIZE) {
      const batch = productsToInsert.slice(i, i + BATCH_SIZE);
      const batchIds = batch.map(p => p.id);
      
      const { data: existing } = await supabase
        .from('external_products')
        .select('id')
        .in('id', batchIds);

      const existingIdSet = new Set(existing?.map(p => p.id) || []);
      const newProducts = batch.filter(p => !existingIdSet.has(p.id));
      const updateProducts = batch.filter(p => existingIdSet.has(p.id));

      // 新規商品を挿入
      if (newProducts.length > 0) {
        const { error: insertError } = await supabase
          .from('external_products')
          .insert(newProducts);

        if (insertError) {
          console.error(`❌ ${brand.name} 挿入エラー:`, insertError);
        } else {
          insertCount += newProducts.length;
        }
      }

      // 既存商品を更新（バッチ更新）
      if (updateProducts.length > 0) {
        for (const product of updateProducts) {
          const { error: updateError } = await supabase
            .from('external_products')
            .update({
              title: product.title,
              price: product.price,
              tags: product.tags,
              priority: product.priority,
              is_active: true,
              last_synced: product.last_synced,
              shop_name: product.shop_name,
              review_count: product.review_count,
              review_average: product.review_average,
              item_update_timestamp: product.item_update_timestamp,
              is_seasonal: product.is_seasonal,
              original_price: product.original_price,
              is_sale: product.is_sale,
              discount_percentage: product.discount_percentage
            })
            .eq('id', product.id);

          if (!updateError) {
            updateCount++;
          }
        }
      }

      // API制限対策
      if (i + BATCH_SIZE < productsToInsert.length) {
        await sleep(500);
      }
    }

    if (insertCount > 0) {
      console.log(`✅ ${brand.name}: ${insertCount}件の新規商品を追加`);
    }
    if (updateCount > 0) {
      console.log(`✅ ${brand.name}: ${updateCount}件の既存商品を更新`);
    }

    return { new: insertCount, updated: updateCount };

  } catch (error) {
    console.error(`❌ ${brand.name} 保存エラー:`, error);
    return { new: 0, updated: 0 };
  }
}

// インテリジェントな商品非アクティブ化
async function intelligentDeactivation(targetActiveCount = 50000) {
  try {
    // 現在のアクティブ商品数を確認
    const { count: currentActive } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    if (currentActive <= targetActiveCount) {
      console.log(`✅ アクティブ商品数が目標値以下です（${currentActive}/${targetActiveCount}）`);
      return;
    }

    const deactivateCount = currentActive - targetActiveCount;
    console.log(`🔄 ${deactivateCount}件の商品を非アクティブ化します...`);

    // 優先度の低い、古い商品から非アクティブ化
    const { data: toDeactivate } = await supabase
      .from('external_products')
      .select('id')
      .eq('is_active', true)
      .order('priority', { ascending: false }) // 優先度が低いものから
      .order('last_synced', { ascending: true }) // 古いものから
      .limit(deactivateCount);

    if (toDeactivate && toDeactivate.length > 0) {
      const ids = toDeactivate.map(item => item.id);
      
      // バッチで非アクティブ化
      const BATCH_SIZE = 500;
      for (let i = 0; i < ids.length; i += BATCH_SIZE) {
        const batch = ids.slice(i, i + BATCH_SIZE);
        await supabase
          .from('external_products')
          .update({ is_active: false })
          .in('id', batch);
      }

      console.log(`✅ ${ids.length}件の商品を非アクティブ化しました`);
    }

  } catch (error) {
    console.error('❌ インテリジェント非アクティブ化エラー:', error);
  }
}

// データベースのクリーンアップ
async function cleanupDatabase() {
  try {
    console.log('🧹 データベースのクリーンアップを開始...');

    // 30日以上更新されていない非アクティブ商品を削除
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: oldInactive } = await supabase
      .from('external_products')
      .select('id')
      .eq('is_active', false)
      .lt('last_synced', thirtyDaysAgo.toISOString())
      .limit(5000); // 一度に削除する最大数

    if (oldInactive && oldInactive.length > 0) {
      const ids = oldInactive.map(item => item.id);
      
      // バッチ削除
      const BATCH_SIZE = 500;
      let deletedCount = 0;
      
      for (let i = 0; i < ids.length; i += BATCH_SIZE) {
        const batch = ids.slice(i, i + BATCH_SIZE);
        const { error } = await supabase
          .from('external_products')
          .delete()
          .in('id', batch);
          
        if (!error) {
          deletedCount += batch.length;
        }
      }

      console.log(`✅ ${deletedCount}件の古い非アクティブ商品を削除しました`);
    }

  } catch (error) {
    console.error('❌ クリーンアップエラー:', error);
  }
}

// 詳細な統計情報の表示
async function showDetailedStatistics() {
  try {
    // 全体統計
    const { count: totalCount } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true });

    const { count: activeCount } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // ブランド別統計
    const { data: brandStats } = await supabase
      .from('external_products')
      .select('source_brand, priority, is_active');

    const brandSummary = {};
    brandStats?.forEach(item => {
      const brand = item.source_brand || 'unknown';
      if (!brandSummary[brand]) {
        brandSummary[brand] = { 
          total: 0, 
          active: 0, 
          priority: item.priority 
        };
      }
      brandSummary[brand].total++;
      if (item.is_active) {
        brandSummary[brand].active++;
      }
    });

    // タグ別統計（上位タグ）
    const { data: tagData } = await supabase
      .from('external_products')
      .select('tags')
      .eq('is_active', true)
      .limit(1000);

    const tagCount = {};
    tagData?.forEach(item => {
      item.tags?.forEach(tag => {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      });
    });

    const topTags = Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20);

    // 価格帯分布
    const { data: priceData } = await supabase
      .from('external_products')
      .select('price')
      .eq('is_active', true);

    const priceRanges = {
      '〜3000円': 0,
      '3000〜5000円': 0,
      '5000〜10000円': 0,
      '10000〜20000円': 0,
      '20000円〜': 0
    };

    priceData?.forEach(item => {
      const price = item.price;
      if (price < 3000) priceRanges['〜3000円']++;
      else if (price < 5000) priceRanges['3000〜5000円']++;
      else if (price < 10000) priceRanges['5000〜10000円']++;
      else if (price < 20000) priceRanges['10000〜20000円']++;
      else priceRanges['20000円〜']++;
    });

    // レポート出力
    console.log('\n' + '='.repeat(60));
    console.log('📊 詳細統計レポート');
    console.log('='.repeat(60));
    
    console.log('\n【全体統計】');
    console.log(`総商品数: ${totalCount.toLocaleString()}件`);
    console.log(`アクティブ商品数: ${activeCount.toLocaleString()}件 (${(activeCount/totalCount*100).toFixed(1)}%)`);
    console.log(`非アクティブ商品数: ${(totalCount - activeCount).toLocaleString()}件`);
    
    console.log('\n【ブランド別統計】（アクティブ商品数順）');
    const sortedBrands = Object.entries(brandSummary)
      .sort((a, b) => b[1].active - a[1].active)
      .slice(0, 15);
    
    sortedBrands.forEach(([brand, stats]) => {
      const percentage = stats.total > 0 ? (stats.active / stats.total * 100).toFixed(1) : 0;
      console.log(`  ${brand}: ${stats.active.toLocaleString()}件 / ${stats.total.toLocaleString()}件 (${percentage}%)`);
    });
    
    console.log('\n【人気タグTOP20】');
    topTags.forEach(([tag, count], index) => {
      console.log(`  ${index + 1}. ${tag}: ${count.toLocaleString()}件`);
    });
    
    console.log('\n【価格帯分布】');
    Object.entries(priceRanges).forEach(([range, count]) => {
      const percentage = activeCount > 0 ? (count / activeCount * 100).toFixed(1) : 0;
      console.log(`  ${range}: ${count.toLocaleString()}件 (${percentage}%)`);
    });
    
    console.log('\n' + '='.repeat(60));

  } catch (error) {
    console.error('❌ 統計情報取得エラー:', error);
  }
}

// メイン処理
async function main() {
  console.log('\n🚀 大規模商品同期システムを開始します...\n');
  console.log(`📋 対象ブランド数: ${MASSIVE_BRAND_LIST.length}ブランド`);
  console.log('🎯 目標商品数: 50,000件以上');
  console.log('🔄 インテリジェントローテーション: 有効');
  console.log('🤖 高度なタグ付けシステム: 有効\n');

  // データベース容量チェック
  const capacityCheck = await checkDatabaseCapacity();
  
  // クリーンアップが必要な場合
  if (capacityCheck.needsCleanup) {
    await cleanupDatabase();
    // 再チェック
    const newCheck = await checkDatabaseCapacity();
    if (!newCheck.canSync) {
      console.error('\n❌ クリーンアップ後も容量が不足しています');
      process.exit(1);
    }
  }

  // 同期履歴の読み込み
  const syncHistory = await loadSyncHistory();

  const syncResults = {
    totalNew: 0,
    totalUpdated: 0,
    brandResults: [],
    skippedBrands: [],
    startTime: new Date(),
    currentActiveCount: capacityCheck.activeCount
  };

  try {
    // 優先度順にブランドを処理
    const sortedBrands = MASSIVE_BRAND_LIST.sort((a, b) => a.priority - b.priority);

    for (const brand of sortedBrands) {
      console.log(`\n${'='.repeat(50)}`);
      console.log(`🏷️  ${brand.name}`);
      console.log(`  Priority: ${brand.priority} | Category: ${brand.category}`);
      console.log(`  Tags: ${brand.tags.slice(0, 5).join(', ')}...`);
      
      // 同期商品数を計算
      const targetProductCount = calculateSyncCount(
        brand, 
        syncHistory, 
        syncResults.currentActiveCount
      );
      
      console.log(`  📊 目標商品数: ${targetProductCount}件 (最大: ${brand.maxProducts}件)`);
      
      // 容量チェック
      if (syncResults.currentActiveCount + targetProductCount > 95000) {
        console.warn(`  ⚠️  容量制限により ${brand.name} をスキップします`);
        syncResults.skippedBrands.push(brand.name);
        continue;
      }
      
      let allProducts = [];
      const itemsPerPage = 30;
      const maxPages = Math.ceil(targetProductCount / itemsPerPage);
      
      // 複数ページから商品を取得
      for (let page = 1; page <= maxPages && allProducts.length < targetProductCount; page++) {
        const data = await fetchBrandProducts(brand, page);
        
        if (data?.Items && data.Items.length > 0) {
          allProducts = allProducts.concat(data.Items);
          console.log(`  📄 ページ ${page}: ${data.Items.length}件取得 (累計: ${allProducts.length}件)`);
          
          // レート制限対策（優先度に応じて調整）
          if (page < maxPages) {
            const waitTime = brand.priority <= 2 ? 1500 : 2500;
            await sleep(waitTime);
          }
        } else {
          console.log(`  📝 これ以上商品が見つかりません（ページ ${page}）`);
          break;
        }
      }

      // 目標商品数に制限
      allProducts = allProducts.slice(0, targetProductCount);

      if (allProducts.length > 0) {
        const result = await saveProducts(allProducts, brand);
        syncResults.totalNew += result.new;
        syncResults.totalUpdated += result.updated;
        syncResults.currentActiveCount += result.new;
        
        syncResults.brandResults.push({
          brand: brand.name,
          priority: brand.priority,
          category: brand.category,
          targetCount: targetProductCount,
          actualCount: allProducts.length,
          ...result
        });

        // 同期履歴を更新
        syncHistory[brand.name] = {
          syncCount: allProducts.length,
          lastSync: new Date().toISOString(),
          totalSynced: (syncHistory[brand.name]?.totalSynced || 0) + result.new,
          averageTags: 15 // 平均タグ数
        };
      }

      // ブランド間の待機（優先度に応じて）
      const brandWaitTime = brand.priority <= 2 ? 2000 : 3000;
      await sleep(brandWaitTime);
    }

    // 同期履歴を保存
    await saveSyncHistory(syncHistory);

    // インテリジェントな非アクティブ化
    await intelligentDeactivation(50000);

    // 処理時間
    const processingTime = Math.round((new Date() - syncResults.startTime) / 1000 / 60);

    // 結果サマリー
    console.log('\n' + '='.repeat(60));
    console.log('📈 同期結果サマリー');
    console.log('='.repeat(60));
    console.log(`処理時間: ${processingTime}分`);
    console.log(`新規追加: ${syncResults.totalNew.toLocaleString()}件`);
    console.log(`更新: ${syncResults.totalUpdated.toLocaleString()}件`);
    console.log(`現在のアクティブ商品数: ${syncResults.currentActiveCount.toLocaleString()}件`);
    
    if (syncResults.skippedBrands.length > 0) {
      console.log(`スキップしたブランド: ${syncResults.skippedBrands.join(', ')}`);
    }

    // カテゴリ別詳細
    console.log('\n【カテゴリ別同期結果】');
    const categoryResults = {};
    
    syncResults.brandResults.forEach(result => {
      if (!categoryResults[result.category]) {
        categoryResults[result.category] = {
          brands: 0,
          new: 0,
          updated: 0,
          total: 0
        };
      }
      categoryResults[result.category].brands++;
      categoryResults[result.category].new += result.new;
      categoryResults[result.category].updated += result.updated;
      categoryResults[result.category].total += result.actualCount;
    });

    Object.entries(categoryResults)
      .sort((a, b) => b[1].total - a[1].total)
      .forEach(([category, stats]) => {
        console.log(`  【${category}】`);
        console.log(`    ブランド数: ${stats.brands}`);
        console.log(`    新規: ${stats.new.toLocaleString()}件`);
        console.log(`    更新: ${stats.updated.toLocaleString()}件`);
        console.log(`    合計: ${stats.total.toLocaleString()}件`);
      });

    // 詳細統計表示
    await showDetailedStatistics();

  } catch (error) {
    console.error('\n❌ エラーが発生しました:', error);
    process.exit(1);
  }
}

// 実行
main().then(() => {
  console.log('\n✨ すべての処理が完了しました');
  console.log('💡 次回同期では各ブランドの商品数が自動的に調整されます');
  console.log('🎯 目標の50,000件に向けて段階的に商品数が増加します');
  process.exit(0);
}).catch((error) => {
  console.error('\n❌ 予期しないエラー:', error);
  process.exit(1);
});

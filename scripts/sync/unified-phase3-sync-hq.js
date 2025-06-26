#!/usr/bin/env node
/**
 * 統合型Phase 3商品同期スクリプト
 * 20-40代女性向け50-60ブランド対応
 * 
 * 改善版：高画質画像対応
 */

const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs').promises;

// 環境変数の読み込み
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

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

// 環境変数から同期設定を取得
const SYNC_MODE = process.env.SYNC_MODE || 'full';
const PRIORITY_FILTER = process.env.PRIORITY_FILTER || 'all';
const TARGET_AGE = process.env.TARGET_AGE || 'all';
const TARGET_BRANDS = process.env.TARGET_BRANDS || '';
const PRODUCT_LIMIT = process.env.PRODUCT_LIMIT || 'progressive';
const ENABLE_FEATURES = process.env.ENABLE_FEATURES || 'all';
const DRY_RUN = process.env.DRY_RUN === 'true';
const CURRENT_SEASON = process.env.CURRENT_SEASON || 'all';
const CAPACITY_WARNING = process.env.CAPACITY_WARNING === 'true';

// Phase 3 ブランドリスト（50-60ブランド）
const PHASE3_BRANDS = [
  // Priority 0: スーパー優先（UNIQLO, GU, 無印良品）
  { 
    name: 'UNIQLO',
    shopCode: 'uniqlo',
    priority: 0,
    tags: ['ベーシック', 'シンプル', '機能的', '定番', 'ユニセックス'],
    category: 'basic',
    targetAge: '20-45',
    priceRange: 'low-middle',
    initialProducts: 5000,
    maxProducts: 10000,
    rotationDays: 2
  },
  { 
    name: 'GU',
    shopCode: 'gu-official', 
    priority: 0,
    tags: ['トレンド', 'プチプラ', 'カジュアル', 'ファストファッション'],
    category: 'basic',
    targetAge: '20-30',
    priceRange: 'low',
    initialProducts: 4000,
    maxProducts: 8000,
    rotationDays: 2
  },
  {
    name: '無印良品',
    keywords: ['無印良品', 'MUJI'],
    priority: 0,
    tags: ['シンプル', 'ナチュラル', 'ベーシック', 'ミニマル', 'オーガニック'],
    category: 'basic',
    targetAge: '25-45',
    priceRange: 'low-middle',
    initialProducts: 3000,
    maxProducts: 6000,
    rotationDays: 3
  },

  // Priority 1: ファストファッション
  {
    name: 'ZARA',
    keywords: ['ZARA ザラ'],
    priority: 1,
    tags: ['欧州トレンド', 'モード', 'ファスト', 'トレンド', 'エッジー'],
    category: 'fast-fashion',
    targetAge: '20-35',
    priceRange: 'middle',
    initialProducts: 2000,
    maxProducts: 5000,
    rotationDays: 2
  },
  {
    name: 'H&M',
    keywords: ['H&M エイチアンドエム'],
    priority: 1,
    tags: ['北欧', 'トレンド', 'カジュアル', 'サステナブル'],
    category: 'fast-fashion',
    targetAge: '20-30',
    priceRange: 'low-middle',
    initialProducts: 2000,
    maxProducts: 5000,
    rotationDays: 2
  },
  {
    name: 'GAP',
    keywords: ['GAP ギャップ'],
    priority: 1,
    tags: ['アメカジ', 'カジュアル', 'ベーシック', 'デニム'],
    category: 'fast-fashion',
    targetAge: '20-40',
    priceRange: 'middle',
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
    priceRange: 'low',
    initialProducts: 1500,
    maxProducts: 4000,
    rotationDays: 2
  },

  // Priority 2: 人気ECブランド（20-30代向け）
  { 
    name: 'coca',
    keywords: ['coca コカ'],
    priority: 2,
    tags: ['ナチュラル', 'カジュアル', 'リラックス', '大人カジュアル'],
    category: 'ec-brand',
    targetAge: '25-35',
    priceRange: 'low-middle',
    initialProducts: 500,
    maxProducts: 2000,
    rotationDays: 3
  },
  { 
    name: 'pierrot',
    keywords: ['pierrot ピエロ'],
    priority: 2,
    tags: ['大人カジュアル', 'きれいめ', 'オフィス', 'プチプラ'],
    category: 'ec-brand',
    targetAge: '25-40',
    priceRange: 'low',
    initialProducts: 500,
    maxProducts: 2000,
    rotationDays: 3
  },
  {
    name: 'Re:EDIT',
    keywords: ['Re:EDIT リエディ'],
    priority: 2,
    tags: ['トレンド', 'モード', 'カジュアル', 'ワンマイル'],
    category: 'ec-brand',
    targetAge: '20-35',
    priceRange: 'low-middle',
    initialProducts: 400,
    maxProducts: 1500,
    rotationDays: 4
  },
  {
    name: 'fifth',
    keywords: ['fifth フィフス'],
    priority: 2,
    tags: ['韓国系', 'トレンド', 'プチプラ', 'ガーリー'],
    category: 'ec-brand',
    targetAge: '20-30',
    priceRange: 'low',
    initialProducts: 400,
    maxProducts: 1500,
    rotationDays: 4
  },
  {
    name: 'titivate',
    keywords: ['titivate ティティベイト'],
    priority: 2,
    tags: ['きれいめ', 'オフィス', '大人カジュアル', 'ママ'],
    category: 'ec-brand',
    targetAge: '25-40',
    priceRange: 'low-middle',
    initialProducts: 400,
    maxProducts: 1500,
    rotationDays: 4
  },
  {
    name: 'DHOLIC',
    keywords: ['DHOLIC ディーホリック'],
    priority: 2,
    tags: ['韓国', 'トレンド', 'フェミニン', 'モテ系'],
    category: 'ec-brand',
    targetAge: '20-30',
    priceRange: 'low-middle',
    initialProducts: 600,
    maxProducts: 2000,
    rotationDays: 3
  },

  // Priority 3: セレクトショップ（質重視）
  { 
    name: 'URBAN RESEARCH',
    keywords: ['URBAN RESEARCH アーバンリサーチ'],
    priority: 3,
    tags: ['都会的', 'セレクト', 'カジュアル', 'トレンド'],
    category: 'select',
    targetAge: '25-40',
    priceRange: 'middle',
    initialProducts: 800,
    maxProducts: 3000,
    rotationDays: 4
  },
  {
    name: 'nano・universe',
    keywords: ['nano universe ナノユニバース'],
    priority: 3,
    tags: ['都会的', 'きれいめ', 'トレンド', 'セレクト'],
    category: 'select',
    targetAge: '25-35',
    priceRange: 'middle',
    initialProducts: 600,
    maxProducts: 2500,
    rotationDays: 4
  },
  {
    name: 'BEAMS',
    keywords: ['BEAMS ビームス'],
    priority: 3,
    tags: ['セレクト', 'カジュアル', 'アメカジ', 'トラッド'],
    category: 'select',
    targetAge: '25-40',
    priceRange: 'middle-high',
    initialProducts: 1000,
    maxProducts: 4000,
    rotationDays: 5
  },
  {
    name: 'UNITED ARROWS',
    keywords: ['UNITED ARROWS ユナイテッドアローズ'],
    priority: 3,
    tags: ['上質', 'きれいめ', 'トラッド', 'セレクト'],
    category: 'select',
    targetAge: '30-45',
    priceRange: 'high',
    initialProducts: 800,
    maxProducts: 3000,
    rotationDays: 5
  },
  {
    name: 'SHIPS',
    keywords: ['SHIPS シップス'],
    priority: 3,
    tags: ['トラッド', 'マリン', 'きれいめ', 'セレクト'],
    category: 'select',
    targetAge: '25-40',
    priceRange: 'middle-high',
    initialProducts: 700,
    maxProducts: 2500,
    rotationDays: 5
  },

  // Priority 4: ライフスタイル・ナチュラル系
  {
    name: 'studio CLIP',
    keywords: ['studio CLIP スタジオクリップ'],
    priority: 4,
    tags: ['ナチュラル', 'カジュアル', 'リラックス', 'デイリー'],
    category: 'lifestyle',
    targetAge: '30-45',
    priceRange: 'low-middle',
    initialProducts: 400,
    maxProducts: 1500,
    rotationDays: 5
  },
  {
    name: 'SM2',
    keywords: ['SM2 サマンサモスモス'],
    priority: 4,
    tags: ['ナチュラル', 'ガーリー', 'レトロ', 'フォークロア'],
    category: 'lifestyle',
    targetAge: '25-40',
    priceRange: 'low-middle',
    initialProducts: 400,
    maxProducts: 1500,
    rotationDays: 5
  },
  {
    name: 'earth music&ecology',
    keywords: ['earth music ecology アース'],
    priority: 4,
    tags: ['カジュアル', 'ナチュラル', 'プチプラ', 'エコ'],
    category: 'lifestyle',
    targetAge: '20-35',
    priceRange: 'low',
    initialProducts: 500,
    maxProducts: 2000,
    rotationDays: 4
  },
  {
    name: 'GLOBAL WORK',
    keywords: ['GLOBAL WORK グローバルワーク'],
    priority: 4,
    tags: ['カジュアル', 'ファミリー', 'ベーシック', 'デイリー'],
    category: 'lifestyle',
    targetAge: '25-40',
    priceRange: 'low-middle',
    initialProducts: 600,
    maxProducts: 2500,
    rotationDays: 4
  },
  {
    name: 'niko and...',
    keywords: ['niko and ニコアンド'],
    priority: 4,
    tags: ['カジュアル', 'ライフスタイル', 'ナチュラル', '雑貨'],
    category: 'lifestyle',
    targetAge: '20-35',
    priceRange: 'low-middle',
    initialProducts: 500,
    maxProducts: 2000,
    rotationDays: 4
  },

  // Priority 5: 年齢層特化（オフィス・きれいめ）
  {
    name: 'PLST',
    keywords: ['PLST プラステ'],
    priority: 5,
    tags: ['オフィス', 'きれいめ', 'シンプル', 'ベーシック'],
    category: 'office',
    targetAge: '25-40',
    priceRange: 'middle',
    initialProducts: 500,
    maxProducts: 2000,
    rotationDays: 5
  },
  {
    name: 'vis',
    keywords: ['vis ビス'],
    priority: 5,
    tags: ['オフィス', 'フェミニン', 'きれいめ', 'OL'],
    category: 'office',
    targetAge: '25-35',
    priceRange: 'low-middle',
    initialProducts: 400,
    maxProducts: 1500,
    rotationDays: 5
  },
  {
    name: 'ROPE',
    keywords: ['ROPE ロペ'],
    priority: 5,
    tags: ['エレガント', 'オフィス', 'きれいめ', 'コンサバ'],
    category: 'office',
    targetAge: '25-40',
    priceRange: 'middle',
    initialProducts: 500,
    maxProducts: 2000,
    rotationDays: 5
  },
  {
    name: 'NATURAL BEAUTY BASIC',
    keywords: ['NATURAL BEAUTY BASIC ナチュラルビューティーベーシック'],
    priority: 5,
    tags: ['オフィス', 'きれいめ', 'ベーシック', 'コンサバ'],
    category: 'office',
    targetAge: '25-40',
    priceRange: 'middle',
    initialProducts: 400,
    maxProducts: 1500,
    rotationDays: 5
  },
  {
    name: '23区',
    keywords: ['23区 ニジュウサンク'],
    priority: 5,
    tags: ['上質', 'エレガント', 'オフィス', '大人'],
    category: 'office',
    targetAge: '30-45',
    priceRange: 'high',
    initialProducts: 300,
    maxProducts: 1200,
    rotationDays: 6
  },

  // Priority 6: トレンド・個性派
  {
    name: 'SNIDEL',
    keywords: ['SNIDEL スナイデル'],
    priority: 6,
    tags: ['トレンド', 'フェミニン', 'モテ系', 'エレガント'],
    category: 'trend',
    targetAge: '20-30',
    priceRange: 'middle-high',
    initialProducts: 400,
    maxProducts: 1500,
    rotationDays: 4
  },
  {
    name: 'FRAY I.D',
    keywords: ['FRAY ID フレイアイディー'],
    priority: 6,
    tags: ['モード', 'エレガント', 'トレンド', '個性的'],
    category: 'trend',
    targetAge: '25-35',
    priceRange: 'high',
    initialProducts: 300,
    maxProducts: 1200,
    rotationDays: 5
  },
  {
    name: 'JILL STUART',
    keywords: ['JILL STUART ジルスチュアート'],
    priority: 6,
    tags: ['ガーリー', 'フェミニン', 'ロマンティック', 'プリンセス'],
    category: 'trend',
    targetAge: '20-30',
    priceRange: 'high',
    initialProducts: 300,
    maxProducts: 1200,
    rotationDays: 5
  },
  {
    name: 'WEGO',
    keywords: ['WEGO ウィゴー'],
    priority: 6,
    tags: ['原宿系', 'ストリート', 'プチプラ', '個性的'],
    category: 'trend',
    targetAge: '18-25',
    priceRange: 'low',
    initialProducts: 500,
    maxProducts: 2000,
    rotationDays: 3
  },

  // Priority 7: 百貨店・ハイブランド（40代向け含む）
  {
    name: 'Theory',
    keywords: ['Theory セオリー'],
    priority: 7,
    tags: ['ハイブランド', 'ミニマル', 'モダン', '上質'],
    category: 'high-brand',
    targetAge: '30-45',
    priceRange: 'high',
    initialProducts: 200,
    maxProducts: 800,
    rotationDays: 7
  },
  {
    name: 'TOMORROWLAND',
    keywords: ['TOMORROWLAND トゥモローランド'],
    priority: 7,
    tags: ['ハイブランド', 'セレクト', 'モード', '上質'],
    category: 'high-brand',
    targetAge: '30-45',
    priceRange: 'high',
    initialProducts: 300,
    maxProducts: 1200,
    rotationDays: 7
  },
  {
    name: 'GALLARDAGALANTE',
    keywords: ['GALLARDAGALANTE ガリャルダガランテ'],
    priority: 7,
    tags: ['モード', 'エレガント', '大人カジュアル', '上質'],
    category: 'high-brand',
    targetAge: '30-45',
    priceRange: 'high',
    initialProducts: 200,
    maxProducts: 800,
    rotationDays: 7
  },
  {
    name: 'Spick & Span',
    keywords: ['Spick and Span スピックアンドスパン'],
    priority: 7,
    tags: ['上質', 'ベーシック', 'トラッド', 'エレガント'],
    category: 'high-brand',
    targetAge: '30-45',
    priceRange: 'high',
    initialProducts: 250,
    maxProducts: 1000,
    rotationDays: 7
  },

  // 追加ブランド（多様性確保）
  {
    name: 'COS',
    keywords: ['COS コス'],
    priority: 6,
    tags: ['ミニマル', 'モード', 'アート', '建築的'],
    category: 'trend',
    targetAge: '25-40',
    priceRange: 'middle-high',
    initialProducts: 300,
    maxProducts: 1200,
    rotationDays: 5
  },
  {
    name: 'STUDIOUS',
    keywords: ['STUDIOUS ステュディオス'],
    priority: 6,
    tags: ['モード', '日本ブランド', 'エッジー', 'セレクト'],
    category: 'trend',
    targetAge: '25-35',
    priceRange: 'middle-high',
    initialProducts: 300,
    maxProducts: 1200,
    rotationDays: 5
  },
  {
    name: 'nest Robe',
    keywords: ['nest Robe ネストローブ'],
    priority: 4,
    tags: ['ナチュラル', 'リネン', 'こだわり', '大人ナチュラル'],
    category: 'lifestyle',
    targetAge: '30-45',
    priceRange: 'middle-high',
    initialProducts: 200,
    maxProducts: 800,
    rotationDays: 6
  },
  {
    name: 'MARGARET HOWELL',
    keywords: ['MARGARET HOWELL マーガレットハウエル'],
    priority: 7,
    tags: ['英国', 'トラッド', '上質', 'タイムレス'],
    category: 'high-brand',
    targetAge: '35-45',
    priceRange: 'high',
    initialProducts: 150,
    maxProducts: 600,
    rotationDays: 7
  },
  {
    name: '17kg',
    keywords: ['17kg イチナナキログラム'],
    priority: 2,
    tags: ['韓国', 'プチプラ', 'トレンド', 'カワイイ'],
    category: 'ec-brand',
    targetAge: '18-25',
    priceRange: 'low',
    initialProducts: 400,
    maxProducts: 1500,
    rotationDays: 3
  },
  {
    name: 'coen',
    keywords: ['coen コーエン'],
    priority: 4,
    tags: ['カジュアル', 'アメカジ', 'プチプラ', 'デイリー'],
    category: 'lifestyle',
    targetAge: '20-35',
    priceRange: 'low',
    initialProducts: 400,
    maxProducts: 1500,
    rotationDays: 4
  },
  {
    name: 'INDIVI',
    keywords: ['INDIVI インディヴィ'],
    priority: 5,
    tags: ['オフィス', 'エレガント', 'きれいめ', 'キャリア'],
    category: 'office',
    targetAge: '30-45',
    priceRange: 'middle-high',
    initialProducts: 300,
    maxProducts: 1200,
    rotationDays: 5
  },
  {
    name: 'UNTITLED',
    keywords: ['UNTITLED アンタイトル'],
    priority: 5,
    tags: ['オフィス', 'コンサバ', 'きれいめ', 'ベーシック'],
    category: 'office',
    targetAge: '30-45',
    priceRange: 'middle-high',
    initialProducts: 300,
    maxProducts: 1200,
    rotationDays: 5
  },
  {
    name: 'Apuweiser-riche',
    keywords: ['Apuweiser-riche アプワイザーリッシェ'],
    priority: 6,
    tags: ['フェミニン', 'ガーリー', 'モテ系', 'お嬢様'],
    category: 'trend',
    targetAge: '20-30',
    priceRange: 'middle',
    initialProducts: 300,
    maxProducts: 1200,
    rotationDays: 5
  },
  {
    name: 'MISCH MASCH',
    keywords: ['MISCH MASCH ミッシュマッシュ'],
    priority: 6,
    tags: ['フェミニン', 'ガーリー', 'OL', 'デート'],
    category: 'trend',
    targetAge: '20-35',
    priceRange: 'middle',
    initialProducts: 300,
    maxProducts: 1200,
    rotationDays: 5
  },
  {
    name: 'ENFOLD',
    keywords: ['ENFOLD エンフォルド'],
    priority: 7,
    tags: ['モード', 'アヴァンギャルド', '建築的', 'ハイエンド'],
    category: 'high-brand',
    targetAge: '30-45',
    priceRange: 'high',
    initialProducts: 150,
    maxProducts: 600,
    rotationDays: 7
  },
  {
    name: '自由区',
    keywords: ['自由区 ジユウク'],
    priority: 7,
    tags: ['百貨店', 'エレガント', '大人', 'クラシック'],
    category: 'high-brand',
    targetAge: '35-45',
    priceRange: 'high',
    initialProducts: 200,
    maxProducts: 800,
    rotationDays: 7
  },
  {
    name: 'aquagarage',
    keywords: ['aquagarage アクアガレージ'],
    priority: 2,
    tags: ['プチプラ', 'カジュアル', 'トレンド', 'デイリー'],
    category: 'ec-brand',
    targetAge: '20-35',
    priceRange: 'low',
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
    priceRange: 'low-middle',
    initialProducts: 300,
    maxProducts: 1200,
    rotationDays: 5
  },
  {
    name: 'HOTPING',
    keywords: ['HOTPING ホットピング'],
    priority: 2,
    tags: ['韓国', 'プチプラ', 'トレンド', 'K-POP'],
    category: 'ec-brand',
    targetAge: '18-25',
    priceRange: 'low',
    initialProducts: 300,
    maxProducts: 1200,
    rotationDays: 3
  },
  {
    name: 'しまむら',
    keywords: ['しまむら シマムラ'],
    priority: 1,
    tags: ['プチプラ', 'ファミリー', 'ベーシック', '地域密着'],
    category: 'fast-fashion',
    targetAge: '20-50',
    priceRange: 'low',
    initialProducts: 1000,
    maxProducts: 3000,
    rotationDays: 3
  }
];

// 同期履歴ファイルのパス
const SYNC_HISTORY_FILE = path.join(__dirname, '..', '..', 'data', 'sync-history-phase3.json');

// メイン同期関数
async function syncProducts() {
  console.log('\n🚀 Phase 3 統合同期開始');
  console.log(`📋 設定:
  - モード: ${SYNC_MODE}
  - 優先度フィルター: ${PRIORITY_FILTER}
  - 対象年齢: ${TARGET_AGE}
  - 商品数制限: ${PRODUCT_LIMIT}
  - 機能: ${ENABLE_FEATURES}
  - 季節: ${CURRENT_SEASON}
  - ドライラン: ${DRY_RUN}
  - 容量警告: ${CAPACITY_WARNING}`);

  if (DRY_RUN) {
    console.log('\n🔍 ドライランモード - データベースへの変更は行いません');
  }

  // 同期するブランドの選択
  let brandsToSync = selectBrandsToSync();
  console.log(`\n📦 同期対象: ${brandsToSync.length}ブランド`);

  // 同期履歴の読み込み
  const syncHistory = await loadSyncHistory();
  
  let totalSynced = 0;
  let totalSuccess = 0;
  let totalFailed = 0;

  // ブランドごとに同期
  for (const brand of brandsToSync) {
    try {
      console.log(`\n🏷️  ${brand.name} の同期開始...`);
      
      // 商品数の決定
      const productCount = determineProductCount(brand, syncHistory);
      console.log(`  目標商品数: ${productCount}`);

      // 商品の取得と同期
      const synced = await syncBrandProducts(brand, productCount);
      
      totalSynced += synced;
      totalSuccess++;
      
      // 同期履歴の更新
      if (!DRY_RUN) {
        await updateSyncHistory(syncHistory, brand, synced);
      }
      
      console.log(`  ✅ ${synced}件の商品を同期`);
    } catch (error) {
      console.error(`  ❌ ${brand.name} の同期失敗:`, error.message);
      totalFailed++;
    }

    // API制限対策
    await sleep(1000);
  }

  // 同期履歴の保存
  if (!DRY_RUN) {
    await saveSyncHistory(syncHistory);
  }

  // 最終レポート
  console.log(`\n📊 同期完了レポート:
  - 成功ブランド: ${totalSuccess}
  - 失敗ブランド: ${totalFailed}
  - 同期商品数: ${totalSynced}
  - 対象年齢層: 20-40代女性
  - ブランド総数: ${PHASE3_BRANDS.length}`);
}

// ブランド選択関数（改善版：ローテーション機能追加）
function selectBrandsToSync() {
  let brands = [...PHASE3_BRANDS];

  // 日付ベースの優先度シフト（ブランド多様性の改善）
  const dayOfWeek = new Date().getDay();
  const priorityShift = dayOfWeek % 8; // 0-7の値
  
  // 優先度のローテーション適用
  brands = brands.map(brand => ({
    ...brand,
    effectivePriority: (brand.priority + priorityShift) % 8,
    originalPriority: brand.priority
  }));

  // モードによるフィルタリング
  switch (SYNC_MODE) {
    case 'mvp':
      brands = brands.filter(b => b.originalPriority <= 2);
      break;
    case 'extended':
      brands = brands.filter(b => b.originalPriority <= 4);
      break;
    case 'seasonal':
      // 季節に応じたタグを持つブランドを優先
      brands = prioritizeSeasonalBrands(brands);
      break;
    case 'age_targeted':
      // 特定年齢層向けブランドのみ
      if (TARGET_AGE !== 'all') {
        brands = brands.filter(b => b.targetAge.includes(TARGET_AGE.split('-')[0]));
      }
      break;
    case 'test':
      // テスト用に最初の5ブランドのみ
      brands = brands.slice(0, 5);
      break;
  }

  // 優先度フィルター
  if (PRIORITY_FILTER !== 'all') {
    const priority = parseInt(PRIORITY_FILTER);
    brands = brands.filter(b => b.originalPriority === priority);
  }

  // 特定ブランド指定
  if (TARGET_BRANDS) {
    const targetNames = TARGET_BRANDS.split(',').map(n => n.trim());
    brands = brands.filter(b => targetNames.includes(b.name));
  }

  // effectivePriorityでソート（ローテーション後の優先度）
  return brands.sort((a, b) => a.effectivePriority - b.effectivePriority);
}

// 季節優先ブランド選択
function prioritizeSeasonalBrands(brands) {
  const seasonalTags = {
    spring: ['春', '薄手', 'パステル', 'フローラル'],
    summer: ['夏', '涼感', 'リネン', 'マリン'],
    autumn: ['秋', 'ニット', 'チェック', 'アースカラー'],
    winter: ['冬', 'コート', 'ニット', 'ウール']
  };

  const currentTags = seasonalTags[CURRENT_SEASON] || [];
  
  return brands.sort((a, b) => {
    const aScore = a.tags.filter(tag => currentTags.some(st => tag.includes(st))).length;
    const bScore = b.tags.filter(tag => currentTags.some(st => tag.includes(st))).length;
    return bScore - aScore;
  });
}

// 商品数決定関数（改善版：容量に応じた動的調整）
function determineProductCount(brand, syncHistory) {
  const history = syncHistory[brand.name];
  const daysSinceLastSync = history ? 
    Math.floor((Date.now() - new Date(history.lastSync).getTime()) / (1000 * 60 * 60 * 24)) : 
    999;

  // 商品数制限モード
  let baseCount;
  switch (PRODUCT_LIMIT) {
    case 'minimal':
      baseCount = Math.min(brand.initialProducts, 500);
      break;
    case 'standard':
      baseCount = Math.min(brand.initialProducts * 1.5, 2000);
      break;
    case 'maximum':
      baseCount = brand.maxProducts;
      break;
    default: // progressive
      if (daysSinceLastSync >= brand.rotationDays) {
        // ローテーション期間を過ぎたら段階的に増加
        const currentCount = history?.totalProducts || 0;
        baseCount = Math.min(
          currentCount + brand.initialProducts,
          brand.maxProducts
        );
      } else {
        // 期間内なら少量の更新のみ
        baseCount = Math.floor(brand.initialProducts * 0.2);
      }
  }

  // 容量警告時は制限（改善版：優先度に応じた削減率）
  if (CAPACITY_WARNING) {
    // 優先度の低いブランドはより大幅に削減
    if (brand.priority > 5) {
      baseCount = Math.floor(baseCount * 0.2); // 80%削減
    } else if (brand.priority > 3) {
      baseCount = Math.floor(baseCount * 0.3); // 70%削減
    } else if (brand.priority > 1) {
      baseCount = Math.floor(baseCount * 0.5); // 50%削減
    } else {
      baseCount = Math.floor(baseCount * 0.7); // 30%削減（優先ブランドは削減を抑える）
    }
  }

  return Math.max(baseCount, 100); // 最低100件
}

// ブランド商品同期関数（改善版：重複防止）
async function syncBrandProducts(brand, targetCount) {
  // まず既存の商品IDを取得して重複チェック用のSetを作成
  const { data: existingProducts } = await supabase
    .from('external_products')
    .select('id')
    .eq('source_brand', brand.name)
    .eq('is_active', true);
  
  const existingProductIds = new Set(existingProducts?.map(p => p.id) || []);
  const newProductIds = new Set();
  let totalSynced = 0;
  
  // 検索キーワードの生成
  const keywords = brand.keywords || [brand.name];
  
  for (const keyword of keywords) {
    if (totalSynced >= targetCount) break;
    
    const remaining = targetCount - totalSynced;
    const products = await fetchProductsFromRakuten(keyword, remaining, brand);
    
    for (const product of products) {
      // 既存のproductIdを維持（rakuten_商品コード形式）
      // product.productIdは既にfetchProductsFromRakutenで設定済み
      
      // 重複チェック（既存商品と新規追加分の両方）
      if (existingProductIds.has(product.productId) || newProductIds.has(product.productId)) {
        continue;
      }
      
      newProductIds.add(product.productId);
      
      // 商品データの拡張
      const enhancedProduct = enhanceProductData(product, brand);
      
      // データベースへの保存（ドライランでなければ）
      if (!DRY_RUN) {
        await saveProductToDatabase(enhancedProduct);
      }
      
      totalSynced++;
    }
  }
  
  return totalSynced;
}

// 楽天APIから商品取得（高画質版・改善版：中古品除外）
async function fetchProductsFromRakuten(keyword, limit, brand) {
  const maxPerPage = 30;
  const pages = Math.ceil(limit / maxPerPage);
  let allProducts = [];

  for (let page = 1; page <= pages; page++) {
    try {
      const url = `https://app.rakuten.co.jp/services/api/IchibaItem/Search/20170706`;
      const params = {
        applicationId: rakutenAppId,
        affiliateId: rakutenAffiliateId,
        keyword: keyword,
        hits: maxPerPage,
        page: page,
        sort: '-updateTimestamp',
        genreId: '100371', // レディースファッション
        imageFlag: 1, // 画像があるもののみ
        minPrice: 1000, // 1000円以下は除外（中古品の可能性）
      };
      
      // ブランド公式ショップがある場合は優先
      if (brand.shopCode) {
        params.shopCode = brand.shopCode;
      }

      const response = await axios.get(url, { params });
      
      if (response.data.Items && response.data.Items.length > 0) {
        const products = response.data.Items
          .filter(item => {
            // 中古品フィルタリング
            const excludeKeywords = ['中古', 'USED', 'リユース', 'アウトレット', 'B級品', '訳あり', 'ジャンク'];
            const title = item.Item.itemName + ' ' + (item.Item.catchcopy || '');
            return !excludeKeywords.some(keyword => title.includes(keyword));
          })
          .map(item => {
            // 高画質画像URLの選択（優先順位）
            const imageUrl = 
              item.Item.shopOfTheYearFlag ? 
                (item.Item.mediumImageUrls[0]?.imageUrl?.replace('/128x128/', '/') || '') :
                (item.Item.mediumImageUrls[0]?.imageUrl || '');
            
            // 追加の画像URLも保存（将来的な複数画像表示用）
            const additionalImages = item.Item.mediumImageUrls
              .slice(1, 4)
              .map(img => img?.imageUrl?.replace('/128x128/', '/') || '')
              .filter(url => url);

            return {
              productId: `rakuten_${item.Item.itemCode}`,
              title: item.Item.itemName,
              price: item.Item.itemPrice,
              imageUrl: imageUrl,
              additionalImages: additionalImages,
              thumbnailUrl: item.Item.smallImageUrls[0]?.imageUrl || '', // サムネイル用
              productUrl: item.Item.itemUrl,
              shopName: item.Item.shopName,
              shopCode: item.Item.shopCode,
              catchCopy: item.Item.catchcopy || '',
              reviewAverage: item.Item.reviewAverage || 0,
              reviewCount: item.Item.reviewCount || 0,
              itemCaption: item.Item.itemCaption || '', // 商品説明
              availability: item.Item.availability || 1,
              taxFlag: item.Item.taxFlag || 0
            };
          });
        
        allProducts = allProducts.concat(products);
      }
    } catch (error) {
      console.error(`  ⚠️ ページ${page}の取得失敗:`, error.message);
    }

    await sleep(200); // API制限対策
  }

  return allProducts.slice(0, limit);
}

// 商品データの拡張
function enhanceProductData(product, brand) {
  const enhanced = {
    ...product,
    source_brand: brand.name,
    brand_priority: brand.priority,
    brand_category: brand.category,
    target_age: brand.targetAge,
    price_range: brand.priceRange,
    is_active: true,
    last_synced: new Date().toISOString()
  };

  // 機能が有効な場合の処理
  if (ENABLE_FEATURES === 'all' || ENABLE_FEATURES.includes('ml_tags')) {
    enhanced.ml_tags = generateMLTags(product, brand);
  }

  if (ENABLE_FEATURES === 'all' || ENABLE_FEATURES.includes('scoring')) {
    enhanced.recommendation_score = calculateRecommendationScore(product, brand);
  }

  if (ENABLE_FEATURES === 'all' || ENABLE_FEATURES.includes('seasonal')) {
    enhanced.seasonal_tags = generateSeasonalTags(product, CURRENT_SEASON);
  }

  return enhanced;
}

// MLタグ生成（簡易版）
function generateMLTags(product, brand) {
  const tags = [...brand.tags];
  
  // タイトルからタグ抽出
  const titleKeywords = ['ワンピース', 'スカート', 'パンツ', 'トップス', 'ニット', 'シャツ', 'ブラウス', 'コート', 'ジャケット'];
  titleKeywords.forEach(keyword => {
    if (product.title.includes(keyword)) {
      tags.push(keyword);
    }
  });

  // 価格帯タグ
  if (product.price < 3000) tags.push('プチプラ');
  else if (product.price < 10000) tags.push('お手頃');
  else if (product.price < 30000) tags.push('ミドルプライス');
  else tags.push('高級');

  // レビュータグ
  if (product.reviewAverage >= 4.5) tags.push('高評価');
  if (product.reviewCount >= 100) tags.push('人気商品');

  return [...new Set(tags)].slice(0, 30); // 最大30タグ
}

// レコメンドスコア計算（改善版：季節商品優先度強化）
function calculateRecommendationScore(product, brand) {
  let score = 50; // 基準スコア

  // ブランド優先度
  score += (7 - brand.priority) * 5;

  // レビュー評価
  score += product.reviewAverage * 5;

  // レビュー数（人気度）
  score += Math.min(product.reviewCount / 10, 20);

  // 価格適正度（ブランドの価格帯との一致度）
  const priceMatch = isPriceInRange(product.price, brand.priceRange);
  if (priceMatch) score += 10;

  // 季節適合度（改善版：季節商品に大きなボーナス）
  if (CURRENT_SEASON && CURRENT_SEASON !== 'all') {
    const seasonalTags = generateSeasonalTags(product, CURRENT_SEASON);
    // 季節キーワードのマッチ数に応じてボーナス付与
    if (seasonalTags.length > 0) {
      score += 15 + (seasonalTags.length * 5); // 基本15点 + タグ数×5点
    }
    
    // 季節外れの商品にはペナルティ
    const oppositeSeasons = {
      spring: 'autumn',
      summer: 'winter',
      autumn: 'spring',
      winter: 'summer'
    };
    const oppositeSeason = oppositeSeasons[CURRENT_SEASON];
    if (oppositeSeason) {
      const oppositeSeasonalTags = generateSeasonalTags(product, oppositeSeason);
      if (oppositeSeasonalTags.length > 0) {
        score -= oppositeSeasonalTags.length * 10; // 季節外れのペナルティ
      }
    }
  }

  return Math.min(Math.max(score, 0), 100);
}

// 価格帯チェック
function isPriceInRange(price, range) {
  const ranges = {
    'low': [0, 5000],
    'low-middle': [3000, 10000],
    'middle': [8000, 20000],
    'middle-high': [15000, 40000],
    'high': [30000, Infinity]
  };
  
  const [min, max] = ranges[range] || [0, Infinity];
  return price >= min && price <= max;
}

// 季節タグ生成
function generateSeasonalTags(product, season) {
  const seasonalKeywords = {
    spring: ['春', 'スプリング', '薄手', 'パステル', '花柄'],
    summer: ['夏', 'サマー', '涼感', 'ノースリーブ', '半袖'],
    autumn: ['秋', 'オータム', 'ニット', 'チェック', '長袖'],
    winter: ['冬', 'ウィンター', 'コート', '厚手', 'ウール']
  };

  const keywords = seasonalKeywords[season] || [];
  const tags = [];

  keywords.forEach(keyword => {
    if (product.title.includes(keyword) || product.catchCopy.includes(keyword)) {
      tags.push(keyword);
    }
  });

  return tags;
}

// 季節商品判定
function isSeasonalProduct(product, season) {
  const seasonalTags = generateSeasonalTags(product, season);
  return seasonalTags.length > 0;
}

// データベース保存（修正版）
async function saveProductToDatabase(product) {
  try {
    const { error } = await supabase
      .from('external_products')
      .upsert({
        id: product.productId, // プライマリキーはidカラム
        title: product.title,
        price: product.price,
        brand: product.shopName || product.source_brand, // brandカラムに店舗名を保存
        image_url: product.imageUrl, // 高画質画像URL
        description: product.itemCaption || product.catchCopy || '', // 商品説明
        tags: product.ml_tags || [],
        category: product.brand_category || null, // カテゴリ
        genre_id: 100371, // レディースファッションのジャンルID
        affiliate_url: product.productUrl || '', // アフィリエイトURL
        source: 'rakuten',
        source_brand: product.source_brand,
        is_active: product.is_active,
        last_synced: product.last_synced,
        // レビュー関連
        rating: product.reviewAverage || null,
        review_count: product.reviewCount || 0,
        // 優先度
        priority: product.brand_priority || 999,
        // 中古品フラグ
        is_used: false // APIから取得した商品は新品のみ
      }, {
        onConflict: 'id' // プライマリキーで競合チェック
      });

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('  DB保存エラー:', error.message);
    throw error;
  }
}

// 同期履歴の読み込み
async function loadSyncHistory() {
  try {
    const data = await fs.readFile(SYNC_HISTORY_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

// 同期履歴の更新
async function updateSyncHistory(history, brand, syncedCount) {
  if (!history[brand.name]) {
    history[brand.name] = {
      firstSync: new Date().toISOString(),
      totalProducts: 0,
      syncCount: 0
    };
  }

  history[brand.name].lastSync = new Date().toISOString();
  history[brand.name].totalProducts += syncedCount;
  history[brand.name].syncCount += 1;
}

// 同期履歴の保存
async function saveSyncHistory(history) {
  try {
    await fs.mkdir(path.dirname(SYNC_HISTORY_FILE), { recursive: true });
    await fs.writeFile(SYNC_HISTORY_FILE, JSON.stringify(history, null, 2));
  } catch (error) {
    console.error('同期履歴の保存エラー:', error);
  }
}

// スリープ関数
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// メイン実行
(async () => {
  try {
    await syncProducts();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ 同期エラー:', error);
    process.exit(1);
  }
})();

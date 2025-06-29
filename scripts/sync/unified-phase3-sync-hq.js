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

/**
 * 画像URLを最適化する関数（アプリと同じロジック）
 * 楽天の画像URLの問題を修正し、高画質版を返す
 */
function optimizeImageUrl(url) {
  // デフォルトのプレースホルダー画像（最高画質）
  const PLACEHOLDER_IMAGE = 'https://picsum.photos/800/800?grayscale';
  
  // URLが存在しない場合はプレースホルダーを返す
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return PLACEHOLDER_IMAGE;
  }
  
  let optimizedUrl = url.trim();
  
  try {
    // 1. HTTPをHTTPSに変換（必須）
    if (optimizedUrl.startsWith('http://')) {
      optimizedUrl = optimizedUrl.replace('http://', 'https://');
    }
    
    // 2. 楽天の画像URLの場合の最適化
    if (optimizedUrl.includes('rakuten.co.jp')) {
      // HTTPSへの変換は維持
      if (optimizedUrl.startsWith('http://')) {
        optimizedUrl = optimizedUrl.replace('http://', 'https://');
      }
      
      // 高画質サイズパラメータを設定（最高画質）
      if (optimizedUrl.includes('thumbnail.image.rakuten.co.jp') && optimizedUrl.includes('_ex=')) {
        // 既存のサイズパラメータを800x800に変更（最高画質）
        optimizedUrl = optimizedUrl.replace(/_ex=\d+x\d+/g, '_ex=800x800');
      } else if (optimizedUrl.includes('thumbnail.image.rakuten.co.jp') && !optimizedUrl.includes('_ex=')) {
        // サイズパラメータがない場合は追加
        optimizedUrl += optimizedUrl.includes('?') ? '&_ex=800x800' : '?_ex=800x800';
      }
    }
    
    // 3. 最終的なURL検証
    new URL(optimizedUrl); // URLとして有効かチェック
    
    return optimizedUrl;
    
  } catch (error) {
    // URLとして無効な場合はプレースホルダーを返す
    console.warn('[ImageOptimizer] Invalid URL:', url, error);
    return PLACEHOLDER_IMAGE;
  }
}

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
    targetAge: '20-35',
    priceRange: 'low-middle',
    initialProducts: 1500,
    maxProducts: 4000,
    rotationDays: 3
  },
  {
    name: 'GAP',
    keywords: ['GAP ギャップ'],
    priority: 1,
    tags: ['アメカジ', 'カジュアル', 'ベーシック', 'ファミリー'],
    category: 'fast-fashion',
    targetAge: '25-40',
    priceRange: 'low-middle',
    initialProducts: 1200,
    maxProducts: 3000,
    rotationDays: 3
  },
  {
    name: 'WEGO',
    keywords: ['WEGO ウィゴー'],
    priority: 1,
    tags: ['原宿系', 'ストリート', 'プチプラ', 'トレンド', '若者'],
    category: 'fast-fashion',
    targetAge: '20-25',
    priceRange: 'low',
    initialProducts: 1000,
    maxProducts: 3000,
    rotationDays: 3
  },

  // Priority 2: 人気ECブランド
  {
    name: 'DHOLIC',
    keywords: ['DHOLIC ディーホリック'],
    priority: 2,
    tags: ['韓国系', 'トレンド', 'プチプラ', 'フェミニン', 'オルチャン'],
    category: 'ec-brand',
    targetAge: '20-30',
    priceRange: 'low',
    initialProducts: 2000,
    maxProducts: 5000,
    rotationDays: 2
  },
  {
    name: 'fifth',
    keywords: ['fifth フィフス'],
    priority: 2,
    tags: ['トレンド', 'プチプラ', 'OL', 'フェミニン', 'きれいめ'],
    category: 'ec-brand',
    targetAge: '25-35',
    priceRange: 'low',
    initialProducts: 1000,
    maxProducts: 3000,
    rotationDays: 3
  },
  {
    name: 'pierrot',
    keywords: ['pierrot ピエロ'],
    priority: 2,
    tags: ['大人カジュアル', 'プチプラ', 'きれいめ', 'ママ'],
    category: 'ec-brand',
    targetAge: '30-40',
    priceRange: 'low',
    initialProducts: 800,
    maxProducts: 2500,
    rotationDays: 3
  },
  {
    name: 'coca',
    keywords: ['coca コカ'],
    priority: 2,
    tags: ['カジュアル', 'ナチュラル', '大人可愛い', 'プチプラ'],
    category: 'ec-brand',
    targetAge: '25-35',
    priceRange: 'low',
    initialProducts: 800,
    maxProducts: 2500,
    rotationDays: 3
  },
  {
    name: 'Re:EDIT',
    keywords: ['Re:EDIT リエディ'],
    priority: 2,
    tags: ['大人カジュアル', 'トレンド', 'モード', 'エコ'],
    category: 'ec-brand',
    targetAge: '25-40',
    priceRange: 'low-middle',
    initialProducts: 700,
    maxProducts: 2000,
    rotationDays: 4
  },
  {
    name: 'GRL',
    keywords: ['GRL グレイル'],
    priority: 2,
    tags: ['ギャル系', 'プチプラ', 'トレンド', 'セクシー'],
    category: 'ec-brand',
    targetAge: '20-30',
    priceRange: 'low',
    initialProducts: 1000,
    maxProducts: 3000,
    rotationDays: 3
  },
  {
    name: '17kg',
    keywords: ['17kg イチナナキログラム'],
    priority: 2,
    tags: ['韓国系', 'ストリート', 'オルチャン', 'プチプラ'],
    category: 'ec-brand',
    targetAge: '20-25',
    priceRange: 'low',
    initialProducts: 600,
    maxProducts: 2000,
    rotationDays: 4
  },
  {
    name: 'HOTPING',
    keywords: ['HOTPING ホッピン'],
    priority: 2,
    tags: ['韓国系', 'カジュアル', 'プチプラ', 'デイリー'],
    category: 'ec-brand',
    targetAge: '20-30',
    priceRange: 'low',
    initialProducts: 500,
    maxProducts: 1500,
    rotationDays: 4
  },

  // Priority 3: セレクトショップ
  {
    name: 'URBAN RESEARCH',
    keywords: ['URBAN RESEARCH アーバンリサーチ'],
    priority: 3,
    tags: ['セレクト', 'カジュアル', 'きれいめ', 'トレンド', '都会的'],
    category: 'select-shop',
    targetAge: '25-40',
    priceRange: 'middle',
    initialProducts: 1500,
    maxProducts: 4000,
    rotationDays: 3
  },
  {
    name: 'BEAMS',
    keywords: ['BEAMS ビームス'],
    priority: 3,
    tags: ['セレクト', 'カジュアル', 'アメカジ', 'トレンド'],
    category: 'select-shop',
    targetAge: '25-40',
    priceRange: 'middle-high',
    initialProducts: 1200,
    maxProducts: 3500,
    rotationDays: 4
  },
  {
    name: 'SHIPS',
    keywords: ['SHIPS シップス'],
    priority: 3,
    tags: ['セレクト', 'トラッド', 'きれいめ', 'コンサバ'],
    category: 'select-shop',
    targetAge: '25-40',
    priceRange: 'middle-high',
    initialProducts: 1000,
    maxProducts: 3000,
    rotationDays: 4
  },
  {
    name: 'nano・universe',
    keywords: ['nano universe ナノユニバース'],
    priority: 3,
    tags: ['セレクト', 'モード', 'きれいめ', 'トレンド'],
    category: 'select-shop',
    targetAge: '25-35',
    priceRange: 'middle',
    initialProducts: 1000,
    maxProducts: 3000,
    rotationDays: 4
  },
  {
    name: 'UNITED ARROWS',
    keywords: ['UNITED ARROWS ユナイテッドアローズ'],
    priority: 3,
    tags: ['セレクト', 'トラッド', '上質', 'きれいめ'],
    category: 'select-shop',
    targetAge: '30-45',
    priceRange: 'high',
    initialProducts: 800,
    maxProducts: 2500,
    rotationDays: 5
  },
  {
    name: 'JOURNAL STANDARD',
    keywords: ['JOURNAL STANDARD ジャーナルスタンダード'],
    priority: 3,
    tags: ['セレクト', 'アメカジ', 'カジュアル', 'ベーシック'],
    category: 'select-shop',
    targetAge: '25-40',
    priceRange: 'middle',
    initialProducts: 800,
    maxProducts: 2500,
    rotationDays: 4
  },
  {
    name: 'IENA',
    keywords: ['IENA イエナ'],
    priority: 3,
    tags: ['セレクト', 'フレンチ', 'エレガント', '大人'],
    category: 'select-shop',
    targetAge: '30-45',
    priceRange: 'middle-high',
    initialProducts: 700,
    maxProducts: 2000,
    rotationDays: 5
  },
  {
    name: 'Spick and Span',
    keywords: ['Spick and Span スピックアンドスパン'],
    priority: 3,
    tags: ['セレクト', 'ベーシック', 'きれいめ', 'トラッド'],
    category: 'select-shop',
    targetAge: '25-40',
    priceRange: 'middle-high',
    initialProducts: 600,
    maxProducts: 1800,
    rotationDays: 5
  },
  {
    name: 'FREAK\'S STORE',
    keywords: ['FREAKS STORE フリークスストア'],
    priority: 3,
    tags: ['セレクト', 'カジュアル', 'アメカジ', 'ストリート'],
    category: 'select-shop',
    targetAge: '20-35',
    priceRange: 'middle',
    initialProducts: 600,
    maxProducts: 1800,
    rotationDays: 4
  },

  // Priority 4: ライフスタイルブランド
  {
    name: 'GLOBAL WORK',
    keywords: ['GLOBAL WORK グローバルワーク'],
    priority: 4,
    tags: ['カジュアル', 'ファミリー', 'ベーシック', 'お手頃'],
    category: 'lifestyle',
    targetAge: '25-40',
    priceRange: 'low-middle',
    initialProducts: 1000,
    maxProducts: 3000,
    rotationDays: 3
  },
  {
    name: 'LOWRYS FARM',
    keywords: ['LOWRYS FARM ローリーズファーム'],
    priority: 4,
    tags: ['カジュアル', 'ガーリー', 'フェミニン', 'トレンド'],
    category: 'lifestyle',
    targetAge: '20-30',
    priceRange: 'low-middle',
    initialProducts: 800,
    maxProducts: 2500,
    rotationDays: 3
  },
  {
    name: 'studio CLIP',
    keywords: ['studio CLIP スタディオクリップ'],
    priority: 4,
    tags: ['ナチュラル', 'カジュアル', 'リラックス', 'ママ'],
    category: 'lifestyle',
    targetAge: '30-40',
    priceRange: 'low-middle',
    initialProducts: 600,
    maxProducts: 2000,
    rotationDays: 4
  },
  {
    name: 'SM2',
    keywords: ['SM2 サマンサモスモス'],
    priority: 4,
    tags: ['ナチュラル', 'ガーリー', 'レトロ', 'ゆったり'],
    category: 'lifestyle',
    targetAge: '25-40',
    priceRange: 'low-middle',
    initialProducts: 600,
    maxProducts: 2000,
    rotationDays: 4
  },
  {
    name: 'NICE CLAUP',
    keywords: ['NICE CLAUP ナイスクラップ'],
    priority: 4,
    tags: ['カジュアル', 'ガーリー', 'トレンド', '若者'],
    category: 'lifestyle',
    targetAge: '20-25',
    priceRange: 'low',
    initialProducts: 500,
    maxProducts: 1500,
    rotationDays: 4
  },
  {
    name: 'OLIVE des OLIVE',
    keywords: ['OLIVE des OLIVE オリーブデオリーブ'],
    priority: 4,
    tags: ['ガーリー', 'フェミニン', 'スクール', '清楚'],
    category: 'lifestyle',
    targetAge: '20-25',
    priceRange: 'low-middle',
    initialProducts: 400,
    maxProducts: 1200,
    rotationDays: 5
  },
  {
    name: 'earth music&ecology',
    keywords: ['earth music ecology アースミュージックエコロジー'],
    priority: 4,
    tags: ['ナチュラル', 'カジュアル', 'エコ', 'プチプラ'],
    category: 'lifestyle',
    targetAge: '20-30',
    priceRange: 'low',
    initialProducts: 800,
    maxProducts: 2500,
    rotationDays: 3
  },
  {
    name: 'nest Robe',
    keywords: ['nest Robe ネストローブ'],
    priority: 4,
    tags: ['ナチュラル', 'リネン', 'シンプル', '大人カジュアル'],
    category: 'lifestyle',
    targetAge: '30-45',
    priceRange: 'middle',
    initialProducts: 400,
    maxProducts: 1500,
    rotationDays: 5
  },

  // Priority 5: オフィス・きれいめブランド
  {
    name: 'PLST',
    keywords: ['PLST プラステ'],
    priority: 5,
    tags: ['オフィス', 'きれいめ', 'シンプル', 'ベーシック'],
    category: 'office',
    targetAge: '25-40',
    priceRange: 'low-middle',
    initialProducts: 800,
    maxProducts: 2500,
    rotationDays: 3
  },
  {
    name: 'vis',
    keywords: ['vis ビス'],
    priority: 5,
    tags: ['OL', 'オフィス', 'フェミニン', 'きれいめ'],
    category: 'office',
    targetAge: '25-35',
    priceRange: 'low-middle',
    initialProducts: 600,
    maxProducts: 2000,
    rotationDays: 4
  },
  {
    name: 'ROPE\'',
    keywords: ['ROPE ロペ'],
    priority: 5,
    tags: ['オフィス', 'コンサバ', 'エレガント', 'きれいめ'],
    category: 'office',
    targetAge: '25-40',
    priceRange: 'middle',
    initialProducts: 600,
    maxProducts: 2000,
    rotationDays: 4
  },
  {
    name: 'NATURAL BEAUTY BASIC',
    keywords: ['NATURAL BEAUTY BASIC ナチュラルビューティーベーシック'],
    priority: 5,
    tags: ['オフィス', 'きれいめ', 'コンサバ', 'ベーシック'],
    category: 'office',
    targetAge: '25-35',
    priceRange: 'middle',
    initialProducts: 500,
    maxProducts: 1500,
    rotationDays: 4
  },
  {
    name: 'INED',
    keywords: ['INED イネド'],
    priority: 5,
    tags: ['オフィス', 'エレガント', 'きれいめ', '大人'],
    category: 'office',
    targetAge: '30-45',
    priceRange: 'middle-high',
    initialProducts: 400,
    maxProducts: 1500,
    rotationDays: 5
  },
  {
    name: '23区',
    keywords: ['23区 ニジュウサンク'],
    priority: 5,
    tags: ['オフィス', 'コンサバ', 'クラシック', '上品'],
    category: 'office',
    targetAge: '30-45',
    priceRange: 'middle-high',
    initialProducts: 400,
    maxProducts: 1500,
    rotationDays: 5
  },
  {
    name: 'ICB',
    keywords: ['ICB アイシービー'],
    priority: 5,
    tags: ['キャリア', 'モダン', 'シャープ', 'オフィス'],
    category: 'office',
    targetAge: '30-45',
    priceRange: 'high',
    initialProducts: 300,
    maxProducts: 1200,
    rotationDays: 6
  },
  {
    name: 'Reflect',
    keywords: ['Reflect リフレクト'],
    priority: 5,
    tags: ['オフィス', 'コンサバ', 'フェミニン', 'きれいめ'],
    category: 'office',
    targetAge: '25-40',
    priceRange: 'middle',
    initialProducts: 400,
    maxProducts: 1500,
    rotationDays: 5
  },
  {
    name: 'green label relaxing',
    keywords: ['green label relaxing グリーンレーベルリラクシング'],
    priority: 5,
    tags: ['きれいめカジュアル', 'オフィス', 'ベーシック', 'リラックス'],
    category: 'office',
    targetAge: '25-40',
    priceRange: 'middle',
    initialProducts: 600,
    maxProducts: 2000,
    rotationDays: 4
  },
  {
    name: 'OPAQUE.CLIP',
    keywords: ['OPAQUE CLIP オペークドットクリップ'],
    priority: 5,
    tags: ['オフィス', 'カジュアル', 'きれいめ', 'プチプラ'],
    category: 'office',
    targetAge: '25-35',
    priceRange: 'low-middle',
    initialProducts: 500,
    maxProducts: 1500,
    rotationDays: 4
  },
  {
    name: 'any SiS',
    keywords: ['any SiS エニィスィス'],
    priority: 5,
    tags: ['フェミニン', 'きれいめ', 'コンサバ', 'OL'],
    category: 'office',
    targetAge: '20-30',
    priceRange: 'middle',
    initialProducts: 400,
    maxProducts: 1500,
    rotationDays: 5
  },
  {
    name: 'any FAM',
    keywords: ['any FAM エニィファム'],
    priority: 5,
    tags: ['ファミリー', 'カジュアル', 'きれいめ', 'ママ'],
    category: 'office',
    targetAge: '30-40',
    priceRange: 'low-middle',
    initialProducts: 400,
    maxProducts: 1500,
    rotationDays: 5
  },

  // Priority 6: トレンド・個性派ブランド
  {
    name: 'snidel',
    keywords: ['snidel スナイデル'],
    priority: 6,
    tags: ['フェミニン', 'モード', 'ガーリー', 'トレンド'],
    category: 'trend',
    targetAge: '20-30',
    priceRange: 'middle-high',
    initialProducts: 500,
    maxProducts: 2000,
    rotationDays: 4
  },
  {
    name: 'FRAY I.D',
    keywords: ['FRAY ID フレイアイディー'],
    priority: 6,
    tags: ['モード', 'フェミニン', 'エレガント', 'トレンド'],
    category: 'trend',
    targetAge: '25-35',
    priceRange: 'middle-high',
    initialProducts: 400,
    maxProducts: 1500,
    rotationDays: 5
  },
  {
    name: 'JILL STUART',
    keywords: ['JILL STUART ジルスチュアート'],
    priority: 6,
    tags: ['フェミニン', 'ガーリー', 'ロマンティック', 'プリンセス'],
    category: 'trend',
    targetAge: '20-30',
    priceRange: 'middle-high',
    initialProducts: 400,
    maxProducts: 1500,
    rotationDays: 5
  },
  {
    name: 'MERCURYDUO',
    keywords: ['MERCURYDUO マーキュリーデュオ'],
    priority: 6,
    tags: ['フェミニン', 'セクシー', 'モード', 'パーティー'],
    category: 'trend',
    targetAge: '20-30',
    priceRange: 'middle',
    initialProducts: 400,
    maxProducts: 1500,
    rotationDays: 5
  },
  {
    name: 'EMODA',
    keywords: ['EMODA エモダ'],
    priority: 6,
    tags: ['モード', 'エッジー', 'ストリート', 'クール'],
    category: 'trend',
    targetAge: '20-30',
    priceRange: 'middle',
    initialProducts: 400,
    maxProducts: 1500,
    rotationDays: 4
  },
  {
    name: 'SLY',
    keywords: ['SLY スライ'],
    priority: 6,
    tags: ['ギャル', 'セクシー', 'クール', 'ストリート'],
    category: 'trend',
    targetAge: '20-30',
    priceRange: 'middle',
    initialProducts: 400,
    maxProducts: 1500,
    rotationDays: 4
  },
  {
    name: 'moussy',
    keywords: ['moussy マウジー'],
    priority: 6,
    tags: ['デニム', 'カジュアル', 'クール', 'ストリート'],
    category: 'trend',
    targetAge: '20-35',
    priceRange: 'middle',
    initialProducts: 400,
    maxProducts: 1500,
    rotationDays: 4
  },
  {
    name: 'MURUA',
    keywords: ['MURUA ムルーア'],
    priority: 6,
    tags: ['モード', 'エッジー', 'セクシー', 'クール'],
    category: 'trend',
    targetAge: '20-30',
    priceRange: 'middle',
    initialProducts: 300,
    maxProducts: 1200,
    rotationDays: 5
  },
  {
    name: 'dazzlin',
    keywords: ['dazzlin ダズリン'],
    priority: 6,
    tags: ['ガーリー', 'フェミニン', 'カジュアル', 'デート'],
    category: 'trend',
    targetAge: '20-25',
    priceRange: 'low-middle',
    initialProducts: 300,
    maxProducts: 1200,
    rotationDays: 5
  },
  {
    name: 'LILY BROWN',
    keywords: ['LILY BROWN リリーブラウン'],
    priority: 6,
    tags: ['レトロ', 'ヴィンテージ', 'フェミニン', '個性的'],
    category: 'trend',
    targetAge: '20-30',
    priceRange: 'middle',
    initialProducts: 300,
    maxProducts: 1200,
    rotationDays: 5
  },
  {
    name: 'STUDIOUS',
    keywords: ['STUDIOUS ステュディオス'],
    priority: 6,
    tags: ['モード', 'ドメスティック', 'アヴァンギャルド', 'デザイナーズ'],
    category: 'trend',
    targetAge: '25-40',
    priceRange: 'high',
    initialProducts: 300,
    maxProducts: 1200,
    rotationDays: 6
  },
  {
    name: 'PAMEO POSE',
    keywords: ['PAMEO POSE パメオポーズ'],
    priority: 6,
    tags: ['個性的', 'アート', 'モード', 'デザイナーズ'],
    category: 'trend',
    targetAge: '20-35',
    priceRange: 'middle-high',
    initialProducts: 200,
    maxProducts: 800,
    rotationDays: 6
  },
  {
    name: 'CELFORD',
    keywords: ['CELFORD セルフォード'],
    priority: 6,
    tags: ['エレガント', 'フェミニン', 'パーティー', '上品'],
    category: 'trend',
    targetAge: '25-40',
    priceRange: 'middle-high',
    initialProducts: 300,
    maxProducts: 1200,
    rotationDays: 5
  },
  {
    name: 'Mila Owen',
    keywords: ['Mila Owen ミラオーウェン'],
    priority: 6,
    tags: ['モード', 'ベーシック', 'きれいめ', 'トレンド'],
    category: 'trend',
    targetAge: '25-35',
    priceRange: 'middle',
    initialProducts: 400,
    maxProducts: 1500,
    rotationDays: 4
  },
  {
    name: 'TODAYFUL',
    keywords: ['TODAYFUL トゥデイフル'],
    priority: 6,
    tags: ['カジュアル', 'リラックス', 'モード', 'ナチュラル'],
    category: 'trend',
    targetAge: '25-35',
    priceRange: 'middle-high',
    initialProducts: 300,
    maxProducts: 1200,
    rotationDays: 5
  },
  {
    name: 'AMERI',
    keywords: ['AMERI アメリ'],
    priority: 6,
    tags: ['モード', '個性的', 'ヴィンテージ', 'アート'],
    category: 'trend',
    targetAge: '25-35',
    priceRange: 'middle-high',
    initialProducts: 200,
    maxProducts: 800,
    rotationDays: 6
  },
  {
    name: 'CLANE',
    keywords: ['CLANE クラネ'],
    priority: 6,
    tags: ['モード', '建築的', 'ミニマル', 'アヴァンギャルド'],
    category: 'trend',
    targetAge: '25-40',
    priceRange: 'high',
    initialProducts: 200,
    maxProducts: 800,
    rotationDays: 6
  },
  {
    name: 'RIM.ARK',
    keywords: ['RIM.ARK リムアーク'],
    priority: 6,
    tags: ['モード', 'ミニマル', 'エッジー', 'コンテンポラリー'],
    category: 'trend',
    targetAge: '25-40',
    priceRange: 'middle-high',
    initialProducts: 200,
    maxProducts: 800,
    rotationDays: 6
  },
  {
    name: 'Ungrid',
    keywords: ['Ungrid アングリッド'],
    priority: 6,
    tags: ['カジュアル', 'デニム', 'ヴィンテージ', 'リラックス'],
    category: 'trend',
    targetAge: '25-35',
    priceRange: 'middle',
    initialProducts: 300,
    maxProducts: 1200,
    rotationDays: 5
  },
  {
    name: 'AZUL by moussy',
    keywords: ['AZUL by moussy アズールバイマウジー'],
    priority: 6,
    tags: ['カジュアル', 'デニム', 'サーフ', 'リラックス'],
    category: 'trend',
    targetAge: '20-35',
    priceRange: 'low-middle',
    initialProducts: 400,
    maxProducts: 1500,
    rotationDays: 4
  },
  {
    name: 'rienda',
    keywords: ['rienda リエンダ'],
    priority: 6,
    tags: ['セクシー', 'ゴージャス', 'パーティー', 'リゾート'],
    category: 'trend',
    targetAge: '20-30',
    priceRange: 'middle',
    initialProducts: 300,
    maxProducts: 1200,
    rotationDays: 5
  },
  {
    name: 'GYDA',
    keywords: ['GYDA ジェイダ'],
    priority: 6,
    tags: ['ストリート', 'セクシー', 'クール', 'ギャル'],
    category: 'trend',
    targetAge: '20-30',
    priceRange: 'middle',
    initialProducts: 300,
    maxProducts: 1200,
    rotationDays: 5
  },
  {
    name: 'LAGUA GEM',
    keywords: ['LAGUA GEM ラグアジェム'],
    priority: 6,
    tags: ['エスニック', 'ボヘミアン', 'リゾート', '個性的'],
    category: 'trend',
    targetAge: '25-40',
    priceRange: 'middle',
    initialProducts: 200,
    maxProducts: 800,
    rotationDays: 6
  },
  {
    name: 'jouetie',
    keywords: ['jouetie ジュエティ'],
    priority: 6,
    tags: ['原宿系', 'ストリート', 'カジュアル', '個性的'],
    category: 'trend',
    targetAge: '20-30',
    priceRange: 'low-middle',
    initialProducts: 300,
    maxProducts: 1200,
    rotationDays: 5
  },
  {
    name: 'X-girl',
    keywords: ['X-girl エックスガール'],
    priority: 6,
    tags: ['ストリート', 'スケーター', 'カジュアル', 'スポーティー'],
    category: 'trend',
    targetAge: '20-30',
    priceRange: 'middle',
    initialProducts: 300,
    maxProducts: 1200,
    rotationDays: 5
  },
  {
    name: 'MILKFED.',
    keywords: ['MILKFED ミルクフェド'],
    priority: 6,
    tags: ['ストリート', 'カジュアル', 'ガーリー', 'スポーティー'],
    category: 'trend',
    targetAge: '20-30',
    priceRange: 'middle',
    initialProducts: 300,
    maxProducts: 1200,
    rotationDays: 5
  },
  {
    name: 'PAGEBOY',
    keywords: ['PAGEBOY ページボーイ'],
    priority: 4,
    tags: ['カジュアル', 'ベーシック', 'プチプラ', 'デイリー'],
    category: 'lifestyle',
    targetAge: '20-30',
    priceRange: 'low',
    initialProducts: 400,
    maxProducts: 1500,
    rotationDays: 4
  },
  {
    name: 'Heather',
    keywords: ['Heather ヘザー'],
    priority: 4,
    tags: ['カジュアル', 'ガーリー', 'プチプラ', 'トレンド'],
    category: 'lifestyle',
    targetAge: '20-25',
    priceRange: 'low',
    initialProducts: 400,
    maxProducts: 1500,
    rotationDays: 4
  },
  {
    name: 'Kastane',
    keywords: ['Kastane カスタネ'],
    priority: 4,
    tags: ['カジュアル', 'ナチュラル', 'ヴィンテージ', 'リラックス'],
    category: 'lifestyle',
    targetAge: '20-35',
    priceRange: 'low-middle',
    initialProducts: 400,
    maxProducts: 1500,
    rotationDays: 4
  },
  {
    name: 'mystic',
    keywords: ['mystic ミスティック'],
    priority: 4,
    tags: ['カジュアル', 'モード', 'シンプル', 'ベーシック'],
    category: 'lifestyle',
    targetAge: '25-35',
    priceRange: 'low-middle',
    initialProducts: 400,
    maxProducts: 1500,
    rotationDays: 4
  },
  {
    name: 'who\'s who Chico',
    keywords: ['whos who Chico フーズフーチコ'],
    priority: 4,
    tags: ['カジュアル', 'ヴィンテージ', 'ナチュラル', 'リラックス'],
    category: 'lifestyle',
    targetAge: '20-30',
    priceRange: 'low-middle',
    initialProducts: 400,
    maxProducts: 1500,
    rotationDays: 4
  },
  {
    name: 'CIAOPANIC',
    keywords: ['CIAOPANIC チャオパニック'],
    priority: 4,
    tags: ['カジュアル', 'アメカジ', 'ベーシック', 'ユニセックス'],
    category: 'lifestyle',
    targetAge: '20-35',
    priceRange: 'low-middle',
    initialProducts: 400,
    maxProducts: 1500,
    rotationDays: 4
  },
  {
    name: 'CIAOPANIC TYPY',
    keywords: ['CIAOPANIC TYPY チャオパニックティピー'],
    priority: 4,
    tags: ['ナチュラル', 'エスニック', 'リラックス', 'ボヘミアン'],
    category: 'lifestyle',
    targetAge: '25-40',
    priceRange: 'low-middle',
    initialProducts: 400,
    maxProducts: 1500,
    rotationDays: 4
  },
  {
    name: 'LEPSIM',
    keywords: ['LEPSIM レプシィム'],
    priority: 4,
    tags: ['カジュアル', 'ベーシック', 'プチプラ', 'デイリー'],
    category: 'lifestyle',
    targetAge: '20-35',
    priceRange: 'low',
    initialProducts: 500,
    maxProducts: 1800,
    rotationDays: 3
  },
  {
    name: 'JEANASIS',
    keywords: ['JEANASIS ジーナシス'],
    priority: 4,
    tags: ['カジュアル', 'モード', 'エッジー', 'ベーシック'],
    category: 'lifestyle',
    targetAge: '20-35',
    priceRange: 'low-middle',
    initialProducts: 500,
    maxProducts: 1800,
    rotationDays: 3
  },
  {
    name: 'Discoat',
    keywords: ['Discoat ディスコート'],
    priority: 4,
    tags: ['カジュアル', 'ナチュラル', 'プチプラ', 'リラックス'],
    category: 'lifestyle',
    targetAge: '20-35',
    priceRange: 'low',
    initialProducts: 400,
    maxProducts: 1500,
    rotationDays: 4
  },
  {
    name: 'niko and...',
    keywords: ['niko and ニコアンド'],
    priority: 4,
    tags: ['カジュアル', 'ナチュラル', 'ライフスタイル', 'ユニセックス'],
    category: 'lifestyle',
    targetAge: '25-40',
    priceRange: 'low-middle',
    initialProducts: 500,
    maxProducts: 1800,
    rotationDays: 3
  },
  {
    name: 'CRAFT STANDARD BOUTIQUE',
    keywords: ['CRAFT STANDARD BOUTIQUE クラフトスタンダードブティック'],
    priority: 4,
    tags: ['ベーシック', 'シンプル', 'ナチュラル', 'エシカル'],
    category: 'lifestyle',
    targetAge: '25-40',
    priceRange: 'middle',
    initialProducts: 300,
    maxProducts: 1200,
    rotationDays: 5
  },
  {
    name: 'KBF',
    keywords: ['KBF ケービーエフ'],
    priority: 4,
    tags: ['カジュアル', 'ナチュラル', 'モード', 'リラックス'],
    category: 'lifestyle',
    targetAge: '25-35',
    priceRange: 'middle',
    initialProducts: 400,
    maxProducts: 1500,
    rotationDays: 4
  },
  {
    name: 'SENSE OF PLACE',
    keywords: ['SENSE OF PLACE センスオブプレイス'],
    priority: 4,
    tags: ['カジュアル', 'トレンド', 'ベーシック', 'プチプラ'],
    category: 'lifestyle',
    targetAge: '20-35',
    priceRange: 'low',
    initialProducts: 500,
    maxProducts: 1800,
    rotationDays: 3
  },
  {
    name: 'apart by lowrys',
    keywords: ['apart by lowrys アパートバイローリーズ'],
    priority: 4,
    tags: ['カジュアル', 'フェミニン', 'ナチュラル', 'リラックス'],
    category: 'lifestyle',
    targetAge: '25-35',
    priceRange: 'low-middle',
    initialProducts: 400,
    maxProducts: 1500,
    rotationDays: 4
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
    name: 'COS',
    keywords: ['COS コス'],
    priority: 7,
    tags: ['ミニマル', 'モード', '建築的', 'モダン'],
    category: 'high-brand',
    targetAge: '25-45',
    priceRange: 'middle-high',
    initialProducts: 200,
    maxProducts: 800,
    rotationDays: 6
  },
  {
    name: 'Theory',
    keywords: ['Theory セオリー'],
    priority: 7,
    tags: ['モダン', 'シャープ', 'オフィス', 'ハイクオリティ'],
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
    tags: ['トラッド', 'エレガント', '上質', 'インポート'],
    category: 'high-brand',
    targetAge: '30-45',
    priceRange: 'high',
    initialProducts: 200,
    maxProducts: 800,
    rotationDays: 7
  },
  {
    name: 'GALLARDAGALANTE',
    keywords: ['GALLARDAGALANTE ガリャルダガランテ'],
    priority: 7,
    tags: ['エレガント', 'モード', 'フェミニン', '上質'],
    category: 'high-brand',
    targetAge: '30-45',
    priceRange: 'high',
    initialProducts: 150,
    maxProducts: 600,
    rotationDays: 7
  }
];

// 同期履歴の読み込み
async function loadSyncHistory() {
  const historyPath = path.join(__dirname, '..', '..', 'data', 'sync-history.json');
  try {
    await fs.access(historyPath);
    const data = await fs.readFile(historyPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
}

// 同期履歴の保存
async function saveSyncHistory(history) {
  const dataDir = path.join(__dirname, '..', '..', 'data');
  const historyPath = path.join(dataDir, 'sync-history.json');
  
  try {
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(historyPath, JSON.stringify(history, null, 2));
  } catch (error) {
    console.error('同期履歴の保存に失敗:', error);
  }
}

// ブランド選択とローテーション
function selectBrands(allBrands, syncHistory) {
  let brands = [...allBrands];
  
  // 各ブランドの実効優先度を計算
  brands = brands.map(brand => {
    const history = syncHistory[brand.name];
    let effectivePriority = brand.priority;
    
    if (history) {
      const daysSinceLastSync = Math.floor(
        (Date.now() - new Date(history.lastSync).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      // ローテーション期間を過ぎたブランドは優先度を上げる
      if (daysSinceLastSync >= brand.rotationDays) {
        effectivePriority = Math.max(0, brand.priority - 2);
      } else if (daysSinceLastSync >= brand.rotationDays * 0.7) {
        effectivePriority = Math.max(0, brand.priority - 1);
      }
    } else {
      // 未同期のブランドは優先
      effectivePriority = Math.max(0, brand.priority - 1);
    }
    
    return {
      ...brand,
      originalPriority: brand.priority,
      effectivePriority,
      daysSinceLastSync: history ? 
        Math.floor((Date.now() - new Date(history.lastSync).getTime()) / (1000 * 60 * 60 * 24)) : 
        999
    };
  });

  // 同期モードによる選択
  switch (SYNC_MODE) {
    case 'mvp':
      // MVP: 優先度0-2のブランドのみ（約15ブランド）
      brands = brands.filter(b => b.originalPriority <= 2);
      break;
    case 'extended':
      // 拡張MVP: 優先度0-4のブランド（約30ブランド）
      brands = brands.filter(b => b.originalPriority <= 4);
      break;
    case 'seasonal':
      // 季節商品優先
      brands = prioritizeSeasonalBrands(brands);
      break;
    case 'age_targeted':
      // 年代別最適化
      if (TARGET_AGE && TARGET_AGE !== 'all') {
        brands = brands.filter(b => {
          const [minAge, maxAge] = TARGET_AGE.split('-').map(Number);
          const brandAges = b.targetAge.split('-').map(Number);
          return brandAges[0] <= maxAge && brandAges[1] >= minAge;
        });
      }
      break;
    case 'test':
      // テストモード: 最初の5ブランドのみ
      brands = brands.slice(0, 5);
      break;
    // 'full'の場合は全ブランドを対象とする
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
            // 高画質画像URLの選択と最適化
            let imageUrl = '';
            
            // 1. mediumImageUrlsがある場合は最初のURLを使用（通常300x300程度）
            if (item.Item.mediumImageUrls && item.Item.mediumImageUrls.length > 0) {
              const mediumUrl = item.Item.mediumImageUrls[0];
              // オブジェクト形式の場合と文字列形式の場合に対応
              imageUrl = typeof mediumUrl === 'string' ? mediumUrl : mediumUrl.imageUrl || '';
            }
            // 2. imageUrlがある場合（通常128x128）
            else if (item.Item.imageUrl) {
              imageUrl = item.Item.imageUrl;
            }
            // 3. smallImageUrlsがある場合（通常64x64）
            else if (item.Item.smallImageUrls && item.Item.smallImageUrls.length > 0) {
              const smallUrl = item.Item.smallImageUrls[0];
              imageUrl = typeof smallUrl === 'string' ? smallUrl : smallUrl.imageUrl || '';
            }
            
            // 画像URLを最適化（アプリと同じロジック）
            imageUrl = optimizeImageUrl(imageUrl);
            
            // 追加の画像URLも最適化して保存（将来的な複数画像表示用）
            const additionalImages = item.Item.mediumImageUrls
              .slice(1, 4)
              .map(img => {
                const url = typeof img === 'string' ? img : img?.imageUrl || '';
                return optimizeImageUrl(url);
              })
              .filter(url => url && !url.includes('picsum.photos')); // プレースホルダーを除外

            return {
              productId: `rakuten_${item.Item.itemCode}`,
              title: item.Item.itemName,
              price: item.Item.itemPrice,
              imageUrl: imageUrl,
              additionalImages: additionalImages,
              thumbnailUrl: optimizeImageUrl(item.Item.smallImageUrls[0]?.imageUrl || ''), // サムネイル用も最適化
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
    const oppositeSeasonalTags = generateSeasonalTags(product, oppositeSeason);
    if (oppositeSeasonalTags.length > 0) {
      score -= 10 + (oppositeSeasonalTags.length * 3); // ペナルティ
    }
  }

  return Math.max(0, Math.min(100, score)); // 0-100の範囲に正規化
}

// 季節タグ生成（改善版：より詳細な季節キーワード）
function generateSeasonalTags(product, season) {
  const seasonalKeywords = {
    spring: [
      '春', '薄手', 'ライト', 'パステル', 'フローラル', '花柄',
      'トレンチ', 'スプリングコート', 'カーディガン', '七分袖',
      'ブラウス', 'シフォン', 'レース', '桜', 'ピンク'
    ],
    summer: [
      '夏', '涼感', '涼しい', 'クール', 'リネン', '麻',
      'ノースリーブ', '半袖', 'サンダル', 'ショートパンツ',
      'キャミソール', 'タンクトップ', 'サマー', 'マリン',
      'ボーダー', 'ホワイト', 'UV', '日焼け'
    ],
    autumn: [
      '秋', 'ニット', 'セーター', 'チェック', 'タータン',
      'ブラウン', 'ボルドー', 'カーキ', 'アースカラー',
      '長袖', 'ブーツ', 'ジャケット', 'コーデュロイ',
      'スエード', 'ファー', 'ウール'
    ],
    winter: [
      '冬', 'コート', 'ダウン', 'ファー', 'ボア', 'フリース',
      'ニット', 'セーター', 'タートルネック', 'マフラー',
      '手袋', 'ブーツ', '防寒', 'あったか', '暖かい',
      'ウール', 'カシミヤ', 'モヘア'
    ]
  };

  const keywords = seasonalKeywords[season] || [];
  const tags = [];

  const searchText = `${product.title} ${product.catchCopy} ${product.itemCaption}`.toLowerCase();
  
  keywords.forEach(keyword => {
    if (searchText.includes(keyword.toLowerCase())) {
      tags.push(keyword);
    }
  });

  return [...new Set(tags)];
}

// 価格帯チェック
function isPriceInRange(price, range) {
  const ranges = {
    'low': [0, 5000],
    'low-middle': [3000, 15000],
    'middle': [8000, 30000],
    'middle-high': [20000, 50000],
    'high': [30000, Infinity]
  };
  
  const [min, max] = ranges[range] || [0, Infinity];
  return price >= min && price <= max;
}

// データベースへの保存（改善版：バッチ処理）
const productBatch = [];
const BATCH_SIZE = 100;

async function saveProductToDatabase(product) {
  productBatch.push({
    id: product.productId,
    title: product.title,
    price: product.price,
    image_url: product.imageUrl,
    product_url: product.productUrl,
    brand: product.shopName,
    tags: product.ml_tags || [],
    source: 'rakuten',
    source_brand: product.source_brand,
    source_category: product.brand_category,
    brand_priority: product.brand_priority,
    target_age: product.target_age,
    price_range: product.price_range,
    is_active: true,
    recommendation_score: product.recommendation_score || 50,
    review_average: product.reviewAverage,
    review_count: product.reviewCount,
    seasonal_tags: product.seasonal_tags || [],
    last_synced: product.last_synced,
    created_at: new Date().toISOString(),
    
    // 追加フィールド（高画質版）
    additional_images: product.additionalImages || [],
    thumbnail_url: product.thumbnailUrl || '',
    catch_copy: product.catchCopy || '',
    item_caption: product.itemCaption || '',
    availability: product.availability || 1,
    tax_flag: product.taxFlag || 0,
    shop_code: product.shopCode || ''
  });

  // バッチサイズに達したら保存
  if (productBatch.length >= BATCH_SIZE) {
    await flushProductBatch();
  }
}

// バッチの実行
async function flushProductBatch() {
  if (productBatch.length === 0) return;

  try {
    const { error } = await supabase
      .from('external_products')
      .upsert(productBatch, { onConflict: 'id' });

    if (error) {
      console.error('商品保存エラー:', error);
    }
  } catch (error) {
    console.error('バッチ保存エラー:', error);
  }

  // バッチをクリア
  productBatch.length = 0;
}

// スリープ関数
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// メイン処理
async function main() {
  console.log('🚀 Phase 3 商品同期を開始します（高画質版）');
  console.log(`⚙️ 設定: ${JSON.stringify({
    SYNC_MODE,
    PRIORITY_FILTER,
    TARGET_AGE,
    PRODUCT_LIMIT,
    ENABLE_FEATURES,
    DRY_RUN,
    CURRENT_SEASON,
    CAPACITY_WARNING
  }, null, 2)}`);
  
  if (DRY_RUN) {
    console.log('🔍 ドライランモード: データベースへの変更は行いません');
  }

  const startTime = Date.now();
  const syncHistory = await loadSyncHistory();
  const selectedBrands = selectBrands(PHASE3_BRANDS, syncHistory);
  
  console.log(`\n📋 同期対象: ${selectedBrands.length}ブランド`);
  
  let totalProducts = 0;
  let successBrands = 0;
  let failedBrands = 0;
  const brandResults = [];

  for (let i = 0; i < selectedBrands.length; i++) {
    const brand = selectedBrands[i];
    const targetCount = determineProductCount(brand, syncHistory);
    
    console.log(`\n[${i + 1}/${selectedBrands.length}] 🏷️ ${brand.name}`);
    console.log(`  優先度: ${brand.priority} (実効: ${brand.effectivePriority})`);
    console.log(`  最終同期: ${brand.daysSinceLastSync}日前`);
    console.log(`  目標商品数: ${targetCount}`);
    
    try {
      const syncedCount = await syncBrandProducts(brand, targetCount);
      totalProducts += syncedCount;
      successBrands++;
      
      // 最後のバッチを実行
      if (i === selectedBrands.length - 1 || !DRY_RUN) {
        await flushProductBatch();
      }
      
      console.log(`  ✅ 完了: ${syncedCount}商品`);
      
      // 同期履歴を更新
      if (!DRY_RUN) {
        syncHistory[brand.name] = {
          lastSync: new Date().toISOString(),
          totalProducts: syncedCount,
          targetCount: targetCount,
          priority: brand.priority
        };
      }
      
      brandResults.push({
        brand: brand.name,
        success: true,
        synced: syncedCount,
        target: targetCount
      });
      
    } catch (error) {
      console.error(`  ❌ エラー: ${error.message}`);
      failedBrands++;
      brandResults.push({
        brand: brand.name,
        success: false,
        error: error.message
      });
    }
    
    // API制限対策
    if (i < selectedBrands.length - 1) {
      await sleep(1000);
    }
  }

  // 最後のバッチを確実に実行
  await flushProductBatch();
  
  // 同期履歴を保存
  if (!DRY_RUN) {
    await saveSyncHistory(syncHistory);
  }
  
  const endTime = Date.now();
  const duration = Math.round((endTime - startTime) / 1000);
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 同期完了レポート');
  console.log('='.repeat(60));
  console.log(`実行時間: ${Math.floor(duration / 60)}分${duration % 60}秒`);
  console.log(`成功ブランド: ${successBrands}/${selectedBrands.length}`);
  console.log(`失敗ブランド: ${failedBrands}`);
  console.log(`同期商品数: ${totalProducts}`);
  console.log(`ドライラン: ${DRY_RUN ? 'はい' : 'いいえ'}`);
  
  // 詳細レポート
  console.log('\n📈 ブランド別結果:');
  brandResults.forEach(result => {
    if (result.success) {
      console.log(`  ✅ ${result.brand}: ${result.synced}/${result.target}商品`);
    } else {
      console.log(`  ❌ ${result.brand}: ${result.error}`);
    }
  });
  
  // 統計情報
  if (!DRY_RUN) {
    const { data: stats } = await supabase
      .from('external_products')
      .select('source_brand, count', { count: 'exact', head: true })
      .eq('is_active', true);
    
    console.log('\n📊 データベース統計:');
    console.log(`  総商品数: ${stats?.count || 0}`);
  }
  
  process.exit(failedBrands > 0 ? 1 : 0);
}

// エラーハンドリング
process.on('unhandledRejection', (error) => {
  console.error('未処理のエラー:', error);
  process.exit(1);
});

// 実行
if (require.main === module) {
  main().catch(error => {
    console.error('致命的エラー:', error);
    process.exit(1);
  });
}

module.exports = { optimizeImageUrl };

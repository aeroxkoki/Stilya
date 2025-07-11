#!/usr/bin/env node
/**
 * 統合型Phase 3商品同期スクリプト（フィルタリング強化版）
 * 20-40代女性向け50-60ブランド対応
 * 
 * MVP改善版：NGキーワード・カテゴリフィルタリング追加
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

// MVP改善：フィルタリング設定の環境変数
const ENABLE_NG_FILTER = process.env.ENABLE_NG_FILTER !== 'false'; // デフォルトtrue
const MIN_PRICE_FILTER = parseInt(process.env.MIN_PRICE_FILTER || '1500');
const MAX_PRODUCTS_PER_SYNC = parseInt(process.env.MAX_PRODUCTS_PER_SYNC || '1000');
const AUTO_DELETE_OLD_PRODUCTS = process.env.AUTO_DELETE_OLD_PRODUCTS !== 'false';
const OLD_PRODUCT_DAYS = parseInt(process.env.OLD_PRODUCT_DAYS || '14');

// NGキーワードリスト（アプリのコンセプトに合わない商品を除外）
const NG_KEYWORDS = [
  // 性別
  'メンズ', '男性用', '紳士', 'MEN', "men's", 'ユニセックス',
  // 不適切カテゴリ
  '靴下', 'ソックス', 'タイツ', 'ストッキング', 'レギンス',
  '着物', '和服', '浴衣', '帯', '和装', '振袖', '袴', '作務衣', '甚平', '法被',
  '下着', 'ショーツ', 'ブラジャー', 'インナー', 'ランジェリー', 'パンティ',
  'ルームウェア', 'パジャマ', '寝巻き', 'ナイトウェア',
  // 履物・室内用品（追加）
  'スリッパ', 'サンダル', '草履', '下駄', '足袋', 'ルームシューズ', 'バススリッパ',
  // 生活雑貨・インテリア（追加）
  '風呂敷', 'ふろしき', 'タオル', 'ハンカチ', '手ぬぐい', 'てぬぐい',
  'クッション', '枕', 'シーツ', '布団', '毛布', 'ブランケット',
  'カーテン', 'のれん', '暖簾', 'テーブルクロス',
  // 祭り・イベント用品（追加）
  'はち巻', 'はちまき', 'タスキ', 'たすき', '手甲', '還暦', '古稀', '喜寿', '米寿',
  // 小物・アクセサリー（メインアイテム以外）
  'ベルト', '手袋', 'マフラー', 'ストール', 'スカーフ',
  'ネクタイ', 'サスペンダー', 'カフス',
  // その他
  'キッズ', '子供', 'ベビー', 'マタニティ', '授乳',
  'コスプレ', '仮装', 'ハロウィン', 'クリスマス衣装',
  '水着', 'ビキニ', 'スイムウェア',
  '制服', '作業着', 'ユニフォーム',
  // ブランド外商品
  '福袋', 'セット売り', 'まとめ売り', '詰め合わせ',
  // 中古・訳あり（既存のフィルタに追加）
  '中古', 'USED', 'リユース', 'アウトレット', 'B級品', '訳あり', 'ジャンク',
  'サンプル品', '展示品', '在庫処分'
];

// 優先カテゴリキーワード（これらを含む商品を優先）
const PRIORITY_CATEGORIES = [
  'ワンピース', 'ドレス',
  'ブラウス', 'シャツ', 'トップス',
  'ニット', 'セーター', 'カーディガン',
  'スカート', 'ロングスカート', 'ミニスカート',
  'パンツ', 'デニム', 'スラックス', 'ワイドパンツ',
  'コート', 'ジャケット', 'アウター', 'ブルゾン',
  'パーカー', 'スウェット'
];

// カテゴリ別商品数制限
const CATEGORY_LIMITS = {
  'ワンピース': 5000,
  'トップス': 8000,
  'ボトムス': 4000,
  'アウター': 3000,
  'その他': 2000
};

// 画像URLを最適化する関数（既存のコードから）
function optimizeImageUrl(url) {
  const PLACEHOLDER_IMAGE = 'https://picsum.photos/800/800?grayscale';
  
  if (!url || url === '' || url === 'null' || url === 'undefined') {
    return PLACEHOLDER_IMAGE;
  }
  
  try {
    let optimizedUrl = url;
    
    // _ex=64x64 のようなサイズパラメータを _ex=800x800 に変更
    if (optimizedUrl.includes('_ex=')) {
      optimizedUrl = optimizedUrl.replace(/_ex=\d+x\d+/g, '_ex=800x800');
    }
    // ?_ex=64x64 のようなクエリパラメータ形式にも対応
    else if (optimizedUrl.includes('?_ex=')) {
      optimizedUrl = optimizedUrl.replace(/\?_ex=\d+x\d+/g, '?_ex=800x800');
    }
    // サイズパラメータがない場合は追加
    else if (optimizedUrl.includes('.jpg') || optimizedUrl.includes('.jpeg') || optimizedUrl.includes('.png')) {
      const separator = optimizedUrl.includes('?') ? '&' : '?';
      optimizedUrl = `${optimizedUrl}${separator}_ex=800x800`;
    }
    
    return optimizedUrl;
  } catch (error) {
    console.error('画像URL最適化エラー:', error);
    return PLACEHOLDER_IMAGE;
  }
}

// NGキーワードチェック関数
function containsNGKeyword(text) {
  if (!text) return false;
  const lowerText = text.toLowerCase();
  return NG_KEYWORDS.some(keyword => lowerText.includes(keyword.toLowerCase()));
}

// 商品カテゴリを判定する関数
function detectProductCategory(product) {
  const searchText = `${product.title} ${product.catchCopy} ${product.itemCaption}`.toLowerCase();
  
  if (searchText.includes('ワンピース') || searchText.includes('ドレス')) {
    return 'ワンピース';
  } else if (searchText.includes('トップス') || searchText.includes('ブラウス') || 
             searchText.includes('シャツ') || searchText.includes('ニット') ||
             searchText.includes('セーター') || searchText.includes('カーディガン')) {
    return 'トップス';
  } else if (searchText.includes('スカート') || searchText.includes('パンツ') ||
             searchText.includes('デニム') || searchText.includes('ボトムス')) {
    return 'ボトムス';
  } else if (searchText.includes('コート') || searchText.includes('ジャケット') ||
             searchText.includes('アウター')) {
    return 'アウター';
  }
  
  return 'その他';
}

// 商品の優先度スコアを計算
function calculateProductPriority(product) {
  let score = 50;
  
  const searchText = `${product.title} ${product.catchCopy} ${product.itemCaption}`.toLowerCase();
  
  // 優先カテゴリのチェック
  PRIORITY_CATEGORIES.forEach(category => {
    if (searchText.includes(category.toLowerCase())) {
      score += 20;
    }
  });
  
  // 価格による調整（適正価格帯を優遇）
  if (product.price >= 2000 && product.price <= 15000) {
    score += 10;
  } else if (product.price < 2000) {
    score -= 10; // 安すぎる商品は減点
  } else if (product.price > 50000) {
    score -= 5; // 高すぎる商品も少し減点
  }
  
  // レビューによる調整
  if (product.reviewAverage >= 4.0) {
    score += 10;
  }
  if (product.reviewCount >= 50) {
    score += 10;
  }
  
  return score;
}

// 商品品質スコアを計算（MVP改善版）
function calculateProductQualityScore(product) {
  let score = 50; // ベーススコア
  
  // 画像品質（高解像度URL使用で加点）
  if (product.imageUrl && product.imageUrl.includes('_ex=800x800')) {
    score += 10;
  }
  
  // 説明の充実度
  const descLength = (product.itemCaption || '').length;
  if (descLength > 100) score += 10;
  if (descLength > 300) score += 10;
  
  // レビュースコア
  if (product.reviewAverage >= 4.0) score += 15;
  if (product.reviewCount >= 50) score += 10;
  if (product.reviewCount >= 100) score += 10;
  
  // 在庫状況
  if (product.availability === 1) score += 5;
  
  return Math.min(score, 100); // 最大100点
}

// タグ生成システム（体系的なタグ付け）
const TAG_PATTERNS = {
  // スタイル系
  style: {
    'カジュアル': ['カジュアル', 'デイリー', 'リラックス', '楽ちん', 'ラフ'],
    'フェミニン': ['フェミニン', 'ガーリー', '女性らしい', 'レディライク', 'エレガント'],
    'モード': ['モード', 'モダン', 'アバンギャルド', 'エッジー', 'クール'],
    'ナチュラル': ['ナチュラル', 'ゆったり', 'リネン', 'オーガニック', '自然'],
    'きれいめ': ['きれいめ', 'オフィス', 'コンサバ', '上品', 'フォーマル'],
    'ストリート': ['ストリート', 'ストカジ', 'スポーティ', 'アクティブ']
  },
  
  // シーン系
  occasion: {
    'オフィス': ['オフィス', 'ビジネス', '通勤', 'OL', 'ワーク'],
    'デート': ['デート', 'お出かけ', 'ディナー', 'おしゃれ'],
    'パーティー': ['パーティー', '結婚式', '二次会', 'お呼ばれ'],
    'カジュアル': ['デイリー', '普段着', '日常', 'お家'],
    'フォーマル': ['フォーマル', 'セレモニー', '式典', '冠婚葬祭']
  },
  
  // 季節系
  season: {
    '春': ['春', '春物', '春夏', 'スプリング', '薄手'],
    '夏': ['夏', '夏物', 'サマー', '涼しい', '通気性'],
    '秋': ['秋', '秋物', '秋冬', 'オータム', '長袖'],
    '冬': ['冬', '冬物', 'ウィンター', '防寒', '暖かい', '厚手']
  },
  
  // 素材系
  material: {
    'コットン': ['コットン', '綿', 'cotton', '綿100%'],
    'ポリエステル': ['ポリエステル', 'ポリ', 'polyester'],
    'ウール': ['ウール', 'wool', '毛', 'ニット'],
    'リネン': ['リネン', '麻', 'linen'],
    'シルク': ['シルク', '絹', 'silk'],
    'デニム': ['デニム', 'ジーンズ', 'ジーパン']
  },
  
  // シルエット系
  fit: {
    'タイト': ['タイト', 'スリム', 'フィット', '細身'],
    'ルーズ': ['ルーズ', 'ゆったり', 'オーバーサイズ', 'ビッグ'],
    'レギュラー': ['レギュラー', 'スタンダード', '標準'],
    'フレア': ['フレア', 'Aライン', '広がり']
  },
  
  // 色系
  color: {
    'モノトーン': ['ブラック', '黒', 'ホワイト', '白', 'グレー', '灰色', 'モノトーン'],
    'パステル': ['パステル', 'ピンク', 'ブルー', 'イエロー', 'ミント', 'ラベンダー'],
    'アース': ['ベージュ', 'ブラウン', 'カーキ', 'オリーブ', 'キャメル'],
    'ビビッド': ['レッド', '赤', 'オレンジ', 'グリーン', '緑', 'ビビッド']
  }
};

// 商品情報から体系的なタグを生成（MVP改善版）
function generateProductTags(product, brand) {
  const tags = new Set();
  const searchText = `${product.title} ${product.catchCopy} ${product.itemCaption}`.toLowerCase();
  
  // スタイルタグ
  const styleKeywords = {
    'カジュアル': ['カジュアル', 'デイリー', 'ラフ', '普段着'],
    'フェミニン': ['フェミニン', 'ガーリー', '女性らしい', 'レディライク'],
    'モード': ['モード', 'モダン', 'アート', '個性的'],
    'ナチュラル': ['ナチュラル', 'リネン', 'オーガニック', 'ゆったり'],
    'エレガント': ['エレガント', '上品', 'クラシック', 'フォーマル'],
    'ストリート': ['ストリート', 'ヒップホップ', 'スケーター'],
    'きれいめ': ['きれいめ', 'オフィス', 'コンサバ', 'OL']
  };
  
  // アイテムカテゴリタグ
  const itemKeywords = {
    'トップス': ['ブラウス', 'シャツ', 'ニット', 'カットソー', 'Tシャツ'],
    'ボトムス': ['スカート', 'パンツ', 'デニム', 'ショートパンツ'],
    'ワンピース': ['ワンピース', 'ドレス', 'オールインワン'],
    'アウター': ['コート', 'ジャケット', 'ブルゾン', 'カーディガン']
  };
  
  // 季節タグ
  const seasonKeywords = {
    '春夏': ['春', '夏', '半袖', '薄手', 'サマー', 'クール'],
    '秋冬': ['秋', '冬', '長袖', '厚手', 'ウィンター', 'ウォーム']
  };
  
  // マッチング処理
  Object.entries(styleKeywords).forEach(([tag, keywords]) => {
    if (keywords.some(keyword => searchText.includes(keyword))) {
      tags.add(tag);
    }
  });
  
  Object.entries(itemKeywords).forEach(([tag, keywords]) => {
    if (keywords.some(keyword => searchText.includes(keyword))) {
      tags.add(tag);
    }
  });
  
  // 現在の季節に応じたタグ
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 8) {
    if (seasonKeywords['春夏'].some(keyword => searchText.includes(keyword))) {
      tags.add('春夏');
    }
  } else {
    if (seasonKeywords['秋冬'].some(keyword => searchText.includes(keyword))) {
      tags.add('秋冬');
    }
  }
  
  // ブランド固有タグ
  if (brand.tags) {
    brand.tags.forEach(tag => tags.add(tag));
  }
  
  // 価格帯タグ
  if (product.price < 3000) tags.add('プチプラ');
  else if (product.price < 10000) tags.add('ミドルプライス');
  else if (product.price < 30000) tags.add('ハイプライス');
  else tags.add('ラグジュアリー');
  
  return Array.from(tags);
}

// 詳細なアイテムタイプ判定
function detectDetailedItemType(text) {
  const itemTypes = {
    // トップス詳細
    'ブラウス': ['ブラウス', 'blouse'],
    'シャツ': ['シャツ', 'shirt'],
    'Tシャツ': ['tシャツ', 't-shirt', 'ティーシャツ'],
    'ニット': ['ニット', 'セーター', 'sweater', 'knit'],
    'カーディガン': ['カーディガン', 'cardigan'],
    'パーカー': ['パーカー', 'hoodie', 'フーディ'],
    'ベスト': ['ベスト', 'vest'],
    
    // ボトムス詳細
    'スカート': ['スカート', 'skirt'],
    'パンツ': ['パンツ', 'pants', 'ズボン'],
    'デニム': ['デニム', 'ジーンズ', 'jeans'],
    'ショートパンツ': ['ショートパンツ', 'ショーパン', 'shorts'],
    
    // ワンピース・アウター
    'ワンピース': ['ワンピース', 'ワンピ', 'dress'],
    'コート': ['コート', 'coat'],
    'ジャケット': ['ジャケット', 'jacket'],
    'ブルゾン': ['ブルゾン', 'blouson']
  };
  
  for (const [type, keywords] of Object.entries(itemTypes)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return type;
    }
  }
  
  return null;
}

// 現在の季節タグを取得
function getCurrentSeasonTag() {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return '春';
  if (month >= 6 && month <= 8) return '夏';
  if (month >= 9 && month <= 11) return '秋';
  return '冬';
}

// Phase 3対応ブランドリスト（全50-60ブランド）
const PHASE3_BRANDS = [
  // Priority 0: スーパー優先（UNIQLO, GU, 無印良品）
  { 
    name: 'UNIQLO',
    shopCode: 'uniqlo',
    priority: 0,
    tags: ['ベーシック', 'シンプル', '定番', '高品質', 'コスパ'],
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

  // Priority 7: 百貨店・ハイブランド
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

// 統計情報を記録する変数
const syncStatistics = {
  totalFetched: 0,
  totalFiltered: 0,
  ngKeywordFiltered: 0,
  priceFiltered: 0,
  categoryFiltered: 0,
  totalSaved: 0,
  brandStats: {},
  categoryStats: {},
  startTime: Date.now()
};

// 楽天APIから商品取得（フィルタリング強化版）
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
        imageFlag: 1,
        minPrice: MIN_PRICE_FILTER, // 環境変数から取得
        maxPrice: 50000,
      };
      
      if (brand.shopCode) {
        params.shopCode = brand.shopCode;
      }

      const response = await axios.get(url, { params });
      
      if (response.data.Items && response.data.Items.length > 0) {
        const products = response.data.Items
          .map(item => {
            // 基本的な商品データをマッピング
            let imageUrl = '';
            
            if (item.Item.mediumImageUrls && item.Item.mediumImageUrls.length > 0) {
              const mediumUrl = item.Item.mediumImageUrls[0];
              imageUrl = typeof mediumUrl === 'string' ? mediumUrl : mediumUrl.imageUrl || '';
            } else if (item.Item.imageUrl) {
              imageUrl = item.Item.imageUrl;
            }
            
            imageUrl = optimizeImageUrl(imageUrl);
            
            const additionalImages = (item.Item.mediumImageUrls || [])
              .slice(1, 4)
              .map(img => {
                const url = typeof img === 'string' ? img : img?.imageUrl || '';
                return optimizeImageUrl(url);
              })
              .filter(url => url && !url.includes('picsum.photos'));

            return {
              productId: `rakuten_${item.Item.itemCode}`,
              title: item.Item.itemName,
              price: item.Item.itemPrice,
              imageUrl: imageUrl,
              additionalImages: additionalImages,
              thumbnailUrl: optimizeImageUrl(item.Item.smallImageUrls?.[0]?.imageUrl || ''),
              productUrl: item.Item.itemUrl,
              shopName: item.Item.shopName,
              shopCode: item.Item.shopCode,
              catchCopy: item.Item.catchcopy || '',
              reviewAverage: item.Item.reviewAverage || 0,
              reviewCount: item.Item.reviewCount || 0,
              itemCaption: item.Item.itemCaption || '',
              availability: item.Item.availability || 1,
              taxFlag: item.Item.taxFlag || 0
            };
          })
          .filter(product => {
            syncStatistics.totalFetched++;
            
            // NGキーワードフィルタリング
            if (ENABLE_NG_FILTER) {
              const searchText = `${product.title} ${product.catchCopy} ${product.itemCaption}`;
              if (containsNGKeyword(searchText)) {
                syncStatistics.ngKeywordFiltered++;
                return false;
              }
            }
            
            // 価格フィルタリング（既に最低価格はAPIで設定済み、ここでは追加チェック）
            if (product.price < MIN_PRICE_FILTER) {
              syncStatistics.priceFiltered++;
              return false;
            }
            
            return true;
          });
        
        // 優先度でソート
        products.sort((a, b) => calculateProductPriority(b) - calculateProductPriority(a));
        
        allProducts = allProducts.concat(products);
      }
    } catch (error) {
      console.error(`  ⚠️ ページ${page}の取得失敗:`, error.message);
    }

    await sleep(200); // API制限対策
  }

  return allProducts.slice(0, limit);
}

// データベースの古い商品を削除
async function deleteOldProducts() {
  if (!AUTO_DELETE_OLD_PRODUCTS) return;
  
  console.log('🗑️ 古い商品の削除を開始...');
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - OLD_PRODUCT_DAYS);
  
  try {
    // まずNGキーワードを含む商品を削除
    if (ENABLE_NG_FILTER) {
      for (const keyword of NG_KEYWORDS) {
        const { error } = await supabase
          .from('external_products')
          .delete()
          .ilike('title', `%${keyword}%`);
        
        if (error) {
          console.error(`  ❌ NGキーワード削除エラー (${keyword}):`, error.message);
        }
      }
    }
    
    // 古い商品を削除
    const { data: deletedProducts, error } = await supabase
      .from('external_products')
      .delete()
      .lt('last_synced', cutoffDate.toISOString())
      .select('id');
    
    if (error) {
      console.error('  ❌ 古い商品の削除エラー:', error.message);
    } else {
      console.log(`  ✅ ${deletedProducts?.length || 0}件の古い商品を削除しました`);
    }
    
    // 価格が安すぎる商品も削除
    const { data: cheapProducts, error: cheapError } = await supabase
      .from('external_products')
      .delete()
      .lt('price', MIN_PRICE_FILTER)
      .select('id');
    
    if (!cheapError) {
      console.log(`  ✅ ${cheapProducts?.length || 0}件の低価格商品を削除しました`);
    }
  } catch (error) {
    console.error('  ❌ 削除処理エラー:', error);
  }
}

// カテゴリ別商品数を確認・調整
async function checkCategoryLimits() {
  console.log('📊 カテゴリ別商品数を確認中...');
  
  for (const [category, limit] of Object.entries(CATEGORY_LIMITS)) {
    const { count, error } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true })
      .eq('source_category', category)
      .eq('is_active', true);
    
    if (!error && count > limit) {
      // 古い商品から削除
      const excess = count - limit;
      console.log(`  ⚠️ ${category}カテゴリが上限を超過 (${count}/${limit})、${excess}件削除`);
      
      const { error: deleteError } = await supabase
        .from('external_products')
        .delete()
        .eq('source_category', category)
        .order('last_synced', { ascending: true })
        .limit(excess);
      
      if (deleteError) {
        console.error(`  ❌ ${category}の削除エラー:`, deleteError.message);
      }
    }
  }
}

// ブランド商品同期関数（フィルタリング強化版）
async function syncBrandProducts(brand, targetCount) {
  const { data: existingProducts } = await supabase
    .from('external_products')
    .select('id')
    .eq('source_brand', brand.name)
    .eq('is_active', true);
  
  const existingProductIds = new Set(existingProducts?.map(p => p.id) || []);
  const newProductIds = new Set();
  let totalSynced = 0;
  
  // ブランド統計の初期化
  if (!syncStatistics.brandStats[brand.name]) {
    syncStatistics.brandStats[brand.name] = {
      fetched: 0,
      filtered: 0,
      saved: 0
    };
  }
  
  const keywords = brand.keywords || [brand.name];
  
  for (const keyword of keywords) {
    if (totalSynced >= targetCount) break;
    
    const remaining = Math.min(targetCount - totalSynced, MAX_PRODUCTS_PER_SYNC);
    const products = await fetchProductsFromRakuten(keyword, remaining, brand);
    
    syncStatistics.brandStats[brand.name].fetched += products.length;
    
    for (const product of products) {
      if (existingProductIds.has(product.productId) || newProductIds.has(product.productId)) {
        continue;
      }
      
      newProductIds.add(product.productId);
      
      // カテゴリを検出
      const category = detectProductCategory(product);
      
      // カテゴリ統計を更新
      if (!syncStatistics.categoryStats[category]) {
        syncStatistics.categoryStats[category] = 0;
      }
      syncStatistics.categoryStats[category]++;
      
      // 商品データの拡張
      const enhancedProduct = {
        ...product,
        source_brand: brand.name,
        brand_priority: brand.priority,
        brand_category: brand.category,
        target_age: brand.targetAge,
        price_range: brand.priceRange,
        source_category: category,
        is_active: true,
        last_synced: new Date().toISOString(),
        ml_tags: generateProductTags(product, brand), // 新しいタグ生成システムを使用
        recommendation_score: calculateProductPriority(product),
        quality_score: calculateProductQualityScore(product) // 品質スコアを計算
      };
      
      // データベースへの保存
      if (!DRY_RUN) {
        await saveProductToDatabase(enhancedProduct);
        syncStatistics.brandStats[brand.name].saved++;
        syncStatistics.totalSaved++;
      }
      
      totalSynced++;
    }
  }
  
  return totalSynced;
}

// データベースへの保存（既存のバッチ処理を使用）
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
    source_category: product.source_category,
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
    priority: product.quality_score || 50, // 品質スコアをpriorityフィールドに保存
    additional_images: product.additionalImages || [],
    thumbnail_url: product.thumbnailUrl || '',
    catch_copy: product.catchCopy || '',
    item_caption: product.itemCaption || '',
    availability: product.availability || 1,
    tax_flag: product.taxFlag || 0,
    shop_code: product.shopCode || ''
  });

  if (productBatch.length >= BATCH_SIZE) {
    await flushProductBatch();
  }
}

async function flushProductBatch() {
  if (productBatch.length === 0) return;

  try {
    const { error } = await supabase
      .from('external_products')
      .upsert(productBatch, { onConflict: 'id' });

    if (error) {
      console.error('  ❌ バッチ保存エラー:', error.message);
    } else {
      console.log(`  ✅ ${productBatch.length}件の商品を保存`);
    }
  } catch (error) {
    console.error('  ❌ バッチ保存エラー:', error);
  }

  productBatch.length = 0;
}

// レポート生成関数
function generateReport() {
  const duration = Math.floor((Date.now() - syncStatistics.startTime) / 1000);
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 同期完了レポート（フィルタリング強化版）');
  console.log('='.repeat(60));
  console.log(`実行時間: ${Math.floor(duration / 60)}分${duration % 60}秒`);
  console.log(`\n📈 全体統計:`);
  console.log(`  - 取得商品数: ${syncStatistics.totalFetched.toLocaleString()}`);
  console.log(`  - フィルタ除外数: ${syncStatistics.totalFiltered.toLocaleString()}`);
  console.log(`    - NGキーワード: ${syncStatistics.ngKeywordFiltered.toLocaleString()}`);
  console.log(`    - 価格フィルタ: ${syncStatistics.priceFiltered.toLocaleString()}`);
  console.log(`  - 保存商品数: ${syncStatistics.totalSaved.toLocaleString()}`);
  
  console.log(`\n👗 カテゴリ別統計:`);
  Object.entries(syncStatistics.categoryStats)
    .sort(([, a], [, b]) => b - a)
    .forEach(([category, count]) => {
      console.log(`  - ${category}: ${count.toLocaleString()}件`);
    });
  
  console.log(`\n🏷️ ブランド別統計 (上位10):`);
  Object.entries(syncStatistics.brandStats)
    .sort(([, a], [, b]) => b.saved - a.saved)
    .slice(0, 10)
    .forEach(([brand, stats]) => {
      const filterRate = stats.fetched > 0 ? 
        Math.round((stats.fetched - stats.saved) / stats.fetched * 100) : 0;
      console.log(`  - ${brand}: 保存${stats.saved}件 / 取得${stats.fetched}件 (除外率${filterRate}%)`);
    });
  
  console.log('\n💡 最適化提案:');
  
  // NGキーワードフィルタの効果
  if (syncStatistics.ngKeywordFiltered > syncStatistics.totalFetched * 0.2) {
    console.log('  ⚠️ NGキーワードフィルタで20%以上除外されています。検索キーワードの見直しを推奨');
  }
  
  // カテゴリバランスのチェック
  const totalInCategories = Object.values(syncStatistics.categoryStats).reduce((a, b) => a + b, 0);
  const otherPercent = (syncStatistics.categoryStats['その他'] || 0) / totalInCategories * 100;
  if (otherPercent > 30) {
    console.log('  ⚠️ 「その他」カテゴリが30%を超えています。カテゴリ判定ロジックの改善を推奨');
  }
  
  console.log('\n' + '='.repeat(60));
}

// スリープ関数
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// メイン処理（既存のロジックを維持しつつフィルタリング追加）
async function main() {
  console.log('🚀 商品同期開始（フィルタリング強化版）');
  console.log(`📋 設定: mode=${SYNC_MODE}, NGフィルタ=${ENABLE_NG_FILTER}, 最低価格=${MIN_PRICE_FILTER}円`);
  
  // 最初に古い商品を削除
  await deleteOldProducts();
  
  // カテゴリ制限をチェック
  await checkCategoryLimits();
  
  // ブランドリストの取得（既存のロジックを使用）
  let targetBrands = [];
  
  if (TARGET_BRANDS) {
    const brandNames = TARGET_BRANDS.split(',').map(b => b.trim());
    targetBrands = PHASE3_BRANDS.filter(b => brandNames.includes(b.name));
  } else {
    // 既存のフィルタリングロジックを使用
    targetBrands = PHASE3_BRANDS;
    
    if (PRIORITY_FILTER !== 'all') {
      targetBrands = targetBrands.filter(b => b.priority === parseInt(PRIORITY_FILTER));
    }
    
    if (TARGET_AGE !== 'all') {
      targetBrands = targetBrands.filter(b => {
        const [minAge, maxAge] = b.targetAge.split('-').map(a => parseInt(a));
        const [targetMin, targetMax] = TARGET_AGE.split('-').map(a => parseInt(a));
        return minAge <= targetMax && maxAge >= targetMin;
      });
    }
  }
  
  console.log(`🎯 対象ブランド数: ${targetBrands.length}`);
  
  // 各ブランドの同期
  for (const brand of targetBrands) {
    console.log(`\n🏷️ ${brand.name}の同期開始...`);
    
    // 商品数の計算（既存のロジックを簡略化）
    let targetCount = brand.initialProducts;
    if (CAPACITY_WARNING) {
      targetCount = Math.floor(targetCount * 0.5);
    }
    targetCount = Math.min(targetCount, MAX_PRODUCTS_PER_SYNC);
    
    const synced = await syncBrandProducts(brand, targetCount);
    console.log(`  ✅ ${synced}件同期完了`);
    
    syncStatistics.totalFiltered = syncStatistics.ngKeywordFiltered + 
                                   syncStatistics.priceFiltered + 
                                   syncStatistics.categoryFiltered;
  }
  
  // 残りのバッチを処理
  await flushProductBatch();
  
  // レポート生成
  generateReport();
  
  console.log('\n✨ 同期処理が完了しました！');
}

// エラーハンドリング
process.on('unhandledRejection', (error) => {
  console.error('未処理のエラー:', error);
  process.exit(1);
});

// 実行
if (require.main === module) {
  main().catch(error => {
    console.error('メイン処理エラー:', error);
    process.exit(1);
  });
}

module.exports = { main };

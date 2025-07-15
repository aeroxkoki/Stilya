// APIエンドポイント
export const API_BASE_URL = 'https://api.example.com'; // 本番環境では実際のAPIエンドポイントに変更する

// 画像サイズ（最高画質対応）
export const IMAGE_SIZES = {
  thumbnail: { width: 120, height: 120 },
  medium: { width: 400, height: 400 },
  large: { width: 800, height: 800 }, // 最高画質
};

// アプリ設定
export const APP_CONFIG = {
  appName: 'Stilya',
  version: '0.1.0',
  copyright: '© 2025 Stilya Team',
  supportEmail: 'support@example.com',
};

// アニメーション設定
export const ANIMATION_CONFIG = {
  defaultDuration: 300, // ms
  defaultEasing: 'ease-in-out',
  swipeOutDuration: 250, // ms
  swipeThreshold: 0.25, // スワイプ判定のしきい値（画面幅の割合）
};

// キャッシュ設定
export const CACHE_CONFIG = {
  imageCache: {
    ttl: 7 * 24 * 60 * 60 * 1000, // 7日間
    maxEntries: 100, // 最大エントリー数
  },
  apiCache: {
    ttl: 60 * 60 * 1000, // 1時間
    maxEntries: 50,
  },
};

// バッチ処理設定
export const BATCH_CONFIG = {
  productSync: {
    interval: 24 * 60 * 60 * 1000, // 24時間ごと
    itemsPerBatch: 100, // 1バッチあたりの処理数
  },
};

// ファッションスタイルタグ（統一版）
// オンボーディング、フィルター、商品タグで使用
export const FASHION_STYLES = [
  { id: 'casual', label: 'カジュアル', jpTag: 'カジュアル' },
  { id: 'street', label: 'ストリート', jpTag: 'ストリート' },
  { id: 'mode', label: 'モード', jpTag: 'モード' },
  { id: 'natural', label: 'ナチュラル', jpTag: 'ナチュラル' },
  { id: 'classic', label: 'クラシック', jpTag: 'クラシック' }, // 統一
  { id: 'feminine', label: 'フェミニン', jpTag: 'フェミニン' },
];

// スタイルIDから日本語タグへのマッピング
export const STYLE_ID_TO_JP_TAG: Record<string, string> = {
  'casual': 'カジュアル',
  'street': 'ストリート',
  'mode': 'モード',
  'natural': 'ナチュラル',
  'classic': 'クラシック', // 「きれいめ」から「クラシック」に統一
  'feminine': 'フェミニン',
};

// 日本語タグからスタイルIDへのマッピング
export const JP_TAG_TO_STYLE_ID: Record<string, string> = {
  'カジュアル': 'casual',
  'ストリート': 'street',
  'モード': 'mode',
  'ナチュラル': 'natural',
  'クラシック': 'classic',
  'フェミニン': 'feminine',
  // 互換性のためのエイリアス
  'きれいめ': 'classic', // 後方互換性
};

// スタイルと関連タグのマッピング（initialProductServiceから移動）
export const STYLE_TAG_MAPPING: Record<string, string[]> = {
  casual: ['カジュアル', 'casual', 'デイリー', 'daily', 'ラフ'],
  street: ['ストリート', 'street', 'スケーター', 'skater', 'ヒップホップ'],
  mode: ['モード', 'mode', 'モダン', 'modern', 'シンプル', 'ミニマル'],
  natural: ['ナチュラル', 'natural', 'オーガニック', 'organic', '自然', 'リラックス'],
  classic: ['クラシック', 'classic', 'きれいめ', 'トラッド', 'trad', 'ベーシック', 'basic', 'オフィス', 'OL'],
  feminine: ['フェミニン', 'feminine', 'ガーリー', 'girly', 'キュート', 'cute'],
};

// フィルターで使用するスタイルオプション（日本語表示用）
export const FILTER_STYLE_OPTIONS = ['すべて', 'カジュアル', 'クラシック', 'ナチュラル', 'モード', 'ストリート', 'フェミニン'];

// 年代区分
export const AGE_GROUPS = [
  { id: 'teens', label: '10代' },
  { id: 'twenties', label: '20代' },
  { id: 'thirties', label: '30代' },
  { id: 'forties', label: '40代' },
  { id: 'fifties', label: '50代以上' },
];

// 性別区分
export const GENDER_TYPES = [
  { id: 'male', label: 'メンズ' },
  { id: 'female', label: 'レディース' },
  { id: 'unisex', label: 'ユニセックス' },
];

// 商品カテゴリ
export const PRODUCT_CATEGORIES = [
  { id: 'tops', label: 'トップス' },
  { id: 'bottoms', label: 'ボトムス' },
  { id: 'outerwear', label: 'アウター' },
  { id: 'dresses', label: 'ワンピース' },
  { id: 'shoes', label: 'シューズ' },
  { id: 'accessories', label: 'アクセサリー' },
  { id: 'bags', label: 'バッグ' },
  { id: 'kids', label: 'キッズ' },
];

// アフィリエイトプログラム
export const AFFILIATE_PROGRAMS = {
  linkShare: {
    name: 'Rakuten Advertising',
    endpoint: 'https://api.linksynergy.com/v1/products/search',
  },
  a8: {
    name: 'A8.net',
    endpoint: 'https://api.a8.net/api/v1/items',
  },
  rakuten: {
    name: '楽天アフィリエイト',
    endpoint: 'https://app.rakuten.co.jp/services/api/IchibaItem/Search/20220601',
  },
};

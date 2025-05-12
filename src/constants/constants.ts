// APIエンドポイント
export const API_BASE_URL = 'https://api.example.com'; // 本番環境では実際のAPIエンドポイントに変更する

// 画像サイズ
export const IMAGE_SIZES = {
  thumbnail: { width: 120, height: 120 },
  medium: { width: 300, height: 300 },
  large: { width: 600, height: 600 },
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

// ファッションスタイルタグ（一部）
export const FASHION_STYLES = [
  { id: 'casual', label: 'カジュアル' },
  { id: 'formal', label: 'フォーマル' },
  { id: 'street', label: 'ストリート' },
  { id: 'minimal', label: 'ミニマル' },
  { id: 'vintage', label: 'ビンテージ' },
  { id: 'mode', label: 'モード' },
  { id: 'feminine', label: 'フェミニン' },
  { id: 'sporty', label: 'スポーティ' },
  { id: 'elegant', label: 'エレガント' },
];

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

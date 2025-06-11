#!/usr/bin/env node
/**
 * 高精度タグ抽出モジュール
 * 商品名、説明文、カテゴリ、価格帯などから多角的にタグを生成
 */

// カテゴリ定義（階層的なタグ構造）
const TAG_CATEGORIES = {
  // アイテムタイプ
  itemType: {
    patterns: [
      { regex: /ワンピース|ドレス|チュニック/i, tags: ['ワンピース', 'ドレス系'] },
      { regex: /シャツ|ブラウス/i, tags: ['シャツ', 'トップス'] },
      { regex: /Tシャツ|ティーシャツ|カットソー/i, tags: ['Tシャツ', 'カジュアルトップス'] },
      { regex: /ニット|セーター|カーディガン/i, tags: ['ニット', 'ニット系'] },
      { regex: /パンツ|ズボン|スラックス/i, tags: ['パンツ', 'ボトムス'] },
      { regex: /スカート/i, tags: ['スカート', 'ボトムス'] },
      { regex: /ジャケット|ブルゾン|アウター/i, tags: ['ジャケット', 'アウター'] },
      { regex: /コート/i, tags: ['コート', 'アウター'] },
      { regex: /パーカー|フーディ/i, tags: ['パーカー', 'カジュアル'] },
      { regex: /デニム|ジーンズ|ジーパン/i, tags: ['デニム', 'カジュアル'] },
      { regex: /バッグ|鞄|カバン/i, tags: ['バッグ', 'アクセサリー'] },
      { regex: /靴|シューズ|スニーカー|パンプス|ブーツ/i, tags: ['シューズ', '靴'] },
    ]
  },
  
  // スタイル
  style: {
    patterns: [
      { regex: /カジュアル|ラフ|リラックス/i, tags: ['カジュアル'] },
      { regex: /フォーマル|ビジネス|オフィス/i, tags: ['フォーマル', 'オフィス'] },
      { regex: /エレガント|上品|きれいめ|キレイめ/i, tags: ['エレガント', 'きれいめ'] },
      { regex: /ストリート|スポーティ|アスレジャー/i, tags: ['ストリート', 'スポーティ'] },
      { regex: /ガーリー|フェミニン|かわいい|キュート/i, tags: ['フェミニン', 'ガーリー'] },
      { regex: /モード|モダン|シンプル|ミニマル/i, tags: ['モード', 'モダン'] },
      { regex: /ヴィンテージ|レトロ|クラシック/i, tags: ['ヴィンテージ', 'レトロ'] },
      { regex: /ナチュラル|オーガニック|エコ/i, tags: ['ナチュラル'] },
      { regex: /韓国|K-?ファッション/i, tags: ['韓国系', 'トレンド'] },
    ]
  },
  
  // 色
  color: {
    patterns: [
      { regex: /ブラック|黒|クロ/i, tags: ['ブラック', 'モノトーン'] },
      { regex: /ホワイト|白|シロ/i, tags: ['ホワイト', 'モノトーン'] },
      { regex: /グレー|灰色|グレイ/i, tags: ['グレー', 'モノトーン'] },
      { regex: /ネイビー|紺/i, tags: ['ネイビー', 'ベーシックカラー'] },
      { regex: /ベージュ|ベイジュ/i, tags: ['ベージュ', 'ナチュラルカラー'] },
      { regex: /ブラウン|茶|キャメル/i, tags: ['ブラウン', 'アースカラー'] },
      { regex: /レッド|赤|レド/i, tags: ['レッド', 'ビビッドカラー'] },
      { regex: /ピンク|桃色/i, tags: ['ピンク', 'パステルカラー'] },
      { regex: /ブルー|青|水色/i, tags: ['ブルー'] },
      { regex: /グリーン|緑|カーキ/i, tags: ['グリーン', 'アースカラー'] },
      { regex: /イエロー|黄|マスタード/i, tags: ['イエロー', 'ビビッドカラー'] },
      { regex: /パープル|紫|ラベンダー/i, tags: ['パープル'] },
      { regex: /ボーダー|ストライプ/i, tags: ['ボーダー', 'パターン'] },
      { regex: /チェック|格子/i, tags: ['チェック', 'パターン'] },
      { regex: /花柄|フラワー/i, tags: ['花柄', 'パターン'] },
      { regex: /無地/i, tags: ['無地', 'シンプル'] },
    ]
  },
  
  // 素材
  material: {
    patterns: [
      { regex: /コットン|綿|cotton/i, tags: ['コットン', '天然素材'] },
      { regex: /リネン|麻/i, tags: ['リネン', '天然素材'] },
      { regex: /シルク|絹/i, tags: ['シルク', '高級素材'] },
      { regex: /ウール|毛/i, tags: ['ウール', '冬素材'] },
      { regex: /カシミ[ヤア]/i, tags: ['カシミヤ', '高級素材'] },
      { regex: /ポリエステル/i, tags: ['ポリエステル', '機能素材'] },
      { regex: /レザー|革|皮/i, tags: ['レザー', '高級素材'] },
      { regex: /デニム/i, tags: ['デニム素材'] },
      { regex: /ニット/i, tags: ['ニット素材'] },
      { regex: /シフォン/i, tags: ['シフォン', '軽やか素材'] },
      { regex: /レース/i, tags: ['レース', 'フェミニン素材'] },
    ]
  },
  
  // シーズン
  season: {
    patterns: [
      { regex: /春|スプリング|春物/i, tags: ['春', '春夏'] },
      { regex: /夏|サマー|夏物/i, tags: ['夏', '春夏'] },
      { regex: /秋|オータム|秋物/i, tags: ['秋', '秋冬'] },
      { regex: /冬|ウィンター|冬物/i, tags: ['冬', '秋冬'] },
      { regex: /オールシーズン|通年/i, tags: ['オールシーズン'] },
    ]
  },
  
  // 特徴
  features: {
    patterns: [
      { regex: /ロング|長め|ロング丈/i, tags: ['ロング丈'] },
      { regex: /ショート|短め|ミニ/i, tags: ['ショート丈'] },
      { regex: /ミディアム|ミディ|膝丈/i, tags: ['ミディアム丈'] },
      { regex: /オーバーサイズ|ビッグ|ゆったり/i, tags: ['オーバーサイズ', 'リラックスフィット'] },
      { regex: /タイト|スリム|細身/i, tags: ['タイトフィット', 'スリム'] },
      { regex: /Aライン/i, tags: ['Aライン', 'フレア'] },
      { regex: /プリーツ/i, tags: ['プリーツ', 'ディテール'] },
      { regex: /フリル|レース/i, tags: ['フリル', 'フェミニンディテール'] },
      { regex: /刺繍|エンブロイダリー/i, tags: ['刺繍', 'ディテール'] },
      { regex: /ポケット付/i, tags: ['ポケット付き', '機能的'] },
    ]
  }
};

// 価格帯によるスタイル推定
function getPriceRangeTags(price) {
  const tags = [];
  if (price < 3000) {
    tags.push('プチプラ', 'お手頃価格');
  } else if (price < 10000) {
    tags.push('ミドルプライス');
  } else if (price < 30000) {
    tags.push('ハイプライス', '上質');
  } else {
    tags.push('ラグジュアリー', '高級');
  }
  return tags;
}

// ブランド特性によるタグ
const BRAND_CHARACTERISTICS = {
  'UNIQLO': ['ベーシック', 'シンプル', '機能的'],
  'GU': ['トレンド', 'プチプラ', 'カジュアル'],
  'ZARA': ['モード', 'トレンド', 'ヨーロピアン'],
  'H&M': ['ファストファッション', 'トレンド', 'カジュアル'],
  'BEAMS': ['セレクトショップ', '上質', 'こだわり'],
  'UNITED ARROWS': ['きれいめ', 'セレクトショップ', '大人カジュアル'],
  'SHIPS': ['トラッド', 'きれいめ', 'オフィスカジュアル'],
  // 楽天ショップ名から推測
  'Re:EDIT': ['韓国系', 'トレンド', 'プチプラ'],
  'coca': ['ナチュラル', 'カジュアル', 'リラックス'],
  'pierrot': ['大人カジュアル', 'きれいめ', 'オフィス'],
};

/**
 * 高精度タグ抽出関数
 */
function extractEnhancedTags(product) {
  const allTags = new Set();
  
  // 1. 商品名と説明文を結合してテキスト解析
  const searchText = `${product.itemName || ''} ${product.itemCaption || ''} ${product.catchcopy || ''}`;
  
  // 2. カテゴリ別にタグを抽出
  Object.entries(TAG_CATEGORIES).forEach(([category, { patterns }]) => {
    patterns.forEach(({ regex, tags }) => {
      if (regex.test(searchText)) {
        tags.forEach(tag => allTags.add(tag));
      }
    });
  });
  
  // 3. 価格帯タグ
  if (product.itemPrice) {
    getPriceRangeTags(product.itemPrice).forEach(tag => allTags.add(tag));
  }
  
  // 4. ブランド特性タグ
  const shopName = product.shopName || '';
  Object.entries(BRAND_CHARACTERISTICS).forEach(([brand, tags]) => {
    if (shopName.toLowerCase().includes(brand.toLowerCase())) {
      tags.forEach(tag => allTags.add(tag));
    }
  });
  
  // 5. 楽天カテゴリ情報の活用（genreIdから推定）
  if (product.genreId) {
    const genreId = String(product.genreId);
    if (genreId.startsWith('10037')) allTags.add('レディース');
    if (genreId.startsWith('10038')) allTags.add('メンズ');
  }
  
  // 6. 商品コードからブランド推定
  const itemCode = product.itemCode || '';
  if (itemCode.includes('select')) allTags.add('セレクト商品');
  if (itemCode.includes('import')) allTags.add('インポート');
  
  // 7. サイズ展開からターゲット層を推定
  if (searchText.includes('S M L')) {
    allTags.add('標準サイズ');
  }
  if (searchText.includes('F') || searchText.includes('フリーサイズ')) {
    allTags.add('フリーサイズ');
  }
  
  // 8. 基本カテゴリは必ず含める
  allTags.add('ファッション');
  
  // 配列に変換して返す（最大15個に制限）
  const tagsArray = Array.from(allTags);
  return tagsArray.slice(0, 15);
}

/**
 * タグの重要度スコアリング（将来的な実装用）
 */
function scoreTagImportance(tag, product) {
  // タグの重要度を0-1でスコアリング
  let score = 0.5; // デフォルトスコア
  
  // タイトルに含まれるタグは重要
  if (product.itemName && product.itemName.includes(tag)) {
    score += 0.3;
  }
  
  // 価格帯と一致するスタイルは重要
  if (tag === 'プチプラ' && product.itemPrice < 3000) {
    score += 0.2;
  }
  
  return Math.min(score, 1.0);
}

// エクスポート
module.exports = {
  extractEnhancedTags,
  scoreTagImportance,
  TAG_CATEGORIES,
  BRAND_CHARACTERISTICS
};

// 直接実行時のテスト
if (require.main === module) {
  // テストデータ
  const testProduct = {
    itemName: '【送料無料】花柄ワンピース レディース 春夏 ロング丈 シフォン素材',
    itemPrice: 3980,
    shopName: 'Re:EDIT',
    itemCaption: 'トレンドの花柄を取り入れた、エレガントなワンピース。軽やかなシフォン素材で春夏にぴったり。',
    genreId: '100371'
  };
  
  console.log('テスト商品:', testProduct.itemName);
  console.log('抽出されたタグ:', extractEnhancedTags(testProduct));
}

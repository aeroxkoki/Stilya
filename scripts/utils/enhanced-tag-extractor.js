#!/usr/bin/env node
/**
 * 超高精度タグ抽出モジュール - 機械学習的アプローチ
 * 商品の全情報から多角的・階層的にタグを生成
 */

// タグカテゴリの階層構造（拡張版）
const TAG_HIERARCHY = {
  // メインカテゴリ
  main: {
    itemType: {
      priority: 1,
      patterns: [
        { regex: /ワンピース|ドレス|チュニック/i, tags: ['ワンピース', 'ドレス系'], weight: 1.0 },
        { regex: /シャツ|ブラウス/i, tags: ['シャツ', 'トップス'], weight: 0.9 },
        { regex: /Tシャツ|ティーシャツ|カットソー/i, tags: ['Tシャツ', 'カジュアルトップス'], weight: 0.9 },
        { regex: /ニット|セーター|カーディガン/i, tags: ['ニット', 'ニット系'], weight: 0.9 },
        { regex: /パンツ|ズボン|スラックス/i, tags: ['パンツ', 'ボトムス'], weight: 0.9 },
        { regex: /スカート/i, tags: ['スカート', 'ボトムス'], weight: 0.9 },
        { regex: /ジャケット|ブルゾン|アウター/i, tags: ['ジャケット', 'アウター'], weight: 0.8 },
        { regex: /コート/i, tags: ['コート', 'アウター'], weight: 0.8 },
        { regex: /パーカー|フーディ/i, tags: ['パーカー', 'カジュアル'], weight: 0.8 },
        { regex: /デニム|ジーンズ|ジーパン/i, tags: ['デニム', 'カジュアル'], weight: 0.8 },
        { regex: /バッグ|鞄|カバン/i, tags: ['バッグ', 'アクセサリー'], weight: 0.7 },
        { regex: /靴|シューズ|スニーカー|パンプス|ブーツ/i, tags: ['シューズ', '靴'], weight: 0.7 },
        { regex: /アクセサリー|ネックレス|ピアス|リング/i, tags: ['アクセサリー', '小物'], weight: 0.6 },
        { regex: /ベルト|財布|ポーチ/i, tags: ['小物', 'ファッション小物'], weight: 0.6 }
      ]
    }
  },
  
  // スタイル分類（詳細化）
  style: {
    basic: {
      priority: 2,
      patterns: [
        { regex: /カジュアル|ラフ|リラックス/i, tags: ['カジュアル'], weight: 0.8 },
        { regex: /フォーマル|ビジネス|オフィス/i, tags: ['フォーマル', 'オフィス'], weight: 0.9 },
        { regex: /エレガント|上品|きれいめ|キレイめ/i, tags: ['エレガント', 'きれいめ'], weight: 0.9 },
        { regex: /ストリート|スポーティ|アスレジャー/i, tags: ['ストリート', 'スポーティ'], weight: 0.8 },
        { regex: /ガーリー|フェミニン|かわいい|キュート/i, tags: ['フェミニン', 'ガーリー'], weight: 0.8 },
        { regex: /モード|モダン|シンプル|ミニマル/i, tags: ['モード', 'モダン'], weight: 0.9 },
        { regex: /ヴィンテージ|レトロ|クラシック/i, tags: ['ヴィンテージ', 'レトロ'], weight: 0.8 },
        { regex: /ナチュラル|オーガニック|エコ/i, tags: ['ナチュラル'], weight: 0.8 }
      ]
    },
    trend: {
      priority: 3,
      patterns: [
        { regex: /韓国|K-?ファッション|オルチャン/i, tags: ['韓国系', 'トレンド'], weight: 0.9 },
        { regex: /Y2K|2000年代/i, tags: ['Y2K', 'レトロトレンド'], weight: 0.8 },
        { regex: /ゴシック|パンク|ロック/i, tags: ['ゴシック', 'サブカル'], weight: 0.7 },
        { regex: /フレンチ|パリジェンヌ/i, tags: ['フレンチシック', 'ヨーロピアン'], weight: 0.8 },
        { regex: /アメカジ|アメリカン/i, tags: ['アメカジ', 'カジュアル'], weight: 0.8 },
        { regex: /北欧|スカンジナビア/i, tags: ['北欧スタイル', 'シンプル'], weight: 0.8 }
      ]
    }
  },
  
  // 色・柄の詳細分類
  appearance: {
    color: {
      priority: 3,
      patterns: [
        // 基本色
        { regex: /ブラック|黒|クロ/i, tags: ['ブラック', 'モノトーン'], weight: 0.9 },
        { regex: /ホワイト|白|シロ/i, tags: ['ホワイト', 'モノトーン'], weight: 0.9 },
        { regex: /グレー|灰色|グレイ/i, tags: ['グレー', 'モノトーン'], weight: 0.8 },
        { regex: /ネイビー|紺/i, tags: ['ネイビー', 'ベーシックカラー'], weight: 0.8 },
        { regex: /ベージュ|ベイジュ/i, tags: ['ベージュ', 'ナチュラルカラー'], weight: 0.8 },
        { regex: /ブラウン|茶|キャメル/i, tags: ['ブラウン', 'アースカラー'], weight: 0.8 },
        // ビビッドカラー
        { regex: /レッド|赤|レド/i, tags: ['レッド', 'ビビッドカラー'], weight: 0.8 },
        { regex: /ピンク|桃色/i, tags: ['ピンク', 'パステルカラー'], weight: 0.8 },
        { regex: /ブルー|青|水色/i, tags: ['ブルー'], weight: 0.8 },
        { regex: /グリーン|緑|カーキ/i, tags: ['グリーン', 'アースカラー'], weight: 0.8 },
        { regex: /イエロー|黄|マスタード/i, tags: ['イエロー', 'ビビッドカラー'], weight: 0.8 },
        { regex: /パープル|紫|ラベンダー/i, tags: ['パープル'], weight: 0.8 },
        { regex: /オレンジ|橙/i, tags: ['オレンジ', 'ビビッドカラー'], weight: 0.8 },
        // トレンドカラー
        { regex: /くすみ|スモーキー/i, tags: ['くすみカラー', 'トレンドカラー'], weight: 0.9 },
        { regex: /ネオン|蛍光/i, tags: ['ネオンカラー', '派手'], weight: 0.7 },
        { regex: /パステル/i, tags: ['パステルカラー', '優しい色'], weight: 0.8 }
      ]
    },
    pattern: {
      priority: 4,
      patterns: [
        { regex: /ボーダー|ストライプ/i, tags: ['ボーダー', 'パターン'], weight: 0.8 },
        { regex: /チェック|格子|タータン/i, tags: ['チェック', 'パターン'], weight: 0.8 },
        { regex: /花柄|フラワー|ボタニカル/i, tags: ['花柄', 'パターン'], weight: 0.8 },
        { regex: /無地|ソリッド/i, tags: ['無地', 'シンプル'], weight: 0.7 },
        { regex: /ドット|水玉/i, tags: ['ドット', 'パターン'], weight: 0.8 },
        { regex: /アニマル|ヒョウ柄|ゼブラ/i, tags: ['アニマル柄', 'パターン'], weight: 0.7 },
        { regex: /ペイズリー/i, tags: ['ペイズリー', 'エスニック'], weight: 0.7 },
        { regex: /迷彩|カモフラ/i, tags: ['迷彩', 'カジュアル'], weight: 0.7 }
      ]
    }
  },
  
  // 素材・機能性
  material: {
    fabric: {
      priority: 4,
      patterns: [
        { regex: /コットン|綿|cotton/i, tags: ['コットン', '天然素材'], weight: 0.8 },
        { regex: /リネン|麻/i, tags: ['リネン', '天然素材', '涼しい'], weight: 0.8 },
        { regex: /シルク|絹/i, tags: ['シルク', '高級素材'], weight: 0.9 },
        { regex: /ウール|毛/i, tags: ['ウール', '冬素材'], weight: 0.8 },
        { regex: /カシミ[ヤア]/i, tags: ['カシミヤ', '高級素材'], weight: 0.9 },
        { regex: /ポリエステル/i, tags: ['ポリエステル', '機能素材'], weight: 0.6 },
        { regex: /レーヨン/i, tags: ['レーヨン', '落ち感'], weight: 0.7 },
        { regex: /ナイロン/i, tags: ['ナイロン', '軽量'], weight: 0.6 },
        { regex: /レザー|革|皮/i, tags: ['レザー', '高級素材'], weight: 0.9 },
        { regex: /デニム/i, tags: ['デニム素材'], weight: 0.8 },
        { regex: /ニット/i, tags: ['ニット素材'], weight: 0.8 },
        { regex: /シフォン/i, tags: ['シフォン', '軽やか素材'], weight: 0.8 },
        { regex: /レース/i, tags: ['レース', 'フェミニン素材'], weight: 0.8 },
        { regex: /ベロア|ベルベット/i, tags: ['ベロア', '高級感'], weight: 0.8 }
      ]
    },
    function: {
      priority: 5,
      patterns: [
        { regex: /ストレッチ|伸縮/i, tags: ['ストレッチ', '機能的'], weight: 0.8 },
        { regex: /撥水|防水/i, tags: ['撥水', '機能的'], weight: 0.8 },
        { regex: /UV[カット]?|紫外線/i, tags: ['UVカット', '機能的'], weight: 0.8 },
        { regex: /吸汗|速乾/i, tags: ['吸汗速乾', 'スポーツ'], weight: 0.8 },
        { regex: /抗菌|防臭/i, tags: ['抗菌防臭', '清潔'], weight: 0.7 },
        { regex: /保温|発熱/i, tags: ['保温', '冬向け'], weight: 0.8 },
        { regex: /冷感|クール/i, tags: ['冷感', '夏向け'], weight: 0.8 }
      ]
    }
  },
  
  // シーズン・タイミング
  temporal: {
    season: {
      priority: 2,
      patterns: [
        { regex: /春|スプリング|春物/i, tags: ['春', '春夏'], weight: 0.9 },
        { regex: /夏|サマー|夏物/i, tags: ['夏', '春夏'], weight: 0.9 },
        { regex: /秋|オータム|秋物/i, tags: ['秋', '秋冬'], weight: 0.9 },
        { regex: /冬|ウィンター|冬物/i, tags: ['冬', '秋冬'], weight: 0.9 },
        { regex: /オールシーズン|通年/i, tags: ['オールシーズン'], weight: 0.7 },
        { regex: /梅雨/i, tags: ['梅雨対策', '季節商品'], weight: 0.8 }
      ]
    },
    occasion: {
      priority: 4,
      patterns: [
        { regex: /通勤|オフィス|ビジネス/i, tags: ['通勤', 'オフィス'], weight: 0.9 },
        { regex: /休日|週末|デイリー/i, tags: ['デイリー', 'カジュアル'], weight: 0.7 },
        { regex: /デート/i, tags: ['デート', 'おでかけ'], weight: 0.8 },
        { regex: /パーティー|結婚式|フォーマル/i, tags: ['パーティー', 'フォーマル'], weight: 0.9 },
        { regex: /旅行|トラベル/i, tags: ['旅行', 'アクティブ'], weight: 0.8 },
        { regex: /スポーツ|ジム|ヨガ/i, tags: ['スポーツ', 'アクティブ'], weight: 0.8 },
        { regex: /リモート|在宅|おうち/i, tags: ['リモートワーク', 'リラックス'], weight: 0.8 }
      ]
    }
  },
  
  // ディテール・特徴
  details: {
    design: {
      priority: 5,
      patterns: [
        { regex: /ロング|長め|ロング丈/i, tags: ['ロング丈'], weight: 0.8 },
        { regex: /ショート|短め|ミニ/i, tags: ['ショート丈'], weight: 0.8 },
        { regex: /ミディアム|ミディ|膝丈/i, tags: ['ミディアム丈'], weight: 0.8 },
        { regex: /マキシ|フロア/i, tags: ['マキシ丈', 'ロング'], weight: 0.8 },
        { regex: /オーバーサイズ|ビッグ|ゆったり/i, tags: ['オーバーサイズ', 'リラックスフィット'], weight: 0.8 },
        { regex: /タイト|スリム|細身/i, tags: ['タイトフィット', 'スリム'], weight: 0.8 },
        { regex: /Aライン/i, tags: ['Aライン', 'フレア'], weight: 0.8 },
        { regex: /ストレート/i, tags: ['ストレート', 'ベーシック'], weight: 0.7 },
        { regex: /フレア|広がり/i, tags: ['フレア', '女性らしい'], weight: 0.8 }
      ]
    },
    decoration: {
      priority: 6,
      patterns: [
        { regex: /プリーツ/i, tags: ['プリーツ', 'ディテール'], weight: 0.8 },
        { regex: /フリル|レース/i, tags: ['フリル', 'フェミニンディテール'], weight: 0.8 },
        { regex: /刺繍|エンブロイダリー/i, tags: ['刺繍', 'ディテール'], weight: 0.8 },
        { regex: /ポケット付/i, tags: ['ポケット付き', '機能的'], weight: 0.7 },
        { regex: /ボタン/i, tags: ['ボタン', 'ディテール'], weight: 0.6 },
        { regex: /リボン/i, tags: ['リボン', 'フェミニン'], weight: 0.8 },
        { regex: /ビジュー|スタッズ/i, tags: ['装飾', 'デコラティブ'], weight: 0.8 },
        { regex: /タック/i, tags: ['タック', 'デザイン'], weight: 0.7 },
        { regex: /ギャザー/i, tags: ['ギャザー', 'ふんわり'], weight: 0.8 }
      ]
    }
  }
};

// タグスコアリングのための重み付け設定
const SCORING_WEIGHTS = {
  titleMatch: 2.0,      // タイトルマッチの重み
  descriptionMatch: 1.0, // 説明文マッチの重み
  brandMatch: 1.5,      // ブランド特性マッチの重み
  priceMatch: 1.2,      // 価格帯マッチの重み
  reviewMatch: 1.3,     // レビュー評価の重み
  seasonMatch: 1.8,     // 季節性の重み
  trendMatch: 1.6       // トレンド性の重み
};

// 価格帯による詳細なスタイル推定
function getDetailedPriceRangeTags(price) {
  const tags = [];
  if (price < 1500) {
    tags.push({ tag: '激安', weight: 0.9 });
    tags.push({ tag: '1500円以下', weight: 0.9 });
  } else if (price < 3000) {
    tags.push({ tag: 'プチプラ', weight: 0.9 });
    tags.push({ tag: '3000円以下', weight: 0.8 });
  } else if (price < 5000) {
    tags.push({ tag: 'お手頃', weight: 0.8 });
    tags.push({ tag: '5000円以下', weight: 0.8 });
  } else if (price < 10000) {
    tags.push({ tag: 'ミドルプライス', weight: 0.8 });
    tags.push({ tag: '1万円以下', weight: 0.7 });
  } else if (price < 20000) {
    tags.push({ tag: 'やや高級', weight: 0.8 });
    tags.push({ tag: '2万円以下', weight: 0.7 });
  } else if (price < 30000) {
    tags.push({ tag: 'ハイプライス', weight: 0.9 });
    tags.push({ tag: '高級', weight: 0.8 });
  } else {
    tags.push({ tag: 'ラグジュアリー', weight: 1.0 });
    tags.push({ tag: '最高級', weight: 0.9 });
  }
  return tags;
}

// ブランド特性マッピング（拡張版）
const BRAND_CHARACTERISTICS_EXTENDED = {
  // メガブランド
  'UNIQLO': { 
    tags: ['ベーシック', 'シンプル', '機能的', '高品質', 'コスパ最強'],
    style: 'basic',
    priceRange: 'affordable'
  },
  'GU': { 
    tags: ['トレンド', 'プチプラ', 'カジュアル', 'ファストファッション', '若者向け'],
    style: 'trendy',
    priceRange: 'budget'
  },
  'しまむら': {
    tags: ['激安', 'ファミリー', 'デイリー', '実用的'],
    style: 'casual',
    priceRange: 'budget'
  },
  '無印良品': {
    tags: ['シンプル', 'ナチュラル', 'サステナブル', '質実剛健', 'ミニマル'],
    style: 'minimal',
    priceRange: 'mid-range'
  },
  'ZARA': {
    tags: ['モード', 'トレンド', 'ヨーロピアン', 'ファストファッション', 'スタイリッシュ'],
    style: 'modern',
    priceRange: 'affordable'
  },
  'H&M': {
    tags: ['北欧', 'トレンド', 'サステナブル', 'カラフル', 'ファストファッション'],
    style: 'trendy',
    priceRange: 'budget'
  },
  
  // セレクトショップ
  'BEAMS': {
    tags: ['セレクトショップ', 'カジュアル', 'アメカジ', 'こだわり', '上質'],
    style: 'select',
    priceRange: 'premium'
  },
  'UNITED ARROWS': {
    tags: ['きれいめ', 'セレクトショップ', '大人カジュアル', '洗練', 'ビジネスカジュアル'],
    style: 'sophisticated',
    priceRange: 'premium'
  },
  'SHIPS': {
    tags: ['トラッド', 'きれいめ', 'オフィスカジュアル', '上品', '大人'],
    style: 'traditional',
    priceRange: 'premium'
  },
  'URBAN RESEARCH': {
    tags: ['都会的', 'モダン', 'セレクト', 'トレンド', 'アーバン'],
    style: 'urban',
    priceRange: 'mid-range'
  },
  
  // ECブランド
  'Re:EDIT': {
    tags: ['韓国系', 'トレンド', 'プチプラ', 'インスタ映え', '今っぽい'],
    style: 'k-fashion',
    priceRange: 'budget'
  },
  'coca': {
    tags: ['ナチュラル', 'カジュアル', 'リラックス', '大人可愛い', 'デイリー'],
    style: 'natural',
    priceRange: 'affordable'
  },
  'pierrot': {
    tags: ['大人カジュアル', 'きれいめ', 'オフィス', 'プチプラ', '通勤服'],
    style: 'office-casual',
    priceRange: 'budget'
  },
  'fifth': {
    tags: ['韓国系', 'ガーリー', 'プチプラ', 'フェミニン', '甘め'],
    style: 'girly',
    priceRange: 'budget'
  },
  'titivate': {
    tags: ['きれいめ', 'オフィス', 'トレンド', '大人女子', 'モテ服'],
    style: 'feminine-office',
    priceRange: 'affordable'
  }
};

// 季節による重み付け調整
function getSeasonalWeight() {
  const month = new Date().getMonth() + 1;
  const weights = {
    spring: month >= 3 && month <= 5 ? 1.5 : 0.7,
    summer: month >= 6 && month <= 8 ? 1.5 : 0.7,
    autumn: month >= 9 && month <= 11 ? 1.5 : 0.7,
    winter: (month === 12 || month <= 2) ? 1.5 : 0.7
  };
  return weights;
}

// タグの関連性スコアを計算
function calculateTagRelevance(tag, product, context = {}) {
  let score = 1.0;
  
  // タイトルに含まれる場合
  if (product.itemName && product.itemName.includes(tag)) {
    score *= SCORING_WEIGHTS.titleMatch;
  }
  
  // 説明文に含まれる場合
  if (product.itemCaption && product.itemCaption.includes(tag)) {
    score *= SCORING_WEIGHTS.descriptionMatch;
  }
  
  // ブランド特性と一致する場合
  const brandInfo = BRAND_CHARACTERISTICS_EXTENDED[product.shopName];
  if (brandInfo && brandInfo.tags.includes(tag)) {
    score *= SCORING_WEIGHTS.brandMatch;
  }
  
  // 季節タグの場合
  const seasonalWeights = getSeasonalWeight();
  if (tag === '春' || tag === '春夏') score *= seasonalWeights.spring;
  if (tag === '夏' || tag === '春夏') score *= seasonalWeights.summer;
  if (tag === '秋' || tag === '秋冬') score *= seasonalWeights.autumn;
  if (tag === '冬' || tag === '秋冬') score *= seasonalWeights.winter;
  
  // レビュー評価による補正
  if (product.reviewAverage >= 4.5) {
    score *= 1.2;
  }
  
  return score;
}

/**
 * 超高精度タグ抽出関数（機械学習的アプローチ）
 */
function extractEnhancedTags(product) {
  const tagScores = new Map(); // タグとスコアのマップ
  
  // 1. テキスト情報の統合
  const searchText = `${product.itemName || ''} ${product.itemCaption || ''} ${product.catchcopy || ''}`;
  
  // 2. 階層的パターンマッチング
  Object.entries(TAG_HIERARCHY).forEach(([mainCategory, subCategories]) => {
    Object.entries(subCategories).forEach(([subCategory, config]) => {
      const { priority, patterns } = config;
      
      patterns.forEach(({ regex, tags, weight }) => {
        if (regex.test(searchText)) {
          tags.forEach(tag => {
            const currentScore = tagScores.get(tag) || 0;
            const relevance = calculateTagRelevance(tag, product);
            const finalScore = weight * relevance * (1 / priority); // 優先度が高いほどスコアが高い
            tagScores.set(tag, Math.max(currentScore, finalScore));
          });
        }
      });
    });
  });
  
  // 3. 価格帯タグ（重み付き）
  if (product.itemPrice) {
    const priceTags = getDetailedPriceRangeTags(product.itemPrice);
    priceTags.forEach(({ tag, weight }) => {
      const currentScore = tagScores.get(tag) || 0;
      tagScores.set(tag, Math.max(currentScore, weight * SCORING_WEIGHTS.priceMatch));
    });
  }
  
  // 4. ブランド特性タグ（詳細版）
  const shopName = product.shopName || '';
  Object.entries(BRAND_CHARACTERISTICS_EXTENDED).forEach(([brand, info]) => {
    if (shopName.toLowerCase().includes(brand.toLowerCase())) {
      info.tags.forEach(tag => {
        const currentScore = tagScores.get(tag) || 0;
        tagScores.set(tag, Math.max(currentScore, SCORING_WEIGHTS.brandMatch));
      });
    }
  });
  
  // 5. 楽天カテゴリ情報の詳細活用
  if (product.genreId) {
    const genreId = String(product.genreId);
    if (genreId.startsWith('10037')) {
      tagScores.set('レディース', 1.0);
      tagScores.set('女性向け', 0.9);
    }
    if (genreId.startsWith('10038')) {
      tagScores.set('メンズ', 1.0);
      tagScores.set('男性向け', 0.9);
    }
    if (genreId.startsWith('10039')) {
      tagScores.set('キッズ', 1.0);
      tagScores.set('子供服', 0.9);
    }
  }
  
  // 6. レビューベースのタグ
  if (product.reviewCount && product.reviewAverage) {
    if (product.reviewCount >= 100 && product.reviewAverage >= 4.0) {
      tagScores.set('売れ筋', 0.9);
      tagScores.set('人気商品', 0.9);
    }
    if (product.reviewAverage >= 4.5) {
      tagScores.set('高評価', 1.0);
      tagScores.set('おすすめ', 0.9);
    }
  }
  
  // 7. サイズ展開によるタグ
  if (searchText.includes('S M L')) {
    tagScores.set('標準サイズ', 0.7);
    tagScores.set('サイズ展開豊富', 0.8);
  }
  if (searchText.includes('F') || searchText.includes('フリーサイズ')) {
    tagScores.set('フリーサイズ', 0.9);
    tagScores.set('ワンサイズ', 0.8);
  }
  if (searchText.includes('大きいサイズ') || searchText.includes('LL') || searchText.includes('3L')) {
    tagScores.set('大きいサイズ', 1.0);
    tagScores.set('ゆったり', 0.8);
  }
  
  // 8. トレンド・新着タグ
  const itemDate = new Date(product.itemUpdateTimestamp || product.startTime);
  const daysSinceUpdate = (new Date() - itemDate) / (1000 * 60 * 60 * 24);
  
  if (daysSinceUpdate <= 3) {
    tagScores.set('新着', 1.0);
    tagScores.set('NEW', 1.0);
  } else if (daysSinceUpdate <= 7) {
    tagScores.set('今週の新作', 0.9);
  } else if (daysSinceUpdate <= 30) {
    tagScores.set('今月の新作', 0.8);
  }
  
  // 9. 特殊なタグ（セール、限定など）
  if (product.limitedFlag) {
    tagScores.set('限定商品', 1.0);
    tagScores.set('数量限定', 0.9);
  }
  if (product.pointRate > 1) {
    tagScores.set('ポイントアップ', 0.8);
    tagScores.set('お得', 0.7);
  }
  if (searchText.includes('セール') || searchText.includes('SALE')) {
    tagScores.set('セール', 1.0);
    tagScores.set('割引中', 0.9);
  }
  
  // 10. 基本カテゴリは必須
  tagScores.set('ファッション', 0.5);
  
  // タグをスコア順にソートして上位を選択
  const sortedTags = Array.from(tagScores.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([tag, score]) => ({ tag, score }));
  
  // スコアが閾値以上のタグのみを選択（最大30個）
  const threshold = 0.5;
  const selectedTags = sortedTags
    .filter(item => item.score >= threshold)
    .slice(0, 30)
    .map(item => item.tag);
  
  return selectedTags;
}

/**
 * タグの相関関係分析
 */
function analyzeTagCorrelations(tags) {
  const correlations = {
    style: [],
    price: [],
    season: [],
    target: [],
    feature: []
  };
  
  tags.forEach(tag => {
    // スタイル系
    if (['カジュアル', 'フォーマル', 'きれいめ', 'ストリート', 'モード'].includes(tag)) {
      correlations.style.push(tag);
    }
    // 価格系
    if (tag.includes('プチプラ') || tag.includes('円') || tag.includes('高級')) {
      correlations.price.push(tag);
    }
    // 季節系
    if (['春', '夏', '秋', '冬'].some(season => tag.includes(season))) {
      correlations.season.push(tag);
    }
    // ターゲット系
    if (tag.includes('代') || tag.includes('向け')) {
      correlations.target.push(tag);
    }
    // 特徴系
    if (['新着', 'セール', '限定', '人気'].some(feature => tag.includes(feature))) {
      correlations.feature.push(tag);
    }
  });
  
  return correlations;
}

/**
 * ユーザー嗜好に基づくタグの重み付け（将来実装用）
 */
function personalizeTagWeights(tags, userPreferences = {}) {
  // ユーザーの過去のスワイプ履歴から好みを推定
  const personalizedTags = tags.map(tag => {
    let weight = 1.0;
    
    // ユーザーが好むスタイルの場合
    if (userPreferences.favoriteStyles?.includes(tag)) {
      weight *= 1.5;
    }
    
    // ユーザーが避けるスタイルの場合
    if (userPreferences.avoidStyles?.includes(tag)) {
      weight *= 0.5;
    }
    
    // 価格帯の好み
    if (userPreferences.priceRange) {
      if (tag.includes('プチプラ') && userPreferences.priceRange === 'budget') {
        weight *= 1.3;
      } else if (tag.includes('高級') && userPreferences.priceRange === 'luxury') {
        weight *= 1.3;
      }
    }
    
    return { tag, weight };
  });
  
  // 重み順にソート
  return personalizedTags
    .sort((a, b) => b.weight - a.weight)
    .map(item => item.tag);
}

// エクスポート
module.exports = {
  extractEnhancedTags,
  calculateTagRelevance,
  analyzeTagCorrelations,
  personalizeTagWeights,
  TAG_HIERARCHY,
  BRAND_CHARACTERISTICS_EXTENDED,
  SCORING_WEIGHTS
};

// 直接実行時のテスト
if (require.main === module) {
  // テストデータ
  const testProduct = {
    itemName: '【新作】花柄ワンピース レディース 春夏 ロング丈 シフォン素材 韓国風',
    itemPrice: 3980,
    shopName: 'Re:EDIT',
    itemCaption: 'トレンドの花柄を取り入れた、エレガントなワンピース。軽やかなシフォン素材で春夏にぴったり。韓国風のデザインで今っぽさ満点。',
    genreId: '100371',
    reviewAverage: 4.5,
    reviewCount: 150,
    itemUpdateTimestamp: new Date().toISOString()
  };
  
  console.log('テスト商品:', testProduct.itemName);
  console.log('\n抽出されたタグ:');
  const tags = extractEnhancedTags(testProduct);
  tags.forEach((tag, index) => {
    console.log(`  ${index + 1}. ${tag}`);
  });
  
  console.log('\n相関関係分析:');
  const correlations = analyzeTagCorrelations(tags);
  Object.entries(correlations).forEach(([category, catTags]) => {
    if (catTags.length > 0) {
      console.log(`  ${category}: ${catTags.join(', ')}`);
    }
  });
}

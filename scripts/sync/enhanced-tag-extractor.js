/**
 * 商品データから高精度なタグを抽出するモジュール
 */

/**
 * 楽天商品からタグを抽出
 */
function extractEnhancedTags(product) {
  const tags = [];
  
  // 商品名と説明文を小文字に変換
  const itemName = (product.itemName || '').toLowerCase();
  const itemCaption = (product.itemCaption || '').toLowerCase();
  const shopName = (product.shopName || '').toLowerCase();
  const genreId = product.genreId || '';
  
  // ジャンルIDベースのタグ
  if (genreId === '100371' || itemName.includes('レディース')) {
    tags.push('レディース');
  }
  if (genreId === '551177' || itemName.includes('メンズ')) {
    tags.push('メンズ');
  }
  
  // 商品カテゴリのタグ
  const categoryPatterns = {
    'ワンピース': /ワンピース|ドレス|dress/,
    'トップス': /トップス|シャツ|ブラウス|tシャツ|t-shirt|カットソー|ニット|セーター|パーカー/,
    'ボトムス': /パンツ|ズボン|スラックス|ジーンズ|デニム|チノ/,
    'スカート': /スカート|skirt/,
    'アウター': /アウター|コート|ジャケット|ブルゾン|カーディガン/,
    'バッグ': /バッグ|鞄|かばん|リュック|トート|ショルダー/,
    'シューズ': /シューズ|靴|スニーカー|パンプス|ブーツ|サンダル/,
    'アクセサリー': /アクセサリー|ネックレス|ピアス|イヤリング|ブレスレット/,
  };
  
  for (const [tag, pattern] of Object.entries(categoryPatterns)) {
    if (pattern.test(itemName) || pattern.test(itemCaption)) {
      tags.push(tag);
    }
  }
  
  // スタイルタグ
  const stylePatterns = {
    'カジュアル': /カジュアル|casual|ラフ|リラックス/,
    'フォーマル': /フォーマル|formal|ビジネス|オフィス|スーツ/,
    'ストリート': /ストリート|street|ヒップホップ|スケーター/,
    'フェミニン': /フェミニン|feminine|ガーリー|可愛い|かわいい|レース|フリル/,
    'モード': /モード|mode|モダン|シック|ミニマル/,
    'ナチュラル': /ナチュラル|natural|シンプル|ベーシック|無地/,
    'エレガント': /エレガント|elegant|上品|きれいめ|大人/,
    'スポーティ': /スポーツ|sport|アスレ|ジム|ランニング/,
  };
  
  for (const [tag, pattern] of Object.entries(stylePatterns)) {
    if (pattern.test(itemName) || pattern.test(itemCaption)) {
      tags.push(tag);
    }
  }
  
  // 素材タグ
  const materialPatterns = {
    'コットン': /コットン|綿|cotton/,
    'ポリエステル': /ポリエステル|polyester/,
    'デニム': /デニム|ジーンズ|denim/,
    'ニット': /ニット|knit|ウール|wool/,
    'レザー': /レザー|革|leather|本革|合皮/,
    'シルク': /シルク|silk|絹/,
    'リネン': /リネン|麻|linen/,
  };
  
  for (const [tag, pattern] of Object.entries(materialPatterns)) {
    if (pattern.test(itemName) || pattern.test(itemCaption)) {
      tags.push(tag);
    }
  }
  
  // 季節タグ
  const seasonPatterns = {
    '春夏': /春夏|春|夏|サマー|summer|スプリング|spring/,
    '秋冬': /秋冬|秋|冬|ウィンター|winter|オータム|autumn/,
    'オールシーズン': /オールシーズン|通年|all season/,
  };
  
  for (const [tag, pattern] of Object.entries(seasonPatterns)) {
    if (pattern.test(itemName) || pattern.test(itemCaption)) {
      tags.push(tag);
    }
  }
  
  // 特徴タグ
  const featurePatterns = {
    'ストレッチ': /ストレッチ|stretch|伸縮/,
    '撥水': /撥水|防水|water/,
    'UV対策': /uv|紫外線/,
    '大きいサイズ': /大きいサイズ|ビッグサイズ|plus size|3l|4l|5l/,
    '小さいサイズ': /小さいサイズ|プチサイズ|xs|petite/,
  };
  
  for (const [tag, pattern] of Object.entries(featurePatterns)) {
    if (pattern.test(itemName) || pattern.test(itemCaption)) {
      tags.push(tag);
    }
  }
  
  // ブランドタグ（主要ブランドのみ）
  const brandPatterns = {
    'ユニクロ': /ユニクロ|uniqlo/,
    'GU': /gu|ジーユー/,
    'ZARA': /zara|ザラ/,
    'H&M': /h&m|エイチアンドエム/,
    '無印良品': /無印|muji/,
  };
  
  for (const [tag, pattern] of Object.entries(brandPatterns)) {
    if (pattern.test(shopName) || pattern.test(itemName)) {
      tags.push(tag);
    }
  }
  
  // 重複を除去して返す
  return [...new Set(tags)];
}

module.exports = {
  extractEnhancedTags
};

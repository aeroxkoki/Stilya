/**
 * タグマッピングユーティリティ (CommonJS版)
 * sync-rakuten-products.js等のバッチ処理から利用可能
 */

/**
 * スタイル優先度マップ
 * スタイルごとの特徴的なキーワードとその重み
 */
const STYLE_PRIORITY_KEYWORDS = {
  casual: {
    'カジュアル': 3,
    'デイリー': 2,
    'ラフ': 2,
    'リラックス': 2,
    'アメカジ': 2,
    'デニム': 1,
    'Tシャツ': 1,
    'スニーカー': 1,
  },
  street: {
    'ストリート': 3,
    'スケーター': 2,
    'ヒップホップ': 2,
    'グラフィック': 1,
    'オーバーサイズ': 1,
    'キャップ': 1,
  },
  mode: {
    'モード': 3,
    'モダン': 2,
    'ミニマル': 2,
    'シンプル': 1,
    'モノトーン': 1,
    '黒': 1,
    'ブラック': 1,
  },
  natural: {
    'ナチュラル': 3,
    'オーガニック': 2,
    '自然': 2,
    'リネン': 1,
    'コットン': 1,
    'ベージュ': 1,
    'アース': 1,
  },
  classic: {
    'クラシック': 3,
    'きれいめ': 3,
    'オフィス': 2,
    'ビジネス': 2,
    'フォーマル': 2,
    'トラッド': 2,
    'コンサバ': 2,
    'エレガント': 2,
    'ジャケット': 1,
    'シャツ': 1,
    'ブラウス': 1,
    'ベーシック': 2, // basicタグもclassicにマッピング
    'basic': 2,
  },
  feminine: {
    'フェミニン': 3,
    'ガーリー': 2,
    'キュート': 2,
    'かわいい': 2,
    'ワンピース': 1,
    'スカート': 1,
    'フリル': 1,
    'レース': 1,
    'ピンク': 1,
  },
};

/**
 * 改良版スタイル判定（重み付け考慮）
 * @param {string[]} tags - タグの配列
 * @param {string} [category] - カテゴリ（オプショナル）
 * @returns {string} - 判定されたスタイル
 */
function determineProductStyleAdvanced(tags, category) {
  if (!tags || tags.length === 0) return 'casual';
  
  const styleScores = {};
  
  tags.forEach(tag => {
    const normalizedTag = tag.trim();
    
    // 各スタイルのキーワードと照合
    Object.entries(STYLE_PRIORITY_KEYWORDS).forEach(([styleId, keywords]) => {
      Object.entries(keywords).forEach(([keyword, weight]) => {
        if (normalizedTag === keyword || normalizedTag.includes(keyword)) {
          styleScores[styleId] = (styleScores[styleId] || 0) + weight;
        }
      });
    });
  });
  
  // カテゴリによる補正
  if (category) {
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes('ワンピース') || categoryLower.includes('スカート')) {
      styleScores.feminine = (styleScores.feminine || 0) + 1;
    }
    if (categoryLower.includes('ジャケット') || categoryLower.includes('スーツ')) {
      styleScores.classic = (styleScores.classic || 0) + 1;
    }
    if (categoryLower.includes('パーカー') || categoryLower.includes('スウェット')) {
      styleScores.casual = (styleScores.casual || 0) + 1;
    }
  }
  
  // スコアが同じ場合の優先順位
  const stylePriority = ['classic', 'mode', 'feminine', 'natural', 'street', 'casual'];
  
  if (Object.keys(styleScores).length === 0) {
    // スコアがない場合、ベーシックタグがあればclassicに
    if (tags.some(tag => tag.toLowerCase() === 'basic' || tag === 'ベーシック')) {
      return 'classic';
    }
    return 'casual';
  }
  
  // 最高スコアを取得
  const maxScore = Math.max(...Object.values(styleScores));
  const topStyles = Object.entries(styleScores)
    .filter(([, score]) => score === maxScore)
    .map(([style]) => style);
  
  // 同スコアの場合は優先順位で決定
  for (const style of stylePriority) {
    if (topStyles.includes(style)) {
      return style;
    }
  }
  
  return topStyles[0] || 'casual';
}

module.exports = {
  determineProductStyleAdvanced,
  STYLE_PRIORITY_KEYWORDS
};

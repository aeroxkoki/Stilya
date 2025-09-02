/**
 * タグマッピングサービス
 * データベースの日本語タグと英語スタイルタグの整合性を管理
 */

import { STYLE_TAG_MAPPING, JP_TAG_TO_STYLE_ID } from '@/constants/constants';
import { Product } from '@/types/product';

/**
 * 商品の日本語タグから最も適切なスタイルを判定
 */
export const determineProductStyle = (tags: string[]): string => {
  if (!tags || tags.length === 0) return 'casual'; // デフォルト

  const styleScores: Record<string, number> = {};
  
  // 各タグがどのスタイルに関連するかをスコアリング
  tags.forEach(tag => {
    const normalizedTag = tag.toLowerCase().trim();
    
    // 直接マッピングがある場合
    if (JP_TAG_TO_STYLE_ID[tag]) {
      const styleId = JP_TAG_TO_STYLE_ID[tag];
      styleScores[styleId] = (styleScores[styleId] || 0) + 2; // 直接マッピングは高スコア
    }
    
    // STYLE_TAG_MAPPINGから関連スタイルを探す
    Object.entries(STYLE_TAG_MAPPING).forEach(([styleId, styleTags]) => {
      if (styleTags.some(styleTag => 
        styleTag.toLowerCase() === normalizedTag || 
        normalizedTag.includes(styleTag.toLowerCase()) || 
        styleTag.toLowerCase().includes(normalizedTag)
      )) {
        styleScores[styleId] = (styleScores[styleId] || 0) + 1;
      }
    });
  });
  
  // 最高スコアのスタイルを返す
  if (Object.keys(styleScores).length === 0) {
    return 'casual'; // デフォルト
  }
  
  const topStyle = Object.entries(styleScores)
    .sort(([, a], [, b]) => b - a)[0][0];
  
  return topStyle;
};

/**
 * スタイル優先度マップ
 * スタイルごとの特徴的なキーワードとその重み
 */
const STYLE_PRIORITY_KEYWORDS: Record<string, Record<string, number>> = {
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
 */
export const determineProductStyleAdvanced = (tags: string[], category?: string): string => {
  if (!tags || tags.length === 0) return 'casual';
  
  const styleScores: Record<string, number> = {};
  
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
};

/**
 * 商品リストのスタイルタグを更新
 */
export const enrichProductsWithStyles = (products: Product[]): Product[] => {
  return products.map(product => {
    const style = determineProductStyleAdvanced(product.tags || [], product.category);
    
    return {
      ...product,
      style_tags: [style],
      // メタデータにスタイル情報を追加
      metadata: {
        ...product.metadata,
        primaryStyle: style,
        styleConfidence: calculateStyleConfidence(product.tags || [], style),
      }
    };
  });
};

/**
 * スタイル判定の信頼度を計算
 */
const calculateStyleConfidence = (tags: string[], determinedStyle: string): number => {
  if (!tags || tags.length === 0) return 0.3;
  
  const keywords = STYLE_PRIORITY_KEYWORDS[determinedStyle];
  if (!keywords) return 0.3;
  
  let matchScore = 0;
  let maxPossibleScore = 0;
  
  Object.entries(keywords).forEach(([keyword, weight]) => {
    maxPossibleScore += weight;
    if (tags.some(tag => tag.includes(keyword))) {
      matchScore += weight;
    }
  });
  
  if (maxPossibleScore === 0) return 0.3;
  
  // 0.3から1.0の範囲で信頼度を返す
  return 0.3 + (0.7 * (matchScore / maxPossibleScore));
};

/**
 * ユーザーの好みスタイルを分析
 */
export const analyzeUserStylePreference = (
  swipeHistory: Array<{ result: string; tags: string[] }>
): Record<string, number> => {
  const stylePreferences: Record<string, number> = {
    casual: 0,
    street: 0,
    mode: 0,
    natural: 0,
    classic: 0,
    feminine: 0,
  };
  
  swipeHistory.forEach(swipe => {
    if (swipe.result === 'yes' && swipe.tags) {
      const style = determineProductStyleAdvanced(swipe.tags);
      stylePreferences[style] = (stylePreferences[style] || 0) + 1;
    } else if (swipe.result === 'no' && swipe.tags) {
      const style = determineProductStyleAdvanced(swipe.tags);
      stylePreferences[style] = (stylePreferences[style] || 0) - 0.5;
    }
  });
  
  // 正規化（0-1の範囲に）
  const maxScore = Math.max(...Object.values(stylePreferences), 1);
  const minScore = Math.min(...Object.values(stylePreferences), 0);
  const range = maxScore - minScore || 1;
  
  Object.keys(stylePreferences).forEach(style => {
    stylePreferences[style] = (stylePreferences[style] - minScore) / range;
  });
  
  return stylePreferences;
};

export default {
  determineProductStyle,
  determineProductStyleAdvanced,
  enrichProductsWithStyles,
  analyzeUserStylePreference,
  calculateStyleConfidence,
};

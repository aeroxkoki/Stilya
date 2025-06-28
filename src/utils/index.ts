import formatPrice from './formatPrice';
import { getAuthErrorMessage, getApiErrorMessage, handleError } from './errorUtils';
import * as env from './env';
import { optimizeImageUrl, getProductImageUrl, isValidImageUrl } from './imageUtils';

// ランダムなタグを生成するヘルパー関数
export const getRandomTags = (...inputs: string[]): string[] => {
  // 一般的なファッションタグ
  const commonTags = [
    'カジュアル', 'モード', 'ナチュラル', 'ストリート', 'クラシック', 'フェミニン',
    '春', '夏', '秋', '冬', 'おすすめ', 'トレンド', 'ベーシック', '定番',
    'コーデ', 'オフィス', 'デート', 'デイリー', 'リラックス', 'スポーティ'
  ];
  
  // 引数で渡された文字列をタグとして追加
  const tags = [...inputs].filter(Boolean);
  
  // 追加のランダムタグを選択（重複を避ける）
  const additionalTagsNeeded = Math.max(0, 5 - tags.length);
  
  if (additionalTagsNeeded > 0) {
    // すでに入っているタグを除外
    const availableTags = commonTags.filter(tag => !tags.includes(tag));
    // ランダムに選択
    const shuffled = [...availableTags].sort(() => 0.5 - Math.random());
    tags.push(...shuffled.slice(0, additionalTagsNeeded));
  }
  
  return tags;
};

// エラーメッセージのフォーマット
export const formatErrorMessage = (error: any): string => {
  if (!error) return '不明なエラーが発生しました';

  // すでに文字列の場合はそのまま返す
  if (typeof error === 'string') return error;

  // エラーオブジェクトからメッセージを抽出
  if (error.message) return error.message;
  
  // Supabaseの認証エラーの場合
  if (error.error_description) return error.error_description;
  
  // その他のケース
  return JSON.stringify(error);
};

// 類似商品を取得するヘルパー関数
export const getSimilarProducts = (
  product: any, 
  allProducts: any[], 
  count: number = 3
): any[] => {
  if (!product || !product.tags || !Array.isArray(allProducts) || allProducts.length === 0) {
    return [];
  }

  // 同じ商品を除外
  const otherProducts = allProducts.filter(p => p.id !== product.id);
  
  // タグの一致度によって並べ替え
  const productsWithScore = otherProducts.map(p => {
    // タグの一致スコアを計算
    const matchingTags = p.tags?.filter((tag: string) => 
      product.tags.includes(tag)
    ) || [];
    
    return {
      ...p,
      score: matchingTags.length
    };
  });

  // スコアで降順ソート
  const sorted = productsWithScore.sort((a, b) => b.score - a.score);
  
  // 上位N件を返す
  return sorted.slice(0, count);
};

export {
  formatPrice,
  env,
  getAuthErrorMessage,
  getApiErrorMessage,
  handleError,
  optimizeImageUrl,
  getProductImageUrl,
  isValidImageUrl
};

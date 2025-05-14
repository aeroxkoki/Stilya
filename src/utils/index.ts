import formatPrice from './formatPrice';
import { getAuthErrorMessage, getApiErrorMessage, handleError } from './errorUtils';
import * as env from './env';

// タグからランダムなものを選ぶヘルパー関数
export const getRandomTags = (allTags: string[], count: number = 3): string[] => {
  const shuffled = [...allTags].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, allTags.length));
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
  handleError
};

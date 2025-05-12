import { Product } from '@/types';
// ダミーデータのインポート
export * from './dummyData';

// 価格をフォーマットする関数
export const formatPrice = (price: number): string => {
  return price.toLocaleString('ja-JP', { style: 'currency', currency: 'JPY' });
};

// アバター画像URLを生成する関数
export const getAvatarUrl = (userId: string): string => {
  return `https://ui-avatars.com/api/?name=${userId.substring(0, 2)}&background=random`;
};

// デバイスの種類を判定する関数
export const isAndroid = (): boolean => {
  return /android/i.test(navigator.userAgent);
};

export const isIOS = (): boolean => {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
};

// タグベースの類似商品を取得する関数
export const getSimilarProducts = (
  product: Product,
  allProducts: Product[],
  limit: number = 5
): Product[] => {
  if (!product.tags || product.tags.length === 0) {
    return allProducts.slice(0, limit);
  }

  // タグに基づいて商品をスコアリング
  const scoredProducts = allProducts
    .filter(p => p.id !== product.id) // 自分自身を除外
    .map(p => {
      let score = 0;
      if (p.tags && p.tags.length > 0) {
        // 共通タグの数をスコアとして計算
        const commonTags = p.tags.filter(tag => product.tags?.includes(tag));
        score = commonTags.length;
      }
      // 同じブランドならスコアを加算
      if (p.brand && p.brand === product.brand) {
        score += 2;
      }
      // 同じカテゴリならスコアを加算
      if (p.category && p.category === product.category) {
        score += 1;
      }
      return { product: p, score };
    })
    .filter(item => item.score > 0) // スコアが0より大きい商品のみを取得
    .sort((a, b) => b.score - a.score) // スコアの高い順にソート
    .map(item => item.product);

  // 類似商品が limit より少ない場合は、他の商品で埋める
  if (scoredProducts.length < limit) {
    const remainingProducts = allProducts
      .filter(p => p.id !== product.id && !scoredProducts.some(sp => sp.id === p.id))
      .slice(0, limit - scoredProducts.length);
    return [...scoredProducts, ...remainingProducts];
  }

  return scoredProducts.slice(0, limit);
};

// エラーメッセージをフォーマットする関数
export const formatErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  return '不明なエラーが発生しました';
};

// タグをランダムに取得する関数（デモ用）
export const getRandomTags = (): string[] => {
  const allTags = [
    'カジュアル', 'フォーマル', 'ストリート', 'モード', 'ナチュラル',
    '春', '夏', '秋', '冬', 'メンズ', 'レディース', 'ユニセックス',
    'Tシャツ', 'シャツ', 'パンツ', 'スカート', 'ワンピース', 'アウター',
    'シューズ', 'バッグ', 'アクセサリー'
  ];
  
  const tagsCount = Math.floor(Math.random() * 5) + 1; // 1〜5個のタグを選択
  const selectedTags: string[] = [];
  
  for (let i = 0; i < tagsCount; i++) {
    const randomIndex = Math.floor(Math.random() * allTags.length);
    const tag = allTags[randomIndex];
    
    if (!selectedTags.includes(tag)) {
      selectedTags.push(tag);
    }
  }
  
  return selectedTags;
};

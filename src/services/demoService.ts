import { Product, User } from '@/types';

// デモ用の商品データ
const demoProducts: Product[] = [
  {
    id: '1',
    title: 'オーバーサイズTシャツ',
    brand: 'UNIQLO',
    price: 2990,
    category: 'tops',
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
    tags: ['カジュアル', 'メンズ', 'レディース', 'オーバーサイズ', 'Tシャツ'],
    affiliateUrl: 'https://www.uniqlo.com',
    source: 'UNIQLO',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'デニムジャケット',
    brand: 'GU',
    price: 3990,
    category: 'outerwear',
    imageUrl: 'https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?w=400',
    tags: ['カジュアル', 'デニム', 'ジャケット', 'アウター'],
    affiliateUrl: 'https://www.gu-global.com',
    source: 'GU',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'プリーツスカート',
    brand: 'ZARA',
    price: 5990,
    category: 'bottoms',
    imageUrl: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400',
    tags: ['フェミニン', 'レディース', 'スカート', 'プリーツ'],
    affiliateUrl: 'https://www.zara.com',
    source: 'ZARA',
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    title: 'チノパンツ',
    brand: 'MUJI',
    price: 4990,
    category: 'bottoms',
    imageUrl: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400',
    tags: ['ベーシック', 'メンズ', 'チノパン', 'パンツ'],
    affiliateUrl: 'https://www.muji.com',
    source: 'MUJI',
    createdAt: new Date().toISOString(),
  },
  {
    id: '5',
    title: 'ニットカーディガン',
    brand: 'H&M',
    price: 3990,
    category: 'tops',
    imageUrl: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400',
    tags: ['ナチュラル', 'レディース', 'ニット', 'カーディガン'],
    affiliateUrl: 'https://www.hm.com',
    source: 'H&M',
    createdAt: new Date().toISOString(),
  },
];

// ユーザーのスワイプ履歴を保存するためのメモリストレージ
const swipeHistory: { [userId: string]: Array<{ productId: string; result: 'yes' | 'no'; timestamp: string }> } = {};

// ユーザーのお気に入りを保存するためのメモリストレージ
const favorites: { [userId: string]: string[] } = {};

export const DEMO_MODE = process.env.EXPO_PUBLIC_DEMO_MODE === 'true';

export const demoService = {
  // 商品を取得
  getProducts: async (limit: number = 20, offset: number = 0) => {
    // 実際のAPIレスポンスのような遅延をシミュレート
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const paginatedProducts = demoProducts.slice(offset, offset + limit);
    
    return {
      success: true,
      data: paginatedProducts,
      error: null,
    };
  },

  // 単一の商品を取得
  getProductById: async (productId: string) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const product = demoProducts.find(p => p.id === productId);
    
    if (product) {
      return {
        success: true,
        data: product,
        error: null,
      };
    } else {
      return {
        success: false,
        data: null,
        error: '商品が見つかりません',
      };
    }
  },

  // スワイプを保存
  saveSwipe: async (userId: string, productId: string, result: 'yes' | 'no') => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    if (!swipeHistory[userId]) {
      swipeHistory[userId] = [];
    }
    
    const swipeData = {
      productId,
      result,
      timestamp: new Date().toISOString(),
    };
    
    swipeHistory[userId].push(swipeData);
    
    return {
      success: true,
      data: swipeData,
      error: null,
    };
  },

  // ユーザーのスワイプ履歴を取得
  getSwipeHistory: async (userId: string) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const history = swipeHistory[userId] || [];
    
    return {
      success: true,
      data: history,
      error: null,
    };
  },

  // お気に入りに追加
  addToFavorites: async (userId: string, productId: string) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    if (!favorites[userId]) {
      favorites[userId] = [];
    }
    
    if (!favorites[userId].includes(productId)) {
      favorites[userId].push(productId);
    }
    
    return {
      success: true,
      data: { userId, productId },
      error: null,
    };
  },

  // お気に入りから削除
  removeFromFavorites: async (userId: string, productId: string) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    if (favorites[userId]) {
      favorites[userId] = favorites[userId].filter(id => id !== productId);
    }
    
    return {
      success: true,
      data: { userId, productId },
      error: null,
    };
  },

  // ユーザーのお気に入りを取得
  getFavorites: async (userId: string) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const userFavorites = favorites[userId] || [];
    const favoriteProducts = demoProducts.filter(p => userFavorites.includes(p.id));
    
    return {
      success: true,
      data: favoriteProducts,
      error: null,
    };
  },

  // レコメンデーション（簡易版）
  getRecommendations: async (userId: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // スワイプ履歴から「Yes」の商品のタグを収集
    const history = swipeHistory[userId] || [];
    const likedProducts = history
      .filter(h => h.result === 'yes')
      .map(h => demoProducts.find(p => p.id === h.productId))
      .filter(Boolean) as Product[];
    
    const likedTags = new Set<string>();
    likedProducts.forEach(product => {
      product.tags?.forEach(tag => likedTags.add(tag));
    });
    
    // タグが一致する商品を推薦
    const recommendations = demoProducts
      .filter(product => {
        // 既にスワイプした商品は除外
        const isAlreadySwiped = history.some(h => h.productId === product.id);
        if (isAlreadySwiped) return false;
        
        // タグが一致する商品を選択
        const matchingTags = product.tags?.filter(tag => likedTags.has(tag)) || [];
        return matchingTags.length > 0;
      })
      .sort((a, b) => {
        // マッチするタグ数でソート
        const aMatchCount = a.tags?.filter(tag => likedTags.has(tag)).length || 0;
        const bMatchCount = b.tags?.filter(tag => likedTags.has(tag)).length || 0;
        return bMatchCount - aMatchCount;
      });
    
    return {
      success: true,
      data: recommendations.slice(0, 10), // 最大10件
      error: null,
    };
  },
};

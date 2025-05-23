// モックデータを使用したデモモード設定
// このファイルを使用することで、Supabaseの設定なしでアプリをテストできます

import AsyncStorage from '@react-native-async-storage/async-storage';

// デモモードの有効化/無効化
export const DEMO_MODE = process.env.EXPO_PUBLIC_SUPABASE_URL === 'dummy_url';

// モックユーザー
export const mockUser = {
  id: 'demo-user-123',
  email: 'demo@stilya.app',
  nickname: 'デモユーザー',
  gender: 'female',
  ageGroup: '20s',
  stylePreferences: ['casual', 'natural', 'feminine'],
};

// モック商品データ
export const mockProducts = [
  {
    id: '1',
    title: 'オーガニックコットン Tシャツ',
    brand: 'MUJI',
    price: 1990,
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
    affiliateUrl: 'https://example.com/affiliate/1',
    category: 'tops',
    tags: ['casual', 'basic', 'cotton', 'sustainable'],
    gender: 'unisex',
    source: 'linkshare',
  },
  {
    id: '2',
    title: 'フローラルプリント ワンピース',
    brand: 'ZARA',
    price: 5990,
    imageUrl: 'https://images.unsplash.com/photo-1508427953056-b00b8d78ebf5?w=400',
    affiliateUrl: 'https://example.com/affiliate/2',
    category: 'dress',
    tags: ['floral', 'feminine', 'summer', 'elegant'],
    gender: 'female',
    source: 'linkshare',
  },
  {
    id: '3',
    title: 'デニムジャケット',
    brand: 'Levi\'s',
    price: 8990,
    imageUrl: 'https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=400',
    affiliateUrl: 'https://example.com/affiliate/3',
    category: 'outerwear',
    tags: ['denim', 'casual', 'classic', 'versatile'],
    gender: 'unisex',
    source: 'rakuten',
  },
  {
    id: '4',
    title: 'リネンブレンド パンツ',
    brand: 'COS',
    price: 6990,
    imageUrl: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400',
    affiliateUrl: 'https://example.com/affiliate/4',
    category: 'bottoms',
    tags: ['linen', 'natural', 'comfortable', 'summer'],
    gender: 'female',
    source: 'linkshare',
  },
  {
    id: '5',
    title: 'ホワイトスニーカー',
    brand: 'Adidas',
    price: 9900,
    imageUrl: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=400',
    affiliateUrl: 'https://example.com/affiliate/5',
    category: 'shoes',
    tags: ['sneakers', 'white', 'classic', 'comfortable'],
    gender: 'unisex',
    source: 'rakuten',
  },
  {
    id: '6',
    title: 'シルクブラウス',
    brand: 'Theory',
    price: 15000,
    imageUrl: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=400',
    affiliateUrl: 'https://example.com/affiliate/6',
    category: 'tops',
    tags: ['silk', 'elegant', 'business', 'luxury'],
    gender: 'female',
    source: 'linkshare',
  },
  {
    id: '7',
    title: 'ボーダーニット',
    brand: 'Saint James',
    price: 7900,
    imageUrl: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400',
    affiliateUrl: 'https://example.com/affiliate/7',
    category: 'tops',
    tags: ['stripes', 'marine', 'classic', 'french'],
    gender: 'unisex',
    source: 'rakuten',
  },
  {
    id: '8',
    title: 'プリーツスカート',
    brand: 'Issey Miyake',
    price: 35000,
    imageUrl: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400',
    affiliateUrl: 'https://example.com/affiliate/8',
    category: 'bottoms',
    tags: ['pleats', 'designer', 'artistic', 'japanese'],
    gender: 'female',
    source: 'linkshare',
  },
];

// モックスワイプデータ
export const mockSwipes = [
  { id: '1', userId: 'demo-user-123', productId: '1', result: 'yes', createdAt: new Date() },
  { id: '2', userId: 'demo-user-123', productId: '2', result: 'no', createdAt: new Date() },
];

// モックお気に入りデータ
export const mockFavorites = [
  { id: '1', userId: 'demo-user-123', productId: '1', createdAt: new Date() },
];

// デモモード用のサービス
export const demoService = {
  // 認証
  async signUp(email: string, password: string) {
    await AsyncStorage.setItem('demo_user', JSON.stringify(mockUser));
    return { data: { user: mockUser }, error: null };
  },

  async signIn(email: string, password: string) {
    await AsyncStorage.setItem('demo_user', JSON.stringify(mockUser));
    return { data: { user: mockUser }, error: null };
  },

  async signOut() {
    await AsyncStorage.removeItem('demo_user');
    return { error: null };
  },

  async getUser() {
    const userStr = await AsyncStorage.getItem('demo_user');
    if (userStr) {
      return { data: { user: JSON.parse(userStr) }, error: null };
    }
    return { data: { user: null }, error: null };
  },

  // 商品
  async getProducts(limit = 10, offset = 0) {
    // ランダムに商品を返す（実際のAPIのような動作をシミュレート）
    const shuffled = [...mockProducts].sort(() => Math.random() - 0.5);
    return {
      data: shuffled.slice(offset, offset + limit),
      error: null,
    };
  },

  // スワイプ
  async saveSwipe(userId: string, productId: string, result: 'yes' | 'no') {
    const swipes = await AsyncStorage.getItem('demo_swipes');
    const swipeList = swipes ? JSON.parse(swipes) : [];
    swipeList.push({
      id: Date.now().toString(),
      userId,
      productId,
      result,
      createdAt: new Date(),
    });
    await AsyncStorage.setItem('demo_swipes', JSON.stringify(swipeList));
    return { data: swipeList[swipeList.length - 1], error: null };
  },

  // お気に入り
  async addFavorite(userId: string, productId: string) {
    const favorites = await AsyncStorage.getItem('demo_favorites');
    const favoriteList = favorites ? JSON.parse(favorites) : [];
    const newFavorite = {
      id: Date.now().toString(),
      userId,
      productId,
      createdAt: new Date(),
    };
    favoriteList.push(newFavorite);
    await AsyncStorage.setItem('demo_favorites', JSON.stringify(favoriteList));
    return { data: newFavorite, error: null };
  },

  async getFavorites(userId: string) {
    const favorites = await AsyncStorage.getItem('demo_favorites');
    const favoriteList = favorites ? JSON.parse(favorites) : [];
    const userFavorites = favoriteList.filter((f: any) => f.userId === userId);
    
    // お気に入りの商品情報を取得
    const favoriteProducts = userFavorites.map((fav: any) => {
      const product = mockProducts.find(p => p.id === fav.productId);
      return { ...fav, product };
    });
    
    return { data: favoriteProducts, error: null };
  },

  // レコメンド（簡易版）
  async getRecommendations(userId: string) {
    // タグベースの簡易レコメンド
    const swipes = await AsyncStorage.getItem('demo_swipes');
    const swipeList = swipes ? JSON.parse(swipes) : [];
    const likedSwipes = swipeList.filter((s: any) => s.userId === userId && s.result === 'yes');
    
    // いいねしたタグを集計
    const tagCounts: Record<string, number> = {};
    likedSwipes.forEach((swipe: any) => {
      const product = mockProducts.find(p => p.id === swipe.productId);
      if (product) {
        product.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });

    // 人気タグを含む商品を推薦
    const recommendations = mockProducts
      .filter(product => {
        return product.tags.some(tag => tagCounts[tag] > 0);
      })
      .sort((a, b) => {
        const aScore = a.tags.reduce((sum, tag) => sum + (tagCounts[tag] || 0), 0);
        const bScore = b.tags.reduce((sum, tag) => sum + (tagCounts[tag] || 0), 0);
        return bScore - aScore;
      })
      .slice(0, 5);

    return { data: recommendations, error: null };
  },
};

// デモモードメッセージ
export const showDemoModeMessage = () => {
  console.log('🎭 アプリはデモモードで実行されています');
  console.log('💡 実際のデータを使用するには、Supabaseの設定を行ってください');
};
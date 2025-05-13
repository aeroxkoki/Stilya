import { create } from 'zustand';
import { supabase } from '@/services/supabase';
import { 
  fetchProducts,
  fetchProductById,
  fetchProductsByTags,
  fetchNextPage
} from '@/services/productService';
import { saveSwipeResult, getSwipeHistory } from '@/services/swipeService';
import { Product } from '@/types';

interface ProductState {
  products: Product[];
  filteredProducts: Product[];
  favorites: Product[];
  swipeHistory: Product[];
  recommendedProducts: Product[];
  loading: boolean;
  error: string | null;
  hasMoreProducts: boolean;
  totalFetched: number;
  
  // 商品データ取得
  loadProducts: () => Promise<void>;
  loadMoreProducts: () => Promise<void>;
  resetProducts: () => void;
  
  // スワイプ関連
  addSwipe: (userId: string, productId: string, result: 'yes' | 'no') => Promise<void>;
  getSwipeHistory: (userId: string, result?: 'yes' | 'no') => Promise<Product[]>;
  
  // お気に入り関連
  addToFavorites: (userId: string, productId: string) => Promise<void>;
  removeFromFavorites: (userId: string, productId: string) => Promise<void>;
  getFavorites: (userId: string) => Promise<Product[]>;
  isFavorite: (productId: string) => boolean;
  
  // レコメンド関連
  getRecommendedProducts: (userId: string) => Promise<Product[]>;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  filteredProducts: [],
  favorites: [],
  swipeHistory: [],
  recommendedProducts: [],
  loading: false,
  error: null,
  hasMoreProducts: true,
  totalFetched: 0,
  
  loadProducts: async () => {
    try {
      set({ loading: true, error: null });
      
      // 商品データを取得
      const result = await fetchProducts(20, 0, true);
      
      set({
        products: result.products,
        hasMoreProducts: result.hasMore,
        totalFetched: result.totalFetched,
        loading: false
      });
      
      return;
    } catch (error: any) {
      console.error('Error loading products:', error);
      set({ error: error.message || '商品の読み込みに失敗しました', loading: false });
    }
  },
  
  loadMoreProducts: async () => {
    try {
      const { hasMoreProducts, loading } = get();
      
      // ロード中または次のページがない場合は処理しない
      if (!hasMoreProducts || loading) return;
      
      set({ loading: true });
      
      // 次のページを取得
      const result = await fetchNextPage();
      
      if (result.products.length > 0) {
        set(state => ({
          products: [...state.products, ...result.products],
          hasMoreProducts: result.hasMore,
          totalFetched: result.totalFetched,
          loading: false
        }));
      } else {
        set({ hasMoreProducts: false, loading: false });
      }
    } catch (error: any) {
      console.error('Error loading more products:', error);
      set({ error: error.message || '商品の追加読み込みに失敗しました', loading: false });
    }
  },
  
  resetProducts: () => {
    set({
      products: [],
      filteredProducts: [],
      loading: false,
      error: null,
      hasMoreProducts: true,
      totalFetched: 0
    });
  },
  
  addSwipe: async (userId: string, productId: string, result: 'yes' | 'no') => {
    try {
      // スワイプ結果を保存 (swipeServiceを使用)
      await saveSwipeResult(userId, productId, result);
      
      // スワイプしたことを記録（メモリ内のみ）
      const swipedProduct = get().products.find(p => p.id === productId);
      if (swipedProduct) {
        if (result === 'yes') {
          // Yesの場合、レコメンド候補に追加（簡易実装）
          set(state => ({
            recommendedProducts: [...state.recommendedProducts, swipedProduct]
          }));
        }
      }
    } catch (error: any) {
      console.error('Error adding swipe:', error);
      // スワイプエラーはUIに表示しない（バックグラウンド処理）
    }
  },
  
  getSwipeHistory: async (userId: string, result?: 'yes' | 'no') => {
    try {
      set({ loading: true, error: null });
      
      // swipeServiceを使用してスワイプ履歴を取得
      const swipes = await getSwipeHistory(userId, result);
      
      // 商品データを取得
      const products: Product[] = [];
      for (const swipe of swipes) {
        const product = await fetchProductById(swipe.productId);
        if (product) {
          products.push(product);
        }
      }
      
      set({ swipeHistory: products, loading: false });
      return products;
    } catch (error: any) {
      console.error('Error fetching swipe history:', error);
      set({ error: error.message || 'スワイプ履歴の取得に失敗しました', loading: false });
      return [];
    }
  },
  
  addToFavorites: async (userId: string, productId: string) => {
    try {
      // 現在のお気に入りリスト
      const currentFavorites = get().favorites;
      
      // 商品データの取得
      const product = get().products.find(p => p.id === productId);
      if (!product) {
        throw new Error('商品が見つかりません');
      }
      
      // すでにお気に入りに追加済みかチェック
      if (currentFavorites.some(p => p.id === productId)) {
        return; // すでに追加済みの場合は何もしない
      }
      
      // MVPテスト用: メモリ内のみでお気に入りを管理
      const newFavorites = [...currentFavorites, product];
      set({ favorites: newFavorites });
      
      // コンソールにログを出力（テスト用）
      console.log(`お気に入り追加（テスト）: ユーザー ${userId} が商品 ${productId} をお気に入りに追加`);
      
      /*
      // 本番環境では以下のコードを使用（Supabase連携）
      const { error } = await supabase
        .from('favorites')
        .insert([{ 
          user_id: userId, 
          product_id: productId 
        }]);
        
      if (error) throw error;
      
      // お気に入りリストを更新
      await getFavorites(userId);
      */
    } catch (error: any) {
      console.error('Error adding to favorites:', error);
      // UI上でのエラー表示は必要に応じて
    }
  },
  
  removeFromFavorites: async (userId: string, productId: string) => {
    try {
      // 現在のお気に入りリスト
      const currentFavorites = get().favorites;
      
      // お気に入りから削除
      const newFavorites = currentFavorites.filter(p => p.id !== productId);
      set({ favorites: newFavorites });
      
      // コンソールにログを出力（テスト用）
      console.log(`お気に入り削除（テスト）: ユーザー ${userId} が商品 ${productId} をお気に入りから削除`);
      
      /*
      // 本番環境では以下のコードを使用（Supabase連携）
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId);
        
      if (error) throw error;
      
      // お気に入りリストを更新
      await getFavorites(userId);
      */
    } catch (error: any) {
      console.error('Error removing from favorites:', error);
      // UI上でのエラー表示は必要に応じて
    }
  },
  
  getFavorites: async (userId: string) => {
    try {
      set({ loading: true, error: null });
      
      // MVPテスト用: 現在のお気に入りリストを返す
      // （初回の場合は空のため、ダミーデータからいくつか選択）
      if (get().favorites.length === 0) {
        // ダミーお気に入りの生成（開発用）- ダミーデータから5つランダムに選択
        const allProducts = get().products;
        const randomIndices = Array.from({ length: 5 }, () => 
          Math.floor(Math.random() * allProducts.length)
        );
        const randomFavorites = randomIndices.map(index => allProducts[index]);
        
        // 疑似的に少し遅延を入れる
        await new Promise(resolve => setTimeout(resolve, 300));
        
        set({ favorites: randomFavorites, loading: false });
        return randomFavorites;
      }
      
      // すでにお気に入りが存在する場合はそれを返す
      set({ loading: false });
      return get().favorites;
      
      /*
      // 本番環境では以下のコードを使用（Supabase連携）
      const { data, error } = await supabase
        .from('favorites')
        .select('*, product:products(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // 型変換
      const favorites = data.map(item => ({
        id: item.product.id,
        title: item.product.title,
        imageUrl: item.product.image_url,
        brand: item.product.brand,
        price: item.product.price,
        tags: item.product.tags,
        category: item.product.category,
        affiliateUrl: item.product.affiliate_url,
        source: item.product.source,
        createdAt: item.product.created_at
      }));
      
      set({ favorites, loading: false });
      return favorites;
      */
    } catch (error: any) {
      console.error('Error fetching favorites:', error);
      set({ error: error.message || 'お気に入りの取得に失敗しました', loading: false });
      return [];
    }
  },
  
  isFavorite: (productId: string) => {
    // 現在のお気に入りリストから判定
    return get().favorites.some(p => p.id === productId);
  },
  
  getRecommendedProducts: async (userId: string) => {
    try {
      set({ loading: true, error: null });
      
      // MVPテスト用: シンプルなタグベースのレコメンデーション
      // 実際の実装では、スワイプ履歴からユーザーの好みを分析
      
      // スワイプ履歴から「Yes」のみを取得
      const yesHistory = await getSwipeHistory(userId, 'yes');
      const yesProductIds = yesHistory.map(swipe => swipe.productId);
      
      // タグの集計
      const tagCounts: Record<string, number> = {};
      const products = get().products;
      
      // 「Yes」と判定された商品のタグを集計
      products.forEach(product => {
        if (yesProductIds.includes(product.id) && product.tags) {
          product.tags.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        }
      });
      
      // 人気のタグを抽出
      const popularTags = Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([tag]) => tag);
      
      // 人気タグを持つ商品を取得（すでにスワイプした商品を除外）
      let recommendedProducts: Product[] = [];
      
      if (popularTags.length > 0) {
        recommendedProducts = await fetchProductsByTags(popularTags, 20, yesProductIds);
      } else {
        // タグがない場合はランダムに20件取得
        const result = await fetchProducts(20);
        recommendedProducts = result.products.filter(p => !yesProductIds.includes(p.id));
      }
      
      set({ recommendedProducts, loading: false });
      return recommendedProducts;
    } catch (error: any) {
      console.error('Error fetching recommended products:', error);
      set({ error: error.message || 'おすすめ商品の取得に失敗しました', loading: false });
      return [];
    }
  }
}));

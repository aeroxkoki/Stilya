import { create } from 'zustand';
import { Product } from '@/types';
import { supabase } from '@/services/supabase';

interface ProductState {
  products: Product[];
  currentProduct: Product | null;
  loading: boolean;
  error: string | null;
  
  // アクション
  fetchProducts: () => Promise<void>;
  fetchProductById: (id: string) => Promise<Product | null>;
  setCurrentProduct: (product: Product | null) => void;
  
  // スワイプ関連
  addSwipe: (userId: string, productId: string, result: 'yes' | 'no') => Promise<void>;
  
  // クリックログ関連
  logProductClick: (userId: string, productId: string) => Promise<void>;
  
  // 商品推薦関連
  getRecommendedProducts: (userId: string, limit?: number) => Promise<Product[]>;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  currentProduct: null,
  loading: false,
  error: null,
  
  fetchProducts: async () => {
    try {
      set({ loading: true, error: null });
      
      // Supabaseから商品データを取得
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50); // 最新の50件を取得
        
      if (error) throw error;
      
      // 型変換（Supabaseのスネークケースからキャメルケースへ）
      const formattedProducts: Product[] = data.map(product => ({
        id: product.id,
        title: product.title,
        imageUrl: product.image_url,
        brand: product.brand,
        price: product.price,
        tags: product.tags,
        category: product.category,
        affiliateUrl: product.affiliate_url,
        source: product.source,
        createdAt: product.created_at
      }));
      
      set({ products: formattedProducts, loading: false });
    } catch (error: any) {
      console.error('Error fetching products:', error);
      set({ error: error.message || '商品の取得に失敗しました', loading: false });
    }
  },
  
  fetchProductById: async (id: string) => {
    try {
      set({ loading: true, error: null });
      
      // まず、メモリ内の商品リストから検索
      const cachedProduct = get().products.find(p => p.id === id);
      if (cachedProduct) {
        set({ currentProduct: cachedProduct, loading: false });
        return cachedProduct;
      }
      
      // キャッシュになければSupabaseから取得
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      
      // 型変換
      const formattedProduct: Product = {
        id: data.id,
        title: data.title,
        imageUrl: data.image_url,
        brand: data.brand,
        price: data.price,
        tags: data.tags,
        category: data.category,
        affiliateUrl: data.affiliate_url,
        source: data.source,
        createdAt: data.created_at
      };
      
      set({ currentProduct: formattedProduct, loading: false });
      return formattedProduct;
    } catch (error: any) {
      console.error('Error fetching product by id:', error);
      set({ error: error.message || '商品の取得に失敗しました', loading: false });
      return null;
    }
  },
  
  setCurrentProduct: (product) => {
    set({ currentProduct: product });
  },
  
  addSwipe: async (userId, productId, result) => {
    try {
      const { error } = await supabase
        .from('swipes')
        .insert([{ 
          user_id: userId, 
          product_id: productId, 
          result 
        }]);
        
      if (error) throw error;
    } catch (error: any) {
      console.error('Error recording swipe:', error);
      // スワイプ記録のエラーはユーザー体験に影響を与えないように、UIにはエラーを表示しない
    }
  },
  
  logProductClick: async (userId, productId) => {
    try {
      const { error } = await supabase
        .from('click_logs')
        .insert([{ 
          user_id: userId, 
          product_id: productId 
        }]);
        
      if (error) throw error;
    } catch (error: any) {
      console.error('Error logging product click:', error);
      // クリックログのエラーはユーザー体験に影響を与えないように、UIにはエラーを表示しない
    }
  },
  
  getRecommendedProducts: async (userId, limit = 20) => {
    try {
      set({ loading: true, error: null });
      
      // MVPでは単純なクエリでレコメンドを実装
      // 実際のプロジェクトでは、専用のEdge FunctionやAPIを使用することを推奨
      
      // ユーザーが「Yes」とスワイプした商品のタグを取得
      const { data: swipes, error: swipeError } = await supabase
        .from('swipes')
        .select('product_id')
        .eq('user_id', userId)
        .eq('result', 'yes');
        
      if (swipeError) throw swipeError;
      
      if (!swipes || swipes.length === 0) {
        // スワイプがない場合は、最新の商品を取得
        return get().products.slice(0, limit);
      }
      
      // スワイプした商品のIDリスト
      const swipedProductIds = swipes.map(s => s.product_id);
      
      // スワイプした商品を取得して、タグを抽出
      const { data: swipedProducts, error: productsError } = await supabase
        .from('products')
        .select('tags')
        .in('id', swipedProductIds);
        
      if (productsError) throw productsError;
      
      // すべてのタグを集計
      const tagCounts: Record<string, number> = {};
      swipedProducts.forEach(product => {
        if (product.tags) {
          product.tags.forEach((tag: string) => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        }
      });
      
      // タグの出現回数でソート
      const popularTags = Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)  // 上位5つのタグを使用
        .map(([tag]) => tag);
        
      if (popularTags.length === 0) {
        // タグがない場合は、最新の商品を取得
        return get().products.slice(0, limit);
      }
      
      // 人気タグを含む商品を取得（まだスワイプしていない商品）
      const { data: recommendedProducts, error: recError } = await supabase
        .from('products')
        .select('*')
        .not('id', 'in', swipedProductIds)
        .overlaps('tags', popularTags)
        .limit(limit);
        
      if (recError) throw recError;
      
      // 推薦商品が少ない場合は、他の商品で補完
      if (recommendedProducts.length < limit) {
        const remainingCount = limit - recommendedProducts.length;
        const { data: additionalProducts, error: addError } = await supabase
          .from('products')
          .select('*')
          .not('id', 'in', [...swipedProductIds, ...recommendedProducts.map(p => p.id)])
          .limit(remainingCount);
          
        if (addError) throw addError;
        
        recommendedProducts.push(...additionalProducts);
      }
      
      // 型変換
      const formattedProducts: Product[] = recommendedProducts.map(product => ({
        id: product.id,
        title: product.title,
        imageUrl: product.image_url,
        brand: product.brand,
        price: product.price,
        tags: product.tags,
        category: product.category,
        affiliateUrl: product.affiliate_url,
        source: product.source,
        createdAt: product.created_at
      }));
      
      set({ loading: false });
      return formattedProducts;
    } catch (error: any) {
      console.error('Error getting recommended products:', error);
      set({ error: error.message || 'おすすめ商品の取得に失敗しました', loading: false });
      return [];
    }
  },
}));

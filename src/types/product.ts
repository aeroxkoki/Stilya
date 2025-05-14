export interface Product {
  id: string;
  title: string;
  brand: string; // requiredに変更
  price: number;
  imageUrl: string;
  description?: string;
  tags: string[]; // requiredに変更
  category?: string;
  affiliateUrl: string;
  source?: string;
  createdAt?: string;
}

export interface SwipeResult {
  productId: string;
  result: 'yes' | 'no';
  userId: string;
}

export interface ProductsState {
  products: Product[];
  currentIndex: number;
  isLoading: boolean;
  error: string | null;
}

export interface FavoriteProduct {
  id: string;
  userId: string;
  productId: string;
  createdAt?: string;
}

// 商品サービス関連の型
export interface ProductService {
  fetchProducts: (options?: any) => Promise<Product[]>;
  fetchProductById: (id: string) => Promise<Product | null>;
  fetchRecommendedProducts: (userId: string, limit?: number) => Promise<Product[]>;
  recordProductClick: (productId: string, product?: Product) => Promise<boolean>;
  saveSwipeResult: (productId: string, result: 'yes' | 'no') => Promise<boolean>;
}

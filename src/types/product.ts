export interface Product {
  id: string;
  title: string;
  brand: string;
  price: number;
  imageUrl?: string; // APIによって違う場合があるため、オプショナルに
  image_url?: string; // Supabase DB 形式のフィールド名
  description?: string;
  tags: string[]; 
  category?: string;
  affiliateUrl?: string; // データソースによってはないことも
  affiliate_url?: string; // Supabase DB 形式のフィールド名
  source?: string;
  createdAt?: string;
  created_at?: string; // Supabase DB 形式のフィールド名
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
  fetchProducts: (options?: Record<string, unknown>) => Promise<Product[]>;
  fetchProductById: (id: string) => Promise<Product | null>;
  fetchRecommendedProducts: (userId: string, limit?: number) => Promise<Product[]>;
  recordProductClick: (productId: string, product?: Product) => Promise<boolean>;
  saveSwipeResult: (productId: string, result: 'yes' | 'no') => Promise<boolean>;
}

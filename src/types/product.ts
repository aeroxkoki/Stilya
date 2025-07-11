export interface Product {
  id: string;
  title: string;
  brand: string;
  price: number;
  imageUrl?: string; // APIによって違う場合があるため、オプショナルに
  image_url?: string; // Supabase DB 形式のフィールド名
  thumbnail_url?: string; // サムネイル画像URL
  description?: string;
  tags: string[]; 
  category?: string;
  affiliateUrl?: string; // データソースによってはないことも
  affiliate_url?: string; // Supabase DB 形式のフィールド名
  source?: string;
  createdAt?: string;
  created_at?: string; // Supabase DB 形式のフィールド名
  // ショップ情報
  shop_name?: string; // ショップ名
  // ジェンダー情報
  gender?: 'male' | 'female' | 'unisex'; // 商品の性別
  // Phase 1 改良: セール情報（オプショナルで後方互換性を保つ）
  originalPrice?: number; // 元の価格（セール前）
  discountPercentage?: number; // 割引率（%）
  isSale?: boolean; // セール中フラグ
  rating?: number; // レビュー評価（1-5）
  reviewCount?: number; // レビュー数
  review_count?: number; // Supabase DB 形式のフィールド名
  // 人気度スコア
  popularity_score?: number; // 人気度スコア（0-9.99）
  // 中古品フラグ
  isUsed?: boolean; // 中古品かどうか
  is_used?: boolean; // Supabase DB 形式のフィールド名
  // 収益最適化用フィールド
  commissionRate?: number; // アフィリエイト手数料率（0.05 = 5%）
  // バリューコマース対応（実装準備）
  adTag?: string; // バリューコマースの表示カウント用タグ
  metadata?: {
    ad_tag?: string;
    merchant_id?: string;
    original_id?: string;
    [key: string]: any;
  };
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

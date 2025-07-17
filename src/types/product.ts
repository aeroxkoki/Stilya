export interface Product {
  id: string;
  title: string;
  brand: string;
  price: number;
  imageUrl: string;
  thumbnailUrl?: string;
  description?: string;
  tags: string[]; 
  category?: string;
  affiliateUrl: string;
  source?: string;
  createdAt?: string;
  
  // ショップ情報
  shopName?: string;
  
  // ジェンダー情報
  gender?: 'male' | 'female' | 'unisex';
  
  // Phase 1 改良: セール情報（オプショナルで後方互換性を保つ）
  originalPrice?: number;
  discountPercentage?: number;
  isSale?: boolean;
  rating?: number;
  reviewCount?: number;
  
  // 人気度スコア
  popularityScore?: number;
  
  // 中古品フラグ
  isUsed?: boolean;
  
  // 収益最適化用フィールド
  commissionRate?: number;
  
  // バリューコマース対応（実装準備）
  adTag?: string;
  metadata?: {
    adTag?: string;
    merchantId?: string;
    originalId?: string;
    [key: string]: any;
  };
  
  // 内部管理用フィールド
  priority?: number;
  isActive?: boolean;
  lastSynced?: string;
  updatedAt?: string;
  featuresExtracted?: boolean;
  styleTags?: string[];
  colorTags?: string[];
  seasonTags?: string[];
  qualityScore?: number;
  genreId?: number;
  sourceBrand?: string;
  reviewAverage?: number;
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

// データベースの商品型（snake_case）
export interface DBProduct {
  id: string;
  title: string;
  brand: string;
  price: number;
  image_url: string;
  thumbnail_url?: string;
  description?: string;
  tags: string[];
  category?: string;
  affiliate_url: string;
  source?: string;
  created_at?: string;
  shop_name?: string;
  gender?: 'male' | 'female' | 'unisex';
  original_price?: number;
  discount_percentage?: number;
  is_sale?: boolean;
  rating?: number;
  review_count?: number;
  popularity_score?: number;
  is_used?: boolean;
  commission_rate?: number;
  ad_tag?: string;
  metadata?: {
    ad_tag?: string;
    merchant_id?: string;
    original_id?: string;
    [key: string]: any;
  };
  priority?: number;
  is_active?: boolean;
  last_synced?: string;
  updated_at?: string;
  features_extracted?: boolean;
  style_tags?: string[];
  color_tags?: string[];
  season_tags?: string[];
  quality_score?: number;
  genre_id?: number;
  source_brand?: string;
  review_average?: number;
}

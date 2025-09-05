import { Tables } from './database.types';

// データベースの商品型
export type DBProduct = Tables<'external_products'>;

// アプリ内の商品型（camelCase）
export interface Product {
  id: string;
  title: string;
  brand: string | null;
  price: number;
  imageUrl: string | null;
  thumbnailUrl?: string | null;
  description?: string | null;
  tags: string[] | null;
  category?: string | null;
  affiliateUrl: string | null;
  source?: string | null;
  createdAt?: string | null;
  
  // ショップ情報
  shopName?: string | null;
  
  // ジェンダー情報
  gender?: 'male' | 'female' | 'unisex' | null;
  
  // Phase 1 改良: セール情報（オプショナルで後方互換性を保つ）
  originalPrice?: number | null;
  discountPercentage?: number | null;
  isSale?: boolean | null;
  rating?: number | null;
  reviewCount?: number | null;
  
  // 人気度スコア
  popularityScore?: number | null;
  
  // 中古品フラグ
  isUsed?: boolean | null;
  
  // 収益最適化用フィールド
  commissionRate?: number | null;
  
  // バリューコマース対応（実装準備）
  adTag?: string | null;
  metadata?: {
    adTag?: string;
    merchantId?: string;
    originalId?: string;
    [key: string]: any;
  } | null;
  
  // 内部管理用フィールド
  priority?: number | null;
  isActive?: boolean | null;
  lastSynced?: string | null;
  updatedAt?: string | null;
  featuresExtracted?: boolean | null;
  styleTags?: string[] | null;
  colorTags?: string[] | null;
  seasonTags?: string[] | null;
  qualityScore?: number | null;
  genreId?: number | null;
  sourceBrand?: string | null;
  reviewAverage?: number | null;
  
  // スワイプ履歴で使用
  swipeResult?: 'yes' | 'no';
}

// データベースからアプリの型への変換
export const dbProductToProduct = (dbProduct: DBProduct): Product => {
  // デバッグログ：変換前のデータを確認
  if (__DEV__) {
    console.log('[dbProductToProduct] Converting:', {
      id: dbProduct.id,
      hasImage_url: dbProduct.image_url !== null,
      image_url_sample: dbProduct.image_url?.substring(0, 50)
    });
  }
  
  const product = {
    id: dbProduct.id,
    title: dbProduct.title,
    brand: dbProduct.brand,
    price: dbProduct.price,
    imageUrl: dbProduct.image_url,
    thumbnailUrl: dbProduct.image_url,
    description: dbProduct.description,
    tags: dbProduct.tags,
    category: dbProduct.category,
    affiliateUrl: dbProduct.affiliate_url,
    source: dbProduct.source,
    createdAt: dbProduct.created_at,
    shopName: dbProduct.shop_name,
    gender: dbProduct.gender as Product['gender'],
    originalPrice: dbProduct.original_price,
    discountPercentage: dbProduct.discount_percentage,
    isSale: dbProduct.is_sale,
    rating: dbProduct.rating,
    reviewCount: dbProduct.review_count,
    popularityScore: dbProduct.popularity_score,
    isUsed: dbProduct.is_used,
    commissionRate: dbProduct.commission_rate,
    adTag: dbProduct.ad_tag,
    metadata: dbProduct.metadata as Product['metadata'],
    priority: dbProduct.priority,
    isActive: dbProduct.is_active,
    lastSynced: dbProduct.last_synced,
    updatedAt: dbProduct.updated_at,
    featuresExtracted: dbProduct.features_extracted,
    styleTags: dbProduct.style_tags,
    colorTags: dbProduct.color_tags,
    seasonTags: dbProduct.season_tags,
    qualityScore: dbProduct.quality_score,
    genreId: dbProduct.genre_id,
    sourceBrand: dbProduct.source_brand,
    reviewAverage: dbProduct.review_average,
  };
  
  // デバッグログ：変換後のデータを確認
  if (__DEV__) {
    console.log('[dbProductToProduct] Converted:', {
      id: product.id,
      hasImageUrl: product.imageUrl !== null,
      imageUrl_sample: product.imageUrl?.substring(0, 50)
    });
  }
  
  return product;
};

// アプリの型からデータベースへの変換
export const productToDBProduct = (product: Partial<Product>): Partial<DBProduct> => {
  const dbProduct: any = {};
  
  if (product.id !== undefined) dbProduct.id = product.id;
  if (product.title !== undefined) dbProduct.title = product.title;
  if (product.brand !== undefined) dbProduct.brand = product.brand;
  if (product.price !== undefined) dbProduct.price = product.price;
  if (product.imageUrl !== undefined) dbProduct.image_url = product.imageUrl;
  if (product.description !== undefined) dbProduct.description = product.description;
  if (product.tags !== undefined) dbProduct.tags = product.tags;
  if (product.category !== undefined) dbProduct.category = product.category;
  if (product.affiliateUrl !== undefined) dbProduct.affiliate_url = product.affiliateUrl;
  if (product.source !== undefined) dbProduct.source = product.source;
  if (product.createdAt !== undefined) dbProduct.created_at = product.createdAt;
  if (product.shopName !== undefined) dbProduct.shop_name = product.shopName;
  if (product.gender !== undefined) dbProduct.gender = product.gender;
  if (product.originalPrice !== undefined) dbProduct.original_price = product.originalPrice;
  if (product.discountPercentage !== undefined) dbProduct.discount_percentage = product.discountPercentage;
  if (product.isSale !== undefined) dbProduct.is_sale = product.isSale;
  if (product.rating !== undefined) dbProduct.rating = product.rating;
  if (product.reviewCount !== undefined) dbProduct.review_count = product.reviewCount;
  if (product.popularityScore !== undefined) dbProduct.popularity_score = product.popularityScore;
  if (product.isUsed !== undefined) dbProduct.is_used = product.isUsed;
  if (product.commissionRate !== undefined) dbProduct.commission_rate = product.commissionRate;
  if (product.adTag !== undefined) dbProduct.ad_tag = product.adTag;
  if (product.metadata !== undefined) dbProduct.metadata = product.metadata;
  if (product.priority !== undefined) dbProduct.priority = product.priority;
  if (product.isActive !== undefined) dbProduct.is_active = product.isActive;
  if (product.lastSynced !== undefined) dbProduct.last_synced = product.lastSynced;
  if (product.updatedAt !== undefined) dbProduct.updated_at = product.updatedAt;
  if (product.featuresExtracted !== undefined) dbProduct.features_extracted = product.featuresExtracted;
  if (product.styleTags !== undefined) dbProduct.style_tags = product.styleTags;
  if (product.colorTags !== undefined) dbProduct.color_tags = product.colorTags;
  if (product.seasonTags !== undefined) dbProduct.season_tags = product.seasonTags;
  if (product.qualityScore !== undefined) dbProduct.quality_score = product.qualityScore;
  if (product.genreId !== undefined) dbProduct.genre_id = product.genreId;
  if (product.sourceBrand !== undefined) dbProduct.source_brand = product.sourceBrand;
  if (product.reviewAverage !== undefined) dbProduct.review_average = product.reviewAverage;
  
  return dbProduct;
};

// その他の型定義
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

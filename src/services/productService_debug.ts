import { supabase } from './supabase';
import { Product } from '@/types';
import { fetchRakutenFashionProducts } from './rakutenService';
import { sortProductsByScore, filterOutOfSeasonProducts } from '@/utils/productScoring';
import { getUserPreferences } from './userPreferenceService';
import { optimizeImageUrl, API_OPTIMIZATION } from '@/utils/supabaseOptimization';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/utils/env';
import { shuffleArray, ensureProductDiversity, getTimeBasedOffset } from '@/utils/randomUtils';

/**
 * DBの商品データをアプリ用の形式に正規化
 */
const normalizeProduct = (dbProduct: any): Product => {
  // imageUrlが未定義またはnullの場合のフォールバック処理
  const originalImageUrl = dbProduct.image_url || dbProduct.imageUrl || '';
  const optimizedUrl = originalImageUrl ? optimizeImageUrl(originalImageUrl) : '';
  
  // デバッグ: 商品データの画像URL情報をログ出力
  // 画像表示問題の調査のため、一時的に常にログを出力
  console.log('[ProductService] normalizeProduct - 画像URL変換詳細:', {
    productId: dbProduct.id,
    title: dbProduct.title?.substring(0, 30) + '...',
    originalImageUrl: originalImageUrl,
    optimizedUrl: optimizedUrl,
    urlChanged: originalImageUrl !== optimizedUrl,
    hasImageUrl: !!originalImageUrl,
    source: dbProduct.source,
    isThumbnail: originalImageUrl?.includes('thumbnail.image.rakuten'),
    has128x128: originalImageUrl?.includes('128x128'),
    has_ex: originalImageUrl?.includes('_ex='),
    dbFields: Object.keys(dbProduct),
  });
  
  const normalized: Product = {
    id: dbProduct.id,
    title: dbProduct.title,
    brand: dbProduct.brand,
    price: dbProduct.price,
    imageUrl: optimizedUrl, // 高画質画像URLに最適化
    description: dbProduct.description,
    tags: dbProduct.tags || [],
    category: dbProduct.category,
    affiliateUrl: dbProduct.affiliate_url,
    source: dbProduct.source,
    createdAt: dbProduct.created_at,
    isUsed: dbProduct.is_used || false, // 中古品フラグ
  };
  
  // デバッグ: 正規化後のデータも確認（簡潔に）
  console.log('[ProductService] normalized result:', {
    id: normalized.id,
    imageUrl: normalized.imageUrl,
    hasValidImageUrl: !!normalized.imageUrl && !normalized.imageUrl.includes('placeholder')
  });
  
  return normalized;
};

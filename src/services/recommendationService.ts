import { supabase, handleSupabaseError, handleSupabaseSuccess, TABLES } from './supabase';
import { Product, UserPreference } from '../types';

interface SwipeWithProduct {
  products: {
    tags?: string[];
    category?: string;
    price?: number;
    brand?: string;
  };
}

export class RecommendationService {
  // Analyze user preferences based on swipe history
  static async analyzeUserPreferences(userId: string): Promise<UserPreference | null> {
    try {
      const { data, error } = await supabase
        .from(TABLES.SWIPES)
        .select(`
          *,
          products:product_id (tags, category, price, brand)
        `)
        .eq('user_id', userId)
        .eq('result', 'yes');

      if (error) {
        console.error('Error fetching user swipes:', error);
        return null;
      }

      if (!data || data.length === 0) {
        return null;
      }

      // Analyze tags
      const tagFrequency: Record<string, number> = {};
      const categoryFrequency: Record<string, number> = {};
      const brandFrequency: Record<string, number> = {};
      const prices: number[] = [];

      data.forEach((swipe: SwipeWithProduct) => {
        const product = swipe.products;
        if (product) {
          // Count tags
          if (product.tags && Array.isArray(product.tags)) {
            product.tags.forEach((tag: string) => {
              tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
            });
          }

          // Count categories
          if (product.category) {
            categoryFrequency[product.category] = (categoryFrequency[product.category] || 0) + 1;
          }

          // Count brands
          if (product.brand) {
            brandFrequency[product.brand] = (brandFrequency[product.brand] || 0) + 1;
          }

          // Collect prices
          if (product.price) {
            prices.push(product.price);
          }
        }
      });

      // Calculate preferences
      const likedTags = Object.entries(tagFrequency)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([tag]) => tag);

      const preferredCategories = Object.entries(categoryFrequency)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([category]) => category);

      const preferredBrands = Object.entries(brandFrequency)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([brand]) => brand);

      const avgPriceRange = prices.length > 0 ? {
        min: Math.min(...prices),
        max: Math.max(...prices),
      } : { min: 0, max: 100000 };

      return {
        userId,
        likedTags,
        dislikedTags: [], // Would need additional analysis for disliked tags
        preferredCategories,
        avgPriceRange,
        brands: preferredBrands,
        price_range: avgPriceRange,
      };
    } catch (error) {
      console.error('Error analyzing user preferences:', error);
      return null;
    }
  }

  // Get personalized recommendations based on user preferences
  static async getPersonalizedRecommendations(userId: string, limit: number = 20) {
    try {
      const preferences = await this.analyzeUserPreferences(userId);
      
      if (!preferences) {
        // Fallback to popular products if no preferences found
        return await this.getPopularProducts(limit);
      }

      // Get swiped product IDs to exclude
      const { data: swipedData } = await supabase
        .from(TABLES.SWIPES)
        .select('product_id')
        .eq('user_id', userId);

      const swipedProductIds = swipedData?.map(s => s.product_id) || [];

      // Query products matching user preferences
      let query = supabase
        .from(TABLES.PRODUCTS)
        .select('*')
        .limit(limit)
        .order('created_at', { ascending: false });

      // Exclude already swiped products
      if (swipedProductIds.length > 0) {
        query = query.not('id', 'in', `(${swipedProductIds.join(',')})`);
      }

      // Filter by preferred tags (using overlaps operator)
      if (preferences.likedTags.length > 0) {
        query = query.overlaps('tags', preferences.likedTags);
      }

      const { data, error } = await query;

      if (error) {
        return handleSupabaseError(error);
      }

      // Score and sort products based on preference matching
      const scoredProducts = (data || []).map((product: Product) => {
        let productScore = 0;

        // Tag matching score
        if (product.tags && preferences.likedTags) {
          const matchingTags = product.tags.filter(tag => 
            preferences.likedTags.includes(tag)
          ).length;
          productScore += matchingTags * 3;
        }

        // Category matching score
        if (preferences.preferredCategories.includes(product.category)) {
          productScore += 2;
        }

        // Brand matching score
        if (preferences.brands && preferences.brands.includes(product.brand)) {
          productScore += 1;
        }

        // Price range score
        const priceRange = preferences.price_range || preferences.avgPriceRange;
        if (product.price >= priceRange.min && 
            product.price <= priceRange.max) {
          productScore += 1;
        }

        return { ...product, score: productScore };
      });

      // Sort by score and remove score property
      const recommendations = scoredProducts
        .sort((a, b) => b.score - a.score)
        .map(({ score: _score, ...product }) => product);

      return handleSupabaseSuccess(recommendations);
    } catch (error) {
      return handleSupabaseError(error);
    }
  }

  // Get popular products as fallback
  static async getPopularProducts(limit: number = 20) {
    try {
      // Get products with most "yes" swipes
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          swipes!inner(result)
        `)
        .eq('swipes.result', 'yes')
        .limit(limit);

      if (error) {
        return handleSupabaseError(error);
      }

      return handleSupabaseSuccess(data || []);
    } catch (error) {
      return handleSupabaseError(error);
    }
  }

  // Get trending products (recently popular)
  static async getTrendingProducts(limit: number = 20) {
    try {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const { data, error } = await supabase
        .from(TABLES.PRODUCTS)
        .select(`
          *,
          swipes!inner(created_at, result)
        `)
        .eq('swipes.result', 'yes')
        .gte('swipes.created_at', oneWeekAgo.toISOString())
        .limit(limit);

      if (error) {
        return handleSupabaseError(error);
      }

      return handleSupabaseSuccess(data || []);
    } catch (error) {
      return handleSupabaseError(error);
    }
  }

  // Get products by style/category for discovery
  static async getProductsByStyle(style: string, limit: number = 20) {
    try {
      const { data, error } = await supabase
        .from(TABLES.PRODUCTS)
        .select('*')
        .contains('tags', [style])
        .limit(limit)
        .order('created_at', { ascending: false });

      if (error) {
        return handleSupabaseError(error);
      }

      return handleSupabaseSuccess(data || []);
    } catch (error) {
      return handleSupabaseError(error);
    }
  }
}

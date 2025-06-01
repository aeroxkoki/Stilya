import { supabase, handleSupabaseError, handleSupabaseSuccess, TABLES } from './supabase';
import { DEMO_MODE, demoService } from './demoService';

export class ProductService {
  // Fetch products for swiping
  static async fetchProducts(limit: number = 20, offset: number = 0) {
    // デモモードの場合
    if (DEMO_MODE) {
      return demoService.getProducts(limit, offset);
    }

    try {
      const { data, error } = await supabase
        .from(TABLES.PRODUCTS)
        .select('*')
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });

      if (error) {
        return handleSupabaseError(error);
      }

      return handleSupabaseSuccess(data || []);
    } catch (error) {
      return handleSupabaseError(error as Error | { message: string });
    }
  }

  // Fetch products that haven't been swiped by user
  static async fetchUnswipedProducts(userId: string, limit: number = 20) {
    try {
      // First get swiped product IDs
      const { data: swipedData, error: swipeError } = await supabase
        .from(TABLES.SWIPES)
        .select('product_id')
        .eq('user_id', userId);

      if (swipeError) {
        return handleSupabaseError(swipeError);
      }

      const swipedProductIds = swipedData?.map(s => s.product_id) || [];

      // Then fetch products not in that list
      let query = supabase
        .from(TABLES.PRODUCTS)
        .select('*')
        .limit(limit)
        .order('created_at', { ascending: false });

      if (swipedProductIds.length > 0) {
        query = query.not('id', 'in', `(${swipedProductIds.join(',')})`);
      }

      const { data, error } = await query;

      if (error) {
        return handleSupabaseError(error);
      }

      return handleSupabaseSuccess(data || []);
    } catch (error) {
      return handleSupabaseError(error as Error | { message: string });
    }
  }

  // Fetch single product by ID
  static async fetchProductById(productId: string) {
    try {
      const { data, error } = await supabase
        .from(TABLES.PRODUCTS)
        .select('*')
        .eq('id', productId)
        .single();

      if (error) {
        return handleSupabaseError(error);
      }

      return handleSupabaseSuccess(data);
    } catch (error) {
      return handleSupabaseError(error as Error | { message: string });
    }
  }

  // Search products by category
  static async searchProductsByCategory(category: string, limit: number = 20) {
    try {
      const { data, error } = await supabase
        .from(TABLES.PRODUCTS)
        .select('*')
        .eq('category', category)
        .limit(limit)
        .order('created_at', { ascending: false });

      if (error) {
        return handleSupabaseError(error);
      }

      return handleSupabaseSuccess(data || []);
    } catch (error) {
      return handleSupabaseError(error as Error | { message: string });
    }
  }

  // Search products by tags
  static async searchProductsByTags(tags: string[], limit: number = 20) {
    try {
      const { data, error } = await supabase
        .from(TABLES.PRODUCTS)
        .select('*')
        .overlaps('tags', tags)
        .limit(limit)
        .order('created_at', { ascending: false });

      if (error) {
        return handleSupabaseError(error);
      }

      return handleSupabaseSuccess(data || []);
    } catch (error) {
      return handleSupabaseError(error as Error | { message: string });
    }
  }

  // Record product swipe
  static async recordSwipe(userId: string, productId: string, result: 'yes' | 'no') {
    // デモモードの場合
    if (DEMO_MODE) {
      return demoService.saveSwipe(userId, productId, result);
    }

    try {
      const { data, error } = await supabase
        .from(TABLES.SWIPES)
        .insert({
          user_id: userId,
          product_id: productId,
          result,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        return handleSupabaseError(error);
      }

      return handleSupabaseSuccess(data);
    } catch (error) {
      return handleSupabaseError(error as Error | { message: string });
    }
  }

  // Get user's swipe history
  static async getUserSwipeHistory(userId: string, limit: number = 50) {
    try {
      const { data, error } = await supabase
        .from(TABLES.SWIPES)
        .select(`
          *,
          products:product_id (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        return handleSupabaseError(error);
      }

      return handleSupabaseSuccess(data || []);
    } catch (error) {
      return handleSupabaseError(error as Error | { message: string });
    }
  }

  // Add product to favorites
  static async addToFavorites(userId: string, productId: string) {
    try {
      const { data, error } = await supabase
        .from(TABLES.FAVORITES)
        .insert({
          user_id: userId,
          product_id: productId,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        return handleSupabaseError(error);
      }

      return handleSupabaseSuccess(data);
    } catch (error) {
      return handleSupabaseError(error as Error | { message: string });
    }
  }

  // Remove product from favorites
  static async removeFromFavorites(userId: string, productId: string) {
    try {
      const { error } = await supabase
        .from(TABLES.FAVORITES)
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId);

      if (error) {
        return handleSupabaseError(error);
      }

      return handleSupabaseSuccess(null);
    } catch (error) {
      return handleSupabaseError(error as Error | { message: string });
    }
  }

  // Get user's favorite products
  static async getUserFavorites(userId: string) {
    try {
      const { data, error } = await supabase
        .from(TABLES.FAVORITES)
        .select(`
          *,
          products:product_id (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        return handleSupabaseError(error);
      }

      return handleSupabaseSuccess(data || []);
    } catch (error) {
      return handleSupabaseError(error as Error | { message: string });
    }
  }

  // Record product click for analytics
  static async recordProductClick(userId: string, productId: string) {
    try {
      const { data, error } = await supabase
        .from(TABLES.CLICK_LOGS)
        .insert({
          user_id: userId,
          product_id: productId,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        return handleSupabaseError(error);
      }

      return handleSupabaseSuccess(data);
    } catch (error) {
      return handleSupabaseError(error as Error | { message: string });
    }
  }
}

// Export individual functions for convenience
export const fetchProducts = ProductService.fetchProducts;
export const fetchProductsByTags = ProductService.searchProductsByTags;
export const fetchProductById = ProductService.fetchProductById;

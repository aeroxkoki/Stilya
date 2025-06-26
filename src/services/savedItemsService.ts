import { supabase } from './supabase';
import { Product } from '../types';

export interface SavedItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
}

/**
 * 保存アイテム管理サービス
 * Phase 1: ユーザーが気になる商品を後で確認できるよう保存する機能
 */
export const savedItemsService = {
  /**
   * アイテムを保存する
   */
  async saveItem(userId: string | undefined | null, productId: string): Promise<boolean> {
    try {
      // userIdの検証
      if (!userId || userId === 'undefined' || userId === 'null') {
        console.warn('[SavedItemsService.saveItem] Invalid userId:', userId);
        return false;
      }
      
      // 既に保存されているかチェック
      const { data: existing } = await supabase
        .from('saved_items')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single();

      if (existing) {
        console.log('[SavedItemsService] Item already saved');
        return true;
      }

      const { error } = await supabase
        .from('saved_items')
        .insert({
          user_id: userId,
          product_id: productId,
        });

      if (error) {
        console.error('[SavedItemsService] Error saving item:', error);
        return false;
      }

      console.log('[SavedItemsService] Item saved successfully');
      return true;
    } catch (error) {
      console.error('[SavedItemsService] Unexpected error:', error);
      return false;
    }
  },

  /**
   * 保存を解除する
   */
  async unsaveItem(userId: string | undefined | null, productId: string): Promise<boolean> {
    try {
      // userIdの検証
      if (!userId || userId === 'undefined' || userId === 'null') {
        console.warn('[SavedItemsService.unsaveItem] Invalid userId:', userId);
        return false;
      }
      
      const { error } = await supabase
        .from('saved_items')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId);

      if (error) {
        console.error('[SavedItemsService] Error unsaving item:', error);
        return false;
      }

      console.log('[SavedItemsService] Item unsaved successfully');
      return true;
    } catch (error) {
      console.error('[SavedItemsService] Unexpected error:', error);
      return false;
    }
  },

  /**
   * 保存されているアイテムを取得
   */
  async getSavedItems(userId: string | undefined | null): Promise<SavedItem[]> {
    try {
      // userIdの検証
      if (!userId || userId === 'undefined' || userId === 'null') {
        console.warn('[SavedItemsService.getSavedItems] Invalid userId:', userId);
        return [];
      }
      
      const { data, error } = await supabase
        .from('saved_items')
        .select(`
          *,
          product:external_products(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[SavedItemsService] Error fetching saved items:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('[SavedItemsService] Unexpected error:', error);
      return [];
    }
  },

  /**
   * セール中の保存アイテムを取得
   */
  async getSavedItemsOnSale(userId: string | undefined | null): Promise<SavedItem[]> {
    try {
      // userIdの検証
      if (!userId || userId === 'undefined' || userId === 'null') {
        console.warn('[SavedItemsService.getSavedItemsOnSale] Invalid userId:', userId);
        return [];
      }
      
      const savedItems = await this.getSavedItems(userId);
      
      // セール中のアイテムのみをフィルタリング
      return savedItems.filter(item => {
        const product = item.product;
        return product && product.isSale === true;
      });
    } catch (error) {
      console.error('[SavedItemsService] Error fetching sale items:', error);
      return [];
    }
  },

  /**
   * アイテムが保存されているかチェック
   */
  async isItemSaved(userId: string | undefined | null, productId: string): Promise<boolean> {
    try {
      // userIdの検証
      if (!userId || userId === 'undefined' || userId === 'null') {
        console.warn('[SavedItemsService.isItemSaved] Invalid userId:', userId);
        return false;
      }
      
      const { data, error } = await supabase
        .from('saved_items')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116は「行が見つからない」エラー
        console.error('[SavedItemsService] Error checking saved status:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('[SavedItemsService] Unexpected error:', error);
      return false;
    }
  },
};

// 孤立した参照をクリーンアップするスクリプト
// favorites, swipes テーブルから存在しない商品への参照を削除

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// .envファイルを読み込む
dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Supabase credentials not found in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function cleanupOrphanedReferences() {
  console.log('🔍 孤立した参照のクリーンアップを開始します...');
  
  try {
    // 1. 全商品IDを取得
    console.log('\n1. 有効な商品IDを取得中...');
    const { data: products, error: productsError } = await supabase
      .from('external_products')
      .select('id')
      .eq('is_active', true);
    
    if (productsError) {
      console.error('商品ID取得エラー:', productsError);
      return;
    }
    
    const validProductIds = new Set(products.map(p => p.id));
    console.log(`✅ ${validProductIds.size} 件の有効な商品IDを取得しました`);
    
    // 2. お気に入りテーブルのクリーンアップ
    console.log('\n2. お気に入りテーブルをチェック中...');
    const { data: favorites, error: favoritesError } = await supabase
      .from('favorites')
      .select('id, product_id');
    
    if (favoritesError) {
      console.error('お気に入り取得エラー:', favoritesError);
    } else {
      const orphanedFavorites = favorites.filter(f => !validProductIds.has(f.product_id));
      console.log(`❌ ${orphanedFavorites.length} 件の孤立したお気に入りを発見`);
      
      if (orphanedFavorites.length > 0) {
        const orphanedIds = orphanedFavorites.map(f => f.id);
        const { error: deleteError } = await supabase
          .from('favorites')
          .delete()
          .in('id', orphanedIds);
        
        if (deleteError) {
          console.error('お気に入り削除エラー:', deleteError);
        } else {
          console.log(`✅ ${orphanedFavorites.length} 件の孤立したお気に入りを削除しました`);
        }
      }
    }
    
    // 3. スワイプテーブルのクリーンアップ
    console.log('\n3. スワイプテーブルをチェック中...');
    const { data: swipes, error: swipesError } = await supabase
      .from('swipes')
      .select('id, product_id');
    
    if (swipesError) {
      console.error('スワイプ取得エラー:', swipesError);
    } else {
      const orphanedSwipes = swipes.filter(s => !validProductIds.has(s.product_id));
      console.log(`❌ ${orphanedSwipes.length} 件の孤立したスワイプを発見`);
      
      if (orphanedSwipes.length > 0) {
        const orphanedIds = orphanedSwipes.map(s => s.id);
        
        // バッチ処理（一度に削除する件数を制限）
        const batchSize = 100;
        for (let i = 0; i < orphanedIds.length; i += batchSize) {
          const batch = orphanedIds.slice(i, i + batchSize);
          const { error: deleteError } = await supabase
            .from('swipes')
            .delete()
            .in('id', batch);
          
          if (deleteError) {
            console.error(`スワイプ削除エラー (batch ${Math.floor(i/batchSize) + 1}):`, deleteError);
          } else {
            console.log(`✅ ${batch.length} 件のスワイプを削除 (${i + batch.length}/${orphanedIds.length})`);
          }
        }
      }
    }
    
    // 4. click_logsテーブルのクリーンアップ
    console.log('\n4. click_logsテーブルをチェック中...');
    const { data: clickLogs, error: clickLogsError } = await supabase
      .from('click_logs')
      .select('id, product_id');
    
    if (clickLogsError) {
      console.error('click_logs取得エラー:', clickLogsError);
    } else {
      const orphanedClickLogs = clickLogs.filter(c => !validProductIds.has(c.product_id));
      console.log(`❌ ${orphanedClickLogs.length} 件の孤立したクリックログを発見`);
      
      if (orphanedClickLogs.length > 0) {
        const orphanedIds = orphanedClickLogs.map(c => c.id);
        const { error: deleteError } = await supabase
          .from('click_logs')
          .delete()
          .in('id', orphanedIds);
        
        if (deleteError) {
          console.error('クリックログ削除エラー:', deleteError);
        } else {
          console.log(`✅ ${orphanedClickLogs.length} 件の孤立したクリックログを削除しました`);
        }
      }
    }
    
    // 5. saved_itemsテーブルのクリーンアップ
    console.log('\n5. saved_itemsテーブルをチェック中...');
    const { data: savedItems, error: savedItemsError } = await supabase
      .from('saved_items')
      .select('id, product_id');
    
    if (savedItemsError) {
      console.error('saved_items取得エラー:', savedItemsError);
    } else {
      const orphanedSavedItems = savedItems.filter(s => !validProductIds.has(s.product_id));
      console.log(`❌ ${orphanedSavedItems.length} 件の孤立した保存アイテムを発見`);
      
      if (orphanedSavedItems.length > 0) {
        const orphanedIds = orphanedSavedItems.map(s => s.id);
        const { error: deleteError } = await supabase
          .from('saved_items')
          .delete()
          .in('id', orphanedIds);
        
        if (deleteError) {
          console.error('保存アイテム削除エラー:', deleteError);
        } else {
          console.log(`✅ ${orphanedSavedItems.length} 件の孤立した保存アイテムを削除しました`);
        }
      }
    }
    
    console.log('\n✨ クリーンアップが完了しました！');
    
  } catch (error) {
    console.error('❌ クリーンアップ中にエラーが発生しました:', error);
  }
}

// 実行
cleanupOrphanedReferences();

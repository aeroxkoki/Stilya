import { supabase } from '@/services/supabase';

/**
 * データベースの整合性チェックを実行
 */
export const runDatabaseDiagnostics = async () => {
  console.log('=== DATABASE DIAGNOSTICS START ===');
  
  try {
    // 1. external_products テーブルの全体的な状態を確認
    const { data: allProducts, error: allError } = await supabase
      .from('external_products')
      .select('*')
      .limit(100);
    
    if (allError) {
      console.error('Error fetching products:', allError);
      return;
    }
    
    console.log(`Total products fetched: ${allProducts?.length || 0}`);
    
    // 2. NULL/undefined/不完全なレコードを検出
    const problematicProducts = allProducts?.filter(product => {
      return !product || 
             !product.id || 
             !product.title || 
             !product.category || 
             !product.brand ||
             !product.price ||
             !product.image_url;
    }) || [];
    
    if (problematicProducts.length > 0) {
      console.error(`Found ${problematicProducts.length} problematic products:`);
      problematicProducts.forEach((product, index) => {
        console.error(`Problem product ${index + 1}:`, {
          id: product?.id || 'MISSING',
          title: product?.title || 'MISSING',
          category: product?.category || 'MISSING',
          brand: product?.brand || 'MISSING',
          price: product?.price || 'MISSING',
          image_url: product?.image_url || 'MISSING',
        });
      });
    } else {
      console.log('✅ No problematic products found');
    }
    
    // 3. カテゴリごとの商品数を確認
    const categoryCount: Record<string, number> = {};
    allProducts?.forEach(product => {
      if (product?.category) {
        categoryCount[product.category] = (categoryCount[product.category] || 0) + 1;
      } else {
        categoryCount['UNDEFINED'] = (categoryCount['UNDEFINED'] || 0) + 1;
      }
    });
    
    console.log('Category distribution:', categoryCount);
    
    // 4. 価格範囲の確認
    const prices = allProducts?.map(p => p?.price).filter(p => p != null) || [];
    if (prices.length > 0) {
      console.log('Price range:', {
        min: Math.min(...prices),
        max: Math.max(...prices),
        avg: prices.reduce((a, b) => a + b, 0) / prices.length
      });
    }
    
    // 5. 重複IDの検出
    const idCount: Record<string, number> = {};
    allProducts?.forEach(product => {
      if (product?.id) {
        idCount[product.id] = (idCount[product.id] || 0) + 1;
      }
    });
    
    const duplicateIds = Object.entries(idCount).filter(([_, count]) => count > 1);
    if (duplicateIds.length > 0) {
      console.error('Duplicate IDs found:', duplicateIds);
    } else {
      console.log('✅ No duplicate IDs');
    }
    
    // 6. 最近のデータ挿入を確認
    const { data: recentProducts, error: recentError } = await supabase
      .from('external_products')
      .select('id, created_at, source')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (!recentError && recentProducts) {
      console.log('Recent products:', recentProducts.map(p => ({
        id: p.id,
        created: p.created_at,
        source: p.source
      })));
    }
    
  } catch (error) {
    console.error('Diagnostic error:', error);
  }
  
  console.log('=== DATABASE DIAGNOSTICS END ===');
};

/**
 * 不正なデータをクリーンアップ
 */
export const cleanupInvalidProducts = async () => {
  try {
    // まず不正なレコードを特定
    const { data: allProducts, error } = await supabase
      .from('external_products')
      .select('id, title, category, brand, price, image_url');
    
    if (error) {
      console.error('Error fetching products for cleanup:', error);
      return;
    }
    
    const invalidProductIds = allProducts?.filter(product => {
      return !product || 
             !product.title || 
             !product.category || 
             !product.brand ||
             product.price == null ||
             !product.image_url;
    }).map(p => p.id).filter(id => id != null) || [];
    
    if (invalidProductIds.length > 0) {
      console.log(`Found ${invalidProductIds.length} invalid products to remove`);
      
      // 不正なレコードを削除
      const { error: deleteError } = await supabase
        .from('external_products')
        .delete()
        .in('id', invalidProductIds);
      
      if (deleteError) {
        console.error('Error deleting invalid products:', deleteError);
      } else {
        console.log(`✅ Successfully removed ${invalidProductIds.length} invalid products`);
      }
    } else {
      console.log('✅ No invalid products to clean up');
    }
    
  } catch (error) {
    console.error('Cleanup error:', error);
  }
};

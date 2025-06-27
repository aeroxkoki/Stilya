import { supabase } from '@/services/supabase';
import { fetchRakutenFashionProducts } from '@/services/rakutenService';

/**
 * データベース内の画像URLが欠落している商品を削除し、新しいデータで置き換える
 * これは根本的な解決策として実装
 */
export const fixMissingImageUrls = async () => {
  console.log('🔧 Starting complete image URL fix...');
  
  try {
    // 1. 画像URLが欠落している商品を削除
    console.log('📥 Deleting products without valid image URLs...');
    
    const { error: deleteError, count } = await supabase
      .from('external_products')
      .delete()
      .or('image_url.is.null,image_url.eq.')
      .select(undefined, { count: 'exact' });
    
    if (deleteError) {
      console.error('Error deleting products without images:', deleteError);
      return;
    }
    
    console.log(`✅ Deleted ${count || 0} products without valid image URLs`);
    
    // 2. 新しい商品データを取得して保存
    console.log('📥 Fetching fresh product data from Rakuten API...');
    
    const categories = [
      { genreId: 100371, name: 'レディースファッション' },
      { genreId: 551177, name: 'メンズファッション' },
      { genreId: 100433, name: 'バッグ・小物' },
      { genreId: 216131, name: 'シューズ' }
    ];
    
    let totalInserted = 0;
    
    for (const category of categories) {
      console.log(`Fetching ${category.name}...`);
      
      try {
        const { products } = await fetchRakutenFashionProducts(
          undefined,
          category.genreId,
          1,
          30, // 各カテゴリから30件
          true // forceRefresh
        );
        
        // 有効な画像URLを持つ商品のみフィルタリング
        const validProducts = products
          .filter(p => {
            // 画像URLの検証
            if (!p.imageUrl || p.imageUrl.trim() === '') {
              console.warn(`Skipping product without image: ${p.title}`);
              return false;
            }
            // プレースホルダーや低品質画像を除外
            if (p.imageUrl.includes('placeholder') || 
                p.imageUrl.includes('noimage') ||
                p.imageUrl.includes('_ex=64x64') ||
                p.imageUrl.includes('_ex=128x128')) {
              console.warn(`Skipping low quality image: ${p.title}`);
              return false;
            }
            return true;
          })
          .map(product => ({
            id: product.id,
            title: product.title,
            brand: product.brand,
            price: product.price,
            image_url: product.imageUrl, // 必ず有効な値が入っている
            description: product.description,
            tags: product.tags,
            category: product.category,
            affiliate_url: product.affiliateUrl,
            source: product.source,
            is_active: true,
            is_used: product.isUsed || false,
            priority: category.genreId === 100371 ? 1 : 2, // レディースを優先
            created_at: new Date().toISOString(),
            last_synced: new Date().toISOString()
          }));
        
        if (validProducts.length > 0) {
          // upsertを使用して、既存の商品がある場合は更新
          const { error: insertError } = await supabase
            .from('external_products')
            .upsert(validProducts, { onConflict: 'id' });
          
          if (insertError) {
            console.error(`Error inserting ${category.name}:`, insertError);
          } else {
            console.log(`✅ Inserted/Updated ${validProducts.length} ${category.name} products with valid images`);
            totalInserted += validProducts.length;
          }
        } else {
          console.warn(`⚠️ No valid products found for ${category.name}`);
        }
        
        // APIレート制限対策
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`Error fetching ${category.name}:`, error);
      }
    }
    
    console.log(`✅ Total products inserted with valid images: ${totalInserted}`);
    
    // 3. 最終的な確認
    const { count: finalCount } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true })
      .not('image_url', 'is', null)
      .not('image_url', 'eq', '');
    
    console.log(`✅ Final count of products with valid image URLs: ${finalCount}`);
    
    // 4. 画像URLが空の商品が残っていないか確認
    const { count: invalidCount } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true })
      .or('image_url.is.null,image_url.eq.');
    
    if (invalidCount && invalidCount > 0) {
      console.warn(`⚠️ Still ${invalidCount} products without valid image URLs. Running cleanup...`);
      // 再度削除を実行
      await supabase
        .from('external_products')
        .delete()
        .or('image_url.is.null,image_url.eq.');
    }
    
  } catch (error) {
    console.error('Error in fixMissingImageUrls:', error);
  }
  
  console.log('🔧 Image URL fix completed');
};

/**
 * すべての商品データを再取得して更新（デバッグ用）
 */
export const refreshAllProductData = async () => {
  console.log('🔄 Starting complete product data refresh...');
  console.log('⚠️ This will delete all existing products and fetch new ones');
  
  try {
    // 既存の商品をすべて削除
    const { error: deleteError } = await supabase
      .from('external_products')
      .delete()
      .neq('id', ''); // すべての商品を削除
    
    if (deleteError) {
      console.error('Error deleting existing products:', deleteError);
      return;
    }
    
    console.log('✅ Cleared all existing products');
    
    // fixMissingImageUrlsを呼び出して新しいデータを取得
    await fixMissingImageUrls();
    
  } catch (error) {
    console.error('Error in refreshAllProductData:', error);
  }
  
  console.log('🔄 Product data refresh completed');
};

/**
 * 商品保存前の検証関数（他のサービスから使用）
 */
export const validateProductBeforeSave = (product: any): boolean => {
  // 必須フィールドの検証
  if (!product.id || !product.title || !product.price) {
    return false;
  }
  
  // 画像URLの検証
  if (!product.image_url || product.image_url.trim() === '') {
    return false;
  }
  
  // 無効な画像URLパターンのチェック
  const invalidPatterns = [
    'placeholder',
    'noimage',
    '_ex=64x64',
    '_ex=128x128',
    'undefined',
    'null'
  ];
  
  const imageUrl = product.image_url.toLowerCase();
  for (const pattern of invalidPatterns) {
    if (imageUrl.includes(pattern)) {
      return false;
    }
  }
  
  return true;
};

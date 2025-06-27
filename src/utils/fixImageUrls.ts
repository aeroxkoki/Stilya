import { supabase } from '@/services/supabase';
import { fetchRakutenFashionProducts } from '@/services/rakutenService';

/**
 * データベース内の画像URLが欠落している商品を修正
 */
export const fixMissingImageUrls = async () => {
  console.log('🔧 Starting image URL fix...');
  
  try {
    // 1. 画像URLが空またはnullの商品を取得
    const { data: productsWithoutImages, error: fetchError } = await supabase
      .from('external_products')
      .select('id, title, source')
      .or('image_url.is.null,image_url.eq.')
      .limit(100);
    
    if (fetchError) {
      console.error('Error fetching products without images:', fetchError);
      return;
    }
    
    console.log(`Found ${productsWithoutImages?.length || 0} products without images`);
    
    if (!productsWithoutImages || productsWithoutImages.length === 0) {
      console.log('✅ No products need image URL fixes');
      return;
    }
    
    // 2. 楽天商品のIDを抽出
    const rakutenProductIds = productsWithoutImages
      .filter(p => p.source === 'rakuten' && p.id)
      .map(p => p.id);
    
    if (rakutenProductIds.length === 0) {
      console.log('No Rakuten products found that need fixing');
      return;
    }
    
    console.log(`Attempting to fix ${rakutenProductIds.length} Rakuten products`);
    
    // 3. 楽天APIから新しい商品データを取得
    const { products: freshProducts } = await fetchRakutenFashionProducts(
      undefined,
      100371, // レディースファッション
      1,
      30 // 30件取得（楽天APIの最大値）
    );
    
    // 4. IDベースでマッチングして画像URLを更新
    const updates: Array<{ id: string; image_url: string }> = [];
    
    for (const dbProduct of productsWithoutImages) {
      // 楽天の商品コードから画像URLを構築する別の方法を試す
      if (dbProduct.source === 'rakuten' && dbProduct.id) {
        // 楽天商品IDの形式: "rakuten_shopname:itemcode"
        const parts = dbProduct.id.split(':');
        if (parts.length === 2) {
          const [shopAndPrefix, itemCode] = parts;
          const shopName = shopAndPrefix.replace('rakuten_', '');
          
          // 楽天の標準的な画像URL形式を構築
          // 注: これは一般的な形式であり、実際のURLは異なる場合があります
          const possibleImageUrl = `https://thumbnail.image.rakuten.co.jp/@0_mall/${shopName}/cabinet/${itemCode.substring(0, 2)}/${itemCode}.jpg`;
          
          updates.push({
            id: dbProduct.id,
            image_url: possibleImageUrl
          });
          
          console.log(`Generated image URL for ${dbProduct.id}: ${possibleImageUrl}`);
        }
      }
    }
    
    // 5. 新しく取得した商品データから画像URLを取得
    for (const freshProduct of freshProducts) {
      if (freshProduct.imageUrl && rakutenProductIds.includes(freshProduct.id)) {
        // 既存のupdatesを上書き（新しいデータを優先）
        const existingIndex = updates.findIndex(u => u.id === freshProduct.id);
        if (existingIndex >= 0) {
          updates[existingIndex] = {
            id: freshProduct.id,
            image_url: freshProduct.imageUrl
          };
        } else {
          updates.push({
            id: freshProduct.id,
            image_url: freshProduct.imageUrl
          });
        }
      }
    }
    
    // 6. データベースを更新
    if (updates.length > 0) {
      console.log(`Updating ${updates.length} products with image URLs`);
      
      // バッチ更新（1件ずつ更新）
      let successCount = 0;
      for (const update of updates) {
        const { error: updateError } = await supabase
          .from('external_products')
          .update({ image_url: update.image_url })
          .eq('id', update.id);
        
        if (updateError) {
          console.error(`Failed to update ${update.id}:`, updateError);
        } else {
          successCount++;
        }
      }
      
      console.log(`✅ Successfully updated ${successCount}/${updates.length} products`);
    }
    
    // 7. 完全に新しい商品データをデータベースに追加（画像URLがあるもののみ）
    const validNewProducts = freshProducts
      .filter(p => p.imageUrl && !rakutenProductIds.includes(p.id))
      .map(product => ({
        id: product.id,
        title: product.title,
        brand: product.brand,
        price: product.price,
        image_url: product.imageUrl,
        description: product.description,
        tags: product.tags,
        category: product.category,
        affiliate_url: product.affiliateUrl,
        source: product.source,
        is_active: true,
        is_used: false,
        created_at: new Date().toISOString(),
        last_synced: new Date().toISOString()
      }));
    
    if (validNewProducts.length > 0) {
      const { error: insertError } = await supabase
        .from('external_products')
        .upsert(validNewProducts, { onConflict: 'id' });
      
      if (insertError) {
        console.error('Error inserting new products:', insertError);
      } else {
        console.log(`✅ Added ${validNewProducts.length} new products with valid image URLs`);
      }
    }
    
  } catch (error) {
    console.error('Error in fixMissingImageUrls:', error);
  }
  
  console.log('🔧 Image URL fix completed');
};

/**
 * すべての商品データを再取得して更新
 */
export const refreshAllProductData = async () => {
  console.log('🔄 Starting complete product data refresh...');
  
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
    
    console.log('✅ Cleared existing products');
    
    // 新しい商品データを取得
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
          30 // 各カテゴリから30件
        );
        
        // 有効な画像URLを持つ商品のみフィルタリング
        const validProducts = products
          .filter(p => p.imageUrl && !p.imageUrl.includes('placeholder'))
          .map(product => ({
            id: product.id,
            title: product.title,
            brand: product.brand,
            price: product.price,
            image_url: product.imageUrl,
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
          const { error: insertError } = await supabase
            .from('external_products')
            .insert(validProducts);
          
          if (insertError) {
            console.error(`Error inserting ${category.name}:`, insertError);
          } else {
            console.log(`✅ Inserted ${validProducts.length} ${category.name} products`);
            totalInserted += validProducts.length;
          }
        }
        
        // APIレート制限対策
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`Error fetching ${category.name}:`, error);
      }
    }
    
    console.log(`✅ Total products inserted: ${totalInserted}`);
    
  } catch (error) {
    console.error('Error in refreshAllProductData:', error);
  }
  
  console.log('🔄 Product data refresh completed');
};

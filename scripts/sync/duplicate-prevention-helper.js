/**
 * 商品の重複防止ユーティリティ
 * 商品インポート時に使用する共通関数
 */

const normalizeProductTitle = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ') // 複数の空白を単一の空白に
    .replace(/[【】\[\]（）\(\)]/g, ''); // 括弧類を削除
};

/**
 * 既存商品との重複をチェック
 * @param {Object} supabase - Supabaseクライアント
 * @param {Object} newProduct - チェックする新商品
 * @returns {Object} { isDuplicate: boolean, existingProduct?: Object }
 */
const checkProductDuplicate = async (supabase, newProduct) => {
  try {
    const normalizedTitle = normalizeProductTitle(newProduct.title || newProduct.itemName);
    
    // 既存商品を検索
    const { data: existingProducts, error } = await supabase
      .from('external_products')
      .select('*')
      .eq('is_active', true)
      .ilike('title', `%${normalizedTitle.replace(/[%_]/g, '\\$&')}%`);
    
    if (error) {
      console.error('重複チェックエラー:', error);
      return { isDuplicate: false };
    }
    
    // 正規化したタイトルで比較
    for (const existing of existingProducts) {
      const existingNormalized = normalizeProductTitle(existing.title);
      
      // タイトルが一致し、ブランドも一致する場合
      if (existingNormalized === normalizedTitle && 
          existing.brand === (newProduct.brand || newProduct.shopName)) {
        
        // 価格情報で判断
        const newHasPrice = newProduct.price && newProduct.price > 0;
        const existingHasPrice = existing.price && existing.price > 0;
        
        if (!existingHasPrice && newHasPrice) {
          // 既存商品に価格がなく、新商品に価格がある場合は更新
          return { 
            isDuplicate: true, 
            existingProduct: existing,
            shouldUpdate: true 
          };
        } else {
          // それ以外の場合は重複として扱う
          return { 
            isDuplicate: true, 
            existingProduct: existing,
            shouldUpdate: false 
          };
        }
      }
    }
    
    return { isDuplicate: false };
  } catch (error) {
    console.error('重複チェック中のエラー:', error);
    return { isDuplicate: false };
  }
};

/**
 * 商品データを正規化
 * @param {Object} rawProduct - 生の商品データ
 * @returns {Object} 正規化された商品データ
 */
const normalizeProductData = (rawProduct) => {
  const normalized = {
    ...rawProduct,
    title: rawProduct.title || rawProduct.itemName,
    brand: rawProduct.brand || rawProduct.shopName,
    price: parseFloat(rawProduct.price || rawProduct.itemPrice || 0),
    image_url: rawProduct.image_url || rawProduct.imageUrl || rawProduct.mediumImageUrls?.[0]?.imageUrl,
  };
  
  // タイトルの前後の空白を削除
  if (normalized.title) {
    normalized.title = normalized.title.trim();
  }
  
  // ブランド名の前後の空白を削除
  if (normalized.brand) {
    normalized.brand = normalized.brand.trim();
  }
  
  return normalized;
};

/**
 * バッチで商品をインポート（重複チェック付き）
 * @param {Object} supabase - Supabaseクライアント
 * @param {Array} products - インポートする商品の配列
 * @returns {Object} インポート結果
 */
const importProductsWithDuplicateCheck = async (supabase, products) => {
  const results = {
    imported: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
    details: []
  };
  
  for (const rawProduct of products) {
    try {
      // 商品データを正規化
      const product = normalizeProductData(rawProduct);
      
      // 重複チェック
      const { isDuplicate, existingProduct, shouldUpdate } = await checkProductDuplicate(supabase, product);
      
      if (isDuplicate && !shouldUpdate) {
        // 重複していて更新不要
        results.skipped++;
        results.details.push({
          action: 'skipped',
          title: product.title,
          reason: 'duplicate'
        });
        continue;
      }
      
      if (isDuplicate && shouldUpdate) {
        // 既存商品を更新
        const { error } = await supabase
          .from('external_products')
          .update({
            price: product.price,
            last_synced: new Date().toISOString(),
            priority: product.priority || existingProduct.priority
          })
          .eq('id', existingProduct.id);
        
        if (error) {
          console.error('商品更新エラー:', error);
          results.errors++;
        } else {
          results.updated++;
          results.details.push({
            action: 'updated',
            title: product.title,
            reason: 'price_added'
          });
        }
      } else {
        // 新規商品として挿入
        const { error } = await supabase
          .from('external_products')
          .insert([product]);
        
        if (error) {
          console.error('商品挿入エラー:', error);
          results.errors++;
        } else {
          results.imported++;
          results.details.push({
            action: 'imported',
            title: product.title
          });
        }
      }
      
    } catch (error) {
      console.error('商品処理エラー:', error);
      results.errors++;
    }
  }
  
  return results;
};

module.exports = {
  normalizeProductTitle,
  checkProductDuplicate,
  normalizeProductData,
  importProductsWithDuplicateCheck
};

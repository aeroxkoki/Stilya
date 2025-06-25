/**
 * 探索モードと推薦モードをミックスした商品取得（改善版）
 * スワイプ画面用：70% ランダム + 30% 推薦
 * 根本的な重複防止策を実装
 */
export const fetchMixedProducts = async (
  userId: string | null,
  limit: number = 20,
  offset: number = 0,
  filters?: FilterOptions
) => {
  try {
    console.log('[fetchMixedProducts] Called with:', { userId, limit, offset, filters });
    
    // 戦略を変更：一度に多めの商品を取得して、それを分割する
    const totalPoolSize = limit * 4; // 4倍の商品を取得（重複除去のマージンを増やす）
    const randomRatio = 0.7;
    const personalizedRatio = 0.3;
    
    // まず、大きなプールの商品を取得
    let query = supabase
      .from('external_products')
      .select('*')
      .eq('is_active', true);
    
    // フィルター条件を適用
    if (filters) {
      if (filters.categories && filters.categories.length > 0) {
        query = query.in('category', filters.categories);
      }
      
      if (filters.priceRange) {
        const [minPrice, maxPrice] = filters.priceRange;
        if (minPrice > 0) {
          query = query.gte('price', minPrice);
        }
        if (maxPrice < Infinity) {
          query = query.lte('price', maxPrice);
        }
      }
      
      if (filters.selectedTags && filters.selectedTags.length > 0) {
        query = query.or(filters.selectedTags.map(tag => `tags.cs.{${tag}}`).join(','));
      }
      
      if (filters.includeUsed === false) {
        query = query.eq('is_used', false);
      }
    }
    
    // ランダム性を確保するため、異なる順序で取得
    const sortOptions = ['created_at', 'last_synced', 'priority', 'price'];
    const randomSort = sortOptions[Math.floor(Math.random() * sortOptions.length)];
    const randomDirection = Math.random() > 0.5;
    
    console.log(`[fetchMixedProducts] Using sort: ${randomSort} ${randomDirection ? 'asc' : 'desc'}`);
    
    const { data: allProducts, error } = await query
      .order(randomSort, { ascending: randomDirection })
      .range(offset, offset + totalPoolSize - 1);
    
    if (error) {
      console.error('[fetchMixedProducts] Error fetching products:', error);
      return { success: false, error: error.message };
    }
    
    if (!allProducts || allProducts.length === 0) {
      return { success: true, data: [] };
    }
    
    console.log(`[fetchMixedProducts] Fetched ${allProducts.length} products from pool`);
    
    // 正規化してからシャッフル
    let normalizedPool = allProducts.map(normalizeProduct);
    
    // Fisher-Yatesシャッフルアルゴリズムで完全にランダム化
    for (let i = normalizedPool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [normalizedPool[i], normalizedPool[j]] = [normalizedPool[j], normalizedPool[i]];
    }
    
    // ユーザーがログインしている場合は、好みに基づいてスコアリング
    if (userId) {
      try {
        // ユーザーの好みタグを取得
        const { data: swipeData } = await supabase
          .from('swipes')
          .select('product_id')
          .eq('user_id', userId)
          .eq('result', 'yes')
          .limit(50);
        
        if (swipeData && swipeData.length > 0) {
          const likedProductIds = swipeData.map(s => s.product_id);
          
          // 好みのタグを取得
          const { data: likedProducts } = await supabase
            .from('external_products')
            .select('tags, brand')
            .in('id', likedProductIds);
          
          // タグとブランドの頻度を計算
          const tagScores: Record<string, number> = {};
          const brandScores: Record<string, number> = {};
          
          likedProducts?.forEach(product => {
            product.tags?.forEach((tag: string) => {
              tagScores[tag] = (tagScores[tag] || 0) + 1;
            });
            if (product.brand) {
              brandScores[product.brand] = (brandScores[product.brand] || 0) + 1;
            }
          });
          
          // 商品にスコアを付与
          normalizedPool = normalizedPool.map(product => {
            let score = 0;
            product.tags?.forEach(tag => {
              score += tagScores[tag] || 0;
            });
            if (product.brand && brandScores[product.brand]) {
              score += brandScores[product.brand] * 2; // ブランドは重み付け
            }
            return { ...product, _score: score };
          });
          
          // スコアの高い商品を前半に配置
          normalizedPool.sort((a, b) => (b._score || 0) - (a._score || 0));
          
          console.log('[fetchMixedProducts] Applied user preference scoring');
        }
      } catch (err) {
        console.error('[fetchMixedProducts] Error applying preferences:', err);
      }
    }
    
    // 重複を除去（強化版）
    const uniqueProducts: Product[] = [];
    const seenIds = new Set<string>();
    const seenTitles = new Set<string>();
    const seenTitleBrandPairs = new Set<string>(); // タイトル+ブランドの組み合わせも追跡
    
    for (const product of normalizedPool) {
      // タイトルの正規化（より厳密に）
      const normalizedTitle = product.title
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ' ') // 複数の空白を単一の空白に
        .replace(/[【】\[\]（）\(\)]/g, ''); // 括弧類を削除
      
      // タイトル+ブランドの組み合わせ
      const titleBrandKey = `${normalizedTitle}|${(product.brand || '').toLowerCase().trim()}`;
      
      // 重複チェック（3つの条件すべてをチェック）
      const isDuplicate = seenIds.has(product.id) || 
                         seenTitles.has(normalizedTitle) || 
                         seenTitleBrandPairs.has(titleBrandKey);
      
      if (!isDuplicate) {
        // 価格情報がある商品を優先する場合のロジック
        const existingProductIndex = uniqueProducts.findIndex(p => {
          const existingNormalizedTitle = p.title
            .toLowerCase()
            .trim()
            .replace(/\s+/g, ' ')
            .replace(/[【】\[\]（）\(\)]/g, '');
          return existingNormalizedTitle === normalizedTitle;
        });
        
        if (existingProductIndex !== -1) {
          // 同じタイトルの商品が既に存在する場合
          const existingProduct = uniqueProducts[existingProductIndex];
          // 価格情報がある方を優先
          if (!existingProduct.price && product.price) {
            console.log(`[fetchMixedProducts] Replacing product without price: "${existingProduct.title}" with priced version`);
            uniqueProducts[existingProductIndex] = product;
            // IDとキーを更新
            seenIds.delete(existingProduct.id);
            seenIds.add(product.id);
          } else {
            console.log(`[fetchMixedProducts] Skipping duplicate: "${product.title}" (ID: ${product.id})`);
            continue;
          }
        } else {
          // 新しい商品として追加
          seenIds.add(product.id);
          seenTitles.add(normalizedTitle);
          seenTitleBrandPairs.add(titleBrandKey);
          uniqueProducts.push(product);
        }
        
        if (uniqueProducts.length >= limit) {
          break;
        }
      } else {
        console.log(`[fetchMixedProducts] Duplicate detected and skipped: "${product.title}" (ID: ${product.id})`);
      }
    }
    
    console.log(`[fetchMixedProducts] Final unique products: ${uniqueProducts.length}`);
    console.log(`[fetchMixedProducts] Seen IDs: ${seenIds.size}, Seen titles: ${seenTitles.size}`);
    
    // 商品が不足している場合
    if (uniqueProducts.length < limit) {
      console.log(`[fetchMixedProducts] Not enough products (${uniqueProducts.length}/${limit})`);
      
      // 追加のoffsetで再度取得を試みる
      const additionalOffset = offset + totalPoolSize;
      const additionalResult = await fetchProducts(limit - uniqueProducts.length, additionalOffset, filters);
      
      if (additionalResult.success && additionalResult.data) {
        for (const product of additionalResult.data) {
          const normalizedTitle = product.title
            .toLowerCase()
            .trim()
            .replace(/\s+/g, ' ')
            .replace(/[【】\[\]（）\(\)]/g, '');
          
          const titleBrandKey = `${normalizedTitle}|${(product.brand || '').toLowerCase().trim()}`;
          
          const isDuplicate = seenIds.has(product.id) || 
                             seenTitles.has(normalizedTitle) || 
                             seenTitleBrandPairs.has(titleBrandKey);
          
          if (!isDuplicate) {
            seenIds.add(product.id);
            seenTitles.add(normalizedTitle);
            seenTitleBrandPairs.add(titleBrandKey);
            uniqueProducts.push(product);
            
            if (uniqueProducts.length >= limit) {
              break;
            }
          }
        }
      }
    }
    
    console.log(`[fetchMixedProducts] Returning ${uniqueProducts.length} products`);
    return { success: true, data: uniqueProducts };
    
  } catch (error: any) {
    console.error('[ProductService] Error in fetchMixedProducts:', error);
    console.error('[ProductService] Error stack:', error.stack);
    // エラー時は通常の商品取得にフォールバック
    return fetchProducts(limit, offset, filters);
  }
};
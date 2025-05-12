  getSwipeHistory: async (userId: string, result?: 'yes' | 'no') => {
    try {
      set({ loading: true, error: null });
      
      // MVPテスト用: ダミーデータからランダムに選択してスワイプ履歴をシミュレート
      // 本番環境では以下のコメントアウトを解除してSupabaseを使用
      
      // ダミー履歴の生成（開発用）
      const allProducts = get().products;
      // ランダムに20個選択
      const randomIndices = Array.from({ length: 20 }, () => 
        Math.floor(Math.random() * allProducts.length)
      );
      const randomProducts = randomIndices.map(index => allProducts[index]);
      
      // 結果フィルタリング（yes/noが指定された場合）
      const filteredProducts = result 
        ? randomProducts.filter((_, idx) => (idx % 2 === 0) === (result === 'yes'))
        : randomProducts;
        
      // 疑似的に少し遅延を入れる
      await new Promise(resolve => setTimeout(resolve, 300));
      
      set({ swipeHistory: filteredProducts, loading: false });
      return filteredProducts;
      
      /*
      // 本番環境では以下のコードを使用（Supabase連携）
      // スワイプ履歴を取得
      let query = supabase
        .from('swipes')
        .select('*, product:products(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      // 結果でフィルタリング（yesのみまたはnoのみ）
      if (result) {
        query = query.eq('result', result);
      }
      
      const { data, error } = await query.limit(50);
      
      if (error) throw error;
      
      // 型変換
      const swipeHistory = data.map(item => ({
        id: item.product.id,
        title: item.product.title,
        imageUrl: item.product.image_url,
        brand: item.product.brand,
        price: item.product.price,
        tags: item.product.tags,
        category: item.product.category,
        affiliateUrl: item.product.affiliate_url,
        source: item.product.source,
        createdAt: item.product.created_at
      }));
      
      set({ swipeHistory, loading: false });
      return swipeHistory;
      */
    } catch (error: any) {
      console.error('Error fetching swipe history:', error);
      set({ error: error.message || 'スワイプ履歴の取得に失敗しました', loading: false });
      return [];
    }
  },
  
  addToFavorites: async (userId: string, productId: string) => {
    try {
      // 現在のお気に入りリスト
      const currentFavorites = get().favorites;
      
      // 商品データの取得
      const product = get().products.find(p => p.id === productId);
      if (!product) {
        throw new Error('商品が見つかりません');
      }
      
      // すでにお気に入りに追加済みかチェック
      if (currentFavorites.some(p => p.id === productId)) {
        return; // すでに追加済みの場合は何もしない
      }
      
      // MVPテスト用: メモリ内のみでお気に入りを管理
      const newFavorites = [...currentFavorites, product];
      set({ favorites: newFavorites });
      
      // コンソールにログを出力（テスト用）
      console.log(`お気に入り追加（テスト）: ユーザー ${userId} が商品 ${productId} をお気に入りに追加`);
      
      /*
      // 本番環境では以下のコードを使用（Supabase連携）
      const { error } = await supabase
        .from('favorites')
        .insert([{ 
          user_id: userId, 
          product_id: productId 
        }]);
        
      if (error) throw error;
      
      // お気に入りリストを更新
      await getFavorites(userId);
      */
    } catch (error: any) {
      console.error('Error adding to favorites:', error);
      // UI上でのエラー表示は必要に応じて
    }
  },
  
  removeFromFavorites: async (userId: string, productId: string) => {
    try {
      // 現在のお気に入りリスト
      const currentFavorites = get().favorites;
      
      // お気に入りから削除
      const newFavorites = currentFavorites.filter(p => p.id !== productId);
      set({ favorites: newFavorites });
      
      // コンソールにログを出力（テスト用）
      console.log(`お気に入り削除（テスト）: ユーザー ${userId} が商品 ${productId} をお気に入りから削除`);
      
      /*
      // 本番環境では以下のコードを使用（Supabase連携）
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId);
        
      if (error) throw error;
      
      // お気に入りリストを更新
      await getFavorites(userId);
      */
    } catch (error: any) {
      console.error('Error removing from favorites:', error);
      // UI上でのエラー表示は必要に応じて
    }
  },
  
  getFavorites: async (userId: string) => {
    try {
      set({ loading: true, error: null });
      
      // MVPテスト用: 現在のお気に入りリストを返す
      // （初回の場合は空のため、ダミーデータからいくつか選択）
      if (get().favorites.length === 0) {
        // ダミーお気に入りの生成（開発用）- ダミーデータから5つランダムに選択
        const allProducts = get().products;
        const randomIndices = Array.from({ length: 5 }, () => 
          Math.floor(Math.random() * allProducts.length)
        );
        const randomFavorites = randomIndices.map(index => allProducts[index]);
        
        // 疑似的に少し遅延を入れる
        await new Promise(resolve => setTimeout(resolve, 300));
        
        set({ favorites: randomFavorites, loading: false });
        return randomFavorites;
      }
      
      // すでにお気に入りが存在する場合はそれを返す
      set({ loading: false });
      return get().favorites;
      
      /*
      // 本番環境では以下のコードを使用（Supabase連携）
      const { data, error } = await supabase
        .from('favorites')
        .select('*, product:products(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // 型変換
      const favorites = data.map(item => ({
        id: item.product.id,
        title: item.product.title,
        imageUrl: item.product.image_url,
        brand: item.product.brand,
        price: item.product.price,
        tags: item.product.tags,
        category: item.product.category,
        affiliateUrl: item.product.affiliate_url,
        source: item.product.source,
        createdAt: item.product.created_at
      }));
      
      set({ favorites, loading: false });
      return favorites;
      */
    } catch (error: any) {
      console.error('Error fetching favorites:', error);
      set({ error: error.message || 'お気に入りの取得に失敗しました', loading: false });
      return [];
    }
  },
  
  isFavorite: (productId: string) => {
    // 現在のお気に入りリストから判定
    return get().favorites.some(p => p.id === productId);
  },
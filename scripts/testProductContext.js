// ProductContextのSwipeHistory関連機能をテスト
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase環境変数が設定されていません。');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// swipeService.tsのgetSwipeHistory関数を模擬
async function getSwipeHistory(userId, result) {
  try {
    let query = supabase
      .from('swipes')
      .select('*')
      .eq('user_id', userId);
    
    if (result) {
      query = query.eq('result', result);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    return data.map((item) => ({
      id: item.id,
      userId: item.user_id,
      productId: item.product_id,
      result: item.result,
      createdAt: item.created_at,
    }));
  } catch (error) {
    console.error('Error getting swipe history:', error);
    return [];
  }
}

// productService.tsのfetchProductById関数を模擬
async function fetchProductById(productId) {
  try {
    const { data, error } = await supabase
      .from('external_products')
      .select('*')
      .eq('id', productId)
      .single();
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { 
      success: true, 
      data: {
        id: data.id,
        title: data.title,
        brand: data.brand,
        price: data.price,
        imageUrl: data.image_url,
        description: data.description,
        tags: data.tags || [],
        category: data.category,
        affiliateUrl: data.affiliate_url,
        source: data.source,
        createdAt: data.created_at,
      }
    };
  } catch (error) {
    return { success: false, error: error.message || 'Unknown error' };
  }
}

// ProductContextのgetSwipeHistory実装をテスト
async function testGetSwipeHistory(userId, filter) {
  console.log(`\n=== テスト: getSwipeHistory(userId: ${userId}, filter: ${filter}) ===`);
  
  try {
    const filterResult = filter === 'all' ? undefined : filter;
    
    // スワイプ履歴を取得
    const swipeData = await getSwipeHistory(userId, filterResult);
    console.log(`スワイプ履歴数: ${swipeData.length}件`);
    
    if (swipeData && swipeData.length > 0) {
      // 商品IDのリストを抽出
      const productIds = swipeData.map(swipe => swipe.productId);
      console.log('商品IDリスト:', productIds.slice(0, 5));
      
      // 商品詳細を取得
      const productPromises = productIds.map(id => fetchProductById(id));
      const productResults = await Promise.all(productPromises);
      
      // 成功した商品のみをフィルタリング
      const validProducts = productResults
        .filter(result => result.success && 'data' in result && result.data)
        .map(result => result.data);
      
      console.log(`有効な商品数: ${validProducts.length}件`);
      
      if (validProducts.length > 0) {
        console.log('\n最初の3件の商品:');
        validProducts.slice(0, 3).forEach((product, index) => {
          console.log(`${index + 1}. ${product.title} (${product.brand}) - ¥${product.price}`);
        });
      }
      
      return validProducts;
    } else {
      console.log('スワイプ履歴が見つかりません');
      return [];
    }
  } catch (error) {
    console.error('エラー:', error);
    return [];
  }
}

async function runTests() {
  console.log('=== ProductContext スワイプ履歴機能テスト ===');
  
  try {
    // 直接テストユーザーIDを使用（先ほど作成したユーザー）
    const testUserId = '8e85caf4-5431-4ac4-a8d4-75d289e45a3a';
    const testEmail = 'test_1750213971091@example.com';
    
    console.log(`\nテストユーザー: ${testEmail} (${testUserId})`);
    
    // 1. 全履歴を取得
    await testGetSwipeHistory(testUserId, 'all');
    
    // 2. Yesのみ取得
    await testGetSwipeHistory(testUserId, 'yes');
    
    // 3. Noのみ取得
    await testGetSwipeHistory(testUserId, 'no');
    
    console.log('\n=== テスト完了 ===');
    
  } catch (error) {
    console.error('テストエラー:', error);
  }
}

// Run tests
runTests();

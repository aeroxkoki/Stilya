// テストスクリプト - fetchMixedProductsの動作確認
const dotenv = require('dotenv');
const path = require('path');

// 環境変数の読み込み
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Supabaseのセットアップ
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://ddypgpljprljqrblpuli.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ 環境変数が設定されていません');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// fetchMixedProductsのシンプルなテスト実装
async function testFetchMixedProducts(userId = null, limit = 20, offset = 0, filters = {}) {
  try {
    console.log('\n🔍 fetchMixedProductsのテストを開始...\n');
    console.log('パラメータ:', { userId, limit, offset, filters });
    
    // 直接DBから商品を取得（シンプルなテスト）
    let query = supabase
      .from('external_products')
      .select('*')
      .eq('is_active', true);
    
    // フィルター適用
    if (filters.includeUsed === false) {
      query = query.eq('is_used', false);
    }
    
    const { data, error, count } = await query
      .select('*', { count: 'exact' })
      .limit(limit)
      .range(offset, offset + limit - 1);
    
    if (error) {
      console.error('❌ エラー:', error);
      return;
    }
    
    console.log(`\n✅ 取得成功:`);
    console.log(`- 総商品数: ${count}`);
    console.log(`- 取得件数: ${data?.length || 0}`);
    
    if (data && data.length > 0) {
      console.log('\n📦 最初の5件の商品:');
      data.slice(0, 5).forEach((product, index) => {
        console.log(`${index + 1}. ${product.title} (${product.brand}) - ¥${product.price}`);
        console.log(`   is_used: ${product.is_used}, tags: ${product.tags?.slice(0, 3).join(', ')}`);
      });
      
      // is_usedの統計
      const usedCount = data.filter(p => p.is_used === true).length;
      const newCount = data.filter(p => p.is_used === false).length;
      const nullCount = data.filter(p => p.is_used === null || p.is_used === undefined).length;
      
      console.log('\n📊 is_used統計:');
      console.log(`- 新品: ${newCount}`);
      console.log(`- 中古品: ${usedCount}`);
      console.log(`- 不明: ${nullCount}`);
    }
    
  } catch (err) {
    console.error('❌ 予期しないエラー:', err);
  }
}

// テスト実行
async function runTests() {
  console.log('='.repeat(60));
  console.log('fetchMixedProducts テストスクリプト');
  console.log('='.repeat(60));
  
  // テスト1: 基本的な呼び出し
  await testFetchMixedProducts(null, 20, 0, {});
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  // テスト2: 新品のみフィルター
  await testFetchMixedProducts(null, 20, 0, { includeUsed: false });
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  // テスト3: 中古品も含む
  await testFetchMixedProducts(null, 20, 0, { includeUsed: true });
}

runTests();

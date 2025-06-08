import { supabase, TABLES, testSupabaseConnection } from './supabase';

/**
 * Supabase接続とテーブルアクセスのテストを実行
 */
export const runSupabaseTests = async () => {
  console.log('🔍 Supabaseテスト開始...');
  
  const results = {
    connection: false,
    authSession: false,
    externalProductsTable: false,
    swipesTable: false,
    favoritesTable: false,
    errors: [] as string[]
  };
  
  try {
    // 1. 基本接続テスト
    console.log('1️⃣ 接続テスト...');
    results.connection = await testSupabaseConnection();
    if (!results.connection) {
      results.errors.push('Supabaseへの接続に失敗しました');
    }
    
    // 2. 認証セッションテスト
    console.log('2️⃣ 認証セッションテスト...');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      results.errors.push(`認証セッションエラー: ${sessionError.message}`);
    } else {
      results.authSession = true;
    }
    
    // 3. external_productsテーブルテスト
    console.log('3️⃣ external_productsテーブルテスト...');
    const { data: products, error: productsError } = await supabase
      .from(TABLES.EXTERNAL_PRODUCTS)
      .select('id, title')
      .limit(1);
      
    if (productsError) {
      results.errors.push(`external_productsテーブルエラー: ${productsError.message}`);
    } else {
      results.externalProductsTable = true;
      console.log('✅ external_productsテーブル: アクセス可能');
    }
    
    // 4. swipesテーブルテスト（認証必要）
    if (sessionData?.session?.user) {
      console.log('4️⃣ swipesテーブルテスト...');
      const { data: swipes, error: swipesError } = await supabase
        .from(TABLES.SWIPES)
        .select('id')
        .eq('user_id', sessionData.session.user.id)
        .limit(1);
        
      if (swipesError && !swipesError.message.includes('no rows returned')) {
        results.errors.push(`swipesテーブルエラー: ${swipesError.message}`);
      } else {
        results.swipesTable = true;
        console.log('✅ swipesテーブル: アクセス可能');
      }
    }
    
    // 5. favoritesテーブルテスト（認証必要）
    if (sessionData?.session?.user) {
      console.log('5️⃣ favoritesテーブルテスト...');
      const { data: favorites, error: favoritesError } = await supabase
        .from(TABLES.FAVORITES)
        .select('id')
        .eq('user_id', sessionData.session.user.id)
        .limit(1);
        
      if (favoritesError && !favoritesError.message.includes('no rows returned')) {
        results.errors.push(`favoritesテーブルエラー: ${favoritesError.message}`);
      } else {
        results.favoritesTable = true;
        console.log('✅ favoritesテーブル: アクセス可能');
      }
    }
    
  } catch (error: any) {
    results.errors.push(`予期しないエラー: ${error.message || error}`);
  }
  
  // 結果のサマリー
  console.log('\n📊 テスト結果サマリー:');
  console.log(`接続: ${results.connection ? '✅' : '❌'}`);
  console.log(`認証: ${results.authSession ? '✅' : '❌'}`);
  console.log(`external_products: ${results.externalProductsTable ? '✅' : '❌'}`);
  console.log(`swipes: ${results.swipesTable ? '✅' : '❌'}`);
  console.log(`favorites: ${results.favoritesTable ? '✅' : '❌'}`);
  
  if (results.errors.length > 0) {
    console.log('\n❌ エラー詳細:');
    results.errors.forEach(err => console.log(`   - ${err}`));
  }
  
  return results;
};

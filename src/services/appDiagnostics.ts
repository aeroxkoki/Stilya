// 開発環境診断用のランチャースクリプト
// アプリ起動時の環境変数とSupabase接続を診断します

import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../utils/env';
import { supabase } from './supabase';
import { fetchProducts } from './productService';
import { runDatabaseDiagnostics, cleanupInvalidProducts } from '../utils/diagnostics';

export const runAppDiagnostics = async () => {
  console.log('🚀 Stilya App Diagnostics Starting...');
  console.log('====================================');
  
  // 1. 環境変数の確認
  console.log('\n📋 環境変数チェック:');
  console.log('SUPABASE_URL:', SUPABASE_URL ? `✅ ${SUPABASE_URL}` : '❌ 未設定');
  console.log('SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? `✅ ${SUPABASE_ANON_KEY.substring(0, 20)}...` : '❌ 未設定');
  
  // 2. Supabase接続テスト
  console.log('\n🔌 Supabase接続テスト:');
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.log('❌ セッションエラー:', sessionError.message);
    } else {
      console.log('✅ 認証システム接続OK');
    }
    
    // 3. テーブルアクセステスト
    console.log('\n📊 テーブルアクセステスト:');
    const { data, error, count } = await supabase
      .from('external_products')
      .select('*', { count: 'exact' })
      .limit(1);
      
    if (error) {
      console.log('❌ テーブルアクセスエラー:', error.message);
    } else {
      console.log(`✅ external_productsテーブル: ${count}件のデータ`);
      if (data && data.length > 0) {
        console.log('   サンプル:', data[0].title);
      }
    }
    
    // 4. productServiceの動作確認
    console.log('\n⚙️ ProductService動作確認:');
    const productResult = await fetchProducts(5, 0);
    console.log('fetchProducts結果:', {
      success: productResult.success,
      dataCount: productResult.data?.length || 0,
      error: productResult.error
    });
    
    // 5. データベース整合性チェック（新規追加）
    console.log('\n🔍 データベース整合性チェック:');
    await runDatabaseDiagnostics();
    
    // 6. 不正データのクリーンアップ（オプション）
    // 自動クリーンアップを有効にする場合はコメントを外す
    // console.log('\n🧹 不正データのクリーンアップ:');
    // await cleanupInvalidProducts();
    
  } catch (error: any) {
    console.error('❌ 診断中にエラー:', error.message);
  }
  
  console.log('\n====================================');
  console.log('診断完了\n');
};

// アプリ起動時に自動実行（開発環境のみ）
if (__DEV__) {
  // 少し遅延させて他の初期化処理と競合しないようにする
  setTimeout(() => {
    runAppDiagnostics();
  }, 1000);
}

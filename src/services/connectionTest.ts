import { supabase, TABLES, testSupabaseConnection } from './supabase';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../utils/env';

interface ConnectionTestResult {
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

interface DetailedTestResults {
  connection: boolean;
  authSession: boolean;
  externalProductsTable: boolean;
  swipesTable: boolean;
  favoritesTable: boolean;
  errors: string[];
  warnings: string[];
  details: {
    environment?: ConnectionTestResult;
    networkTest?: ConnectionTestResult;
    productCount?: number;
  };
}

/**
 * 環境変数の詳細チェック
 */
const checkEnvironmentDetails = (): ConnectionTestResult => {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return {
      status: 'error',
      message: 'Supabase環境変数が設定されていません',
      details: {
        SUPABASE_URL: SUPABASE_URL ? 'Set' : 'Missing',
        SUPABASE_ANON_KEY: SUPABASE_ANON_KEY ? 'Set' : 'Missing',
      }
    };
  }

  try {
    const url = new URL(SUPABASE_URL);
    return {
      status: 'success',
      message: '環境変数が正しく設定されています',
      details: {
        host: url.hostname,
        protocol: url.protocol,
        keyLength: SUPABASE_ANON_KEY.length,
      }
    };
  } catch (error) {
    return {
      status: 'error',
      message: 'Supabase URLの形式が無効です',
      details: { error: error instanceof Error ? error.message : String(error) }
    };
  }
};

/**
 * ネットワーク接続の詳細テスト
 */
const testNetworkConnection = async (): Promise<ConnectionTestResult> => {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
      },
    });

    if (response.ok || response.status === 401) {
      return {
        status: 'success',
        message: 'Supabaseプロジェクトへの接続成功',
        details: {
          status: response.status,
          statusText: response.statusText
        }
      };
    }

    return {
      status: 'error',
      message: `接続エラー: ${response.status} ${response.statusText}`,
      details: {
        status: response.status,
        statusText: response.statusText,
        url: SUPABASE_URL
      }
    };
  } catch (error) {
    return {
      status: 'error',
      message: 'ネットワークエラー: Supabaseプロジェクトに接続できません',
      details: { 
        error: error instanceof Error ? error.message : String(error),
        hint: 'インターネット接続を確認してください'
      }
    };
  }
};

/**
 * Supabase接続とテーブルアクセスの詳細テストを実行
 */
export const runSupabaseTests = async (): Promise<DetailedTestResults> => {
  console.log('🔍 Supabase詳細診断を開始します...\n');
  
  const results: DetailedTestResults = {
    connection: false,
    authSession: false,
    externalProductsTable: false,
    swipesTable: false,
    favoritesTable: false,
    errors: [],
    warnings: [],
    details: {}
  };
  
  try {
    // 0. 環境変数の詳細チェック
    console.log('0️⃣ 環境変数チェック...');
    const envCheck = checkEnvironmentDetails();
    results.details.environment = envCheck;
    
    if (envCheck.status === 'error') {
      results.errors.push(envCheck.message);
      console.log(`❌ ${envCheck.message}`);
      console.log('詳細:', envCheck.details);
      return results; // 環境変数がない場合は続行しない
    }
    console.log(`✅ ${envCheck.message}`);
    
    // 1. ネットワーク接続テスト
    console.log('\n1️⃣ ネットワーク接続テスト...');
    const networkTest = await testNetworkConnection();
    results.details.networkTest = networkTest;
    
    if (networkTest.status === 'error') {
      results.errors.push(networkTest.message);
      console.log(`❌ ${networkTest.message}`);
      return results;
    }
    console.log(`✅ ${networkTest.message}`);
    
    // 2. 基本接続テスト
    console.log('\n2️⃣ Supabaseクライアント接続テスト...');
    results.connection = await testSupabaseConnection();
    if (!results.connection) {
      results.errors.push('Supabaseクライアントの接続に失敗しました');
      console.log('❌ Supabaseクライアントの接続に失敗しました');
    } else {
      console.log('✅ Supabaseクライアントの接続成功');
    }
    
    // 3. 認証セッションテスト
    console.log('\n3️⃣ 認証セッションテスト...');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      results.errors.push(`認証セッションエラー: ${sessionError.message}`);
      console.log(`❌ 認証セッションエラー: ${sessionError.message}`);
    } else {
      results.authSession = true;
      if (sessionData?.session) {
        console.log(`✅ 認証済み: ${sessionData.session.user.email}`);
      } else {
        console.log('⚠️  未認証状態（ログインが必要な機能は使用できません）');
        results.warnings.push('未認証状態です');
      }
    }
    
    // 4. external_productsテーブルテスト
    console.log('\n4️⃣ external_productsテーブルテスト...');
    try {
      const { data: products, error: productsError, count } = await supabase
        .from(TABLES.EXTERNAL_PRODUCTS)
        .select('id, title', { count: 'exact' })
        .limit(5);
        
      if (productsError) {
        results.errors.push(`external_productsテーブルエラー: ${productsError.message}`);
        console.log(`❌ external_productsテーブルエラー: ${productsError.message}`);
      } else {
        results.externalProductsTable = true;
        results.details.productCount = count || 0;
        console.log(`✅ external_productsテーブル: アクセス可能 (${count || 0}件の商品)`);
        if (products && products.length > 0) {
          console.log('   サンプル商品:');
          products.slice(0, 3).forEach(p => console.log(`   - ${p.title}`));
        }
      }
    } catch (error: any) {
      results.errors.push(`external_productsテーブル例外: ${error.message}`);
      console.log(`❌ external_productsテーブル例外: ${error.message}`);
    }
    
    // 5. swipesテーブルテスト（認証必要）
    if (sessionData?.session?.user) {
      console.log('\n5️⃣ swipesテーブルテスト...');
      try {
        const { data: swipes, error: swipesError } = await supabase
          .from(TABLES.SWIPES)
          .select('id')
          .eq('user_id', sessionData.session.user.id)
          .limit(1);
          
        if (swipesError && !swipesError.message.includes('no rows returned')) {
          results.errors.push(`swipesテーブルエラー: ${swipesError.message}`);
          console.log(`❌ swipesテーブルエラー: ${swipesError.message}`);
        } else {
          results.swipesTable = true;
          console.log('✅ swipesテーブル: アクセス可能');
        }
      } catch (error: any) {
        results.errors.push(`swipesテーブル例外: ${error.message}`);
        console.log(`❌ swipesテーブル例外: ${error.message}`);
      }
    } else {
      console.log('\n5️⃣ swipesテーブルテスト: スキップ（認証が必要）');
    }
    
    // 6. favoritesテーブルテスト（認証必要）
    if (sessionData?.session?.user) {
      console.log('\n6️⃣ favoritesテーブルテスト...');
      try {
        const { data: favorites, error: favoritesError } = await supabase
          .from(TABLES.FAVORITES)
          .select('id')
          .eq('user_id', sessionData.session.user.id)
          .limit(1);
          
        if (favoritesError && !favoritesError.message.includes('no rows returned')) {
          results.errors.push(`favoritesテーブルエラー: ${favoritesError.message}`);
          console.log(`❌ favoritesテーブルエラー: ${favoritesError.message}`);
        } else {
          results.favoritesTable = true;
          console.log('✅ favoritesテーブル: アクセス可能');
        }
      } catch (error: any) {
        results.errors.push(`favoritesテーブル例外: ${error.message}`);
        console.log(`❌ favoritesテーブル例外: ${error.message}`);
      }
    } else {
      console.log('\n6️⃣ favoritesテーブルテスト: スキップ（認証が必要）');
    }
    
  } catch (error: any) {
    results.errors.push(`予期しないエラー: ${error.message || error}`);
    console.log(`\n❌ 予期しないエラー: ${error.message || error}`);
  }
  
  // 結果のサマリー
  console.log('\n📊 診断結果サマリー:');
  console.log('===================');
  console.log(`環境変数: ${results.details.environment?.status === 'success' ? '✅' : '❌'}`);
  console.log(`ネットワーク: ${results.details.networkTest?.status === 'success' ? '✅' : '❌'}`);
  console.log(`接続: ${results.connection ? '✅' : '❌'}`);
  console.log(`認証: ${results.authSession ? '✅' : '❌'}`);
  console.log(`external_products: ${results.externalProductsTable ? '✅' : '❌'} ${results.details.productCount ? `(${results.details.productCount}件)` : ''}`);
  console.log(`swipes: ${results.swipesTable ? '✅' : '❌'}`);
  console.log(`favorites: ${results.favoritesTable ? '✅' : '❌'}`);
  console.log('===================');
  
  if (results.warnings.length > 0) {
    console.log('\n⚠️  警告:');
    results.warnings.forEach(warn => console.log(`   - ${warn}`));
  }
  
  if (results.errors.length > 0) {
    console.log('\n❌ エラー詳細:');
    results.errors.forEach(err => console.log(`   - ${err}`));
  } else if (results.warnings.length === 0) {
    console.log('\n🎉 すべてのテストが成功しました！');
  }
  
  return results;
};

/**
 * エクスポート用の別名
 */
export const testSupabaseConnectionDetailed = runSupabaseTests;

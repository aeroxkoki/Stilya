/**
 * 開発ビルド用のエラー診断スクリプト
 * 実機テストで発生している問題を特定するためのツール
 */

import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../utils/env';
import { testSupabaseConnection } from '../services/supabase';
import { runSupabaseTests } from '../services/connectionTest';
import { diagnoseSupabaseConnection, logSupabaseConnectionInfo } from '../utils/supabaseConnectionCheck';

interface DiagnosticResult {
  test: string;
  success: boolean;
  error?: string;
  details?: any;
}

/**
 * 実機テストエラー診断を実行
 */
export const runDeviceDiagnostics = async (): Promise<DiagnosticResult[]> => {
  const results: DiagnosticResult[] = [];
  
  console.log('🔍 実機テストエラー診断を開始します...\n');
  
  // 0. Supabase接続設定の診断（最重要）
  console.log('0️⃣ Supabase接続設定の診断...');
  logSupabaseConnectionInfo();
  
  const connectionDiagnosis = diagnoseSupabaseConnection();
  results.push({
    test: 'Supabase接続設定',
    success: connectionDiagnosis.status === 'ok',
    error: connectionDiagnosis.status !== 'ok' ? connectionDiagnosis.message : undefined,
    details: connectionDiagnosis.details
  });
  
  if (connectionDiagnosis.status === 'error') {
    console.log('\n⚠️  重要: ローカルSupabase設定が有効になっています！');
    console.log('実機テストでは以下のコマンドを使用してください:');
    console.log('> npm run start');
    console.log('（npm run start:local は使用しないでください）\n');
    
    // ローカル設定の場合、これ以上のテストは無意味なので終了
    return results;
  }
  
  // 1. 環境変数の確認
  try {
    console.log('1️⃣ 環境変数チェック...');
    const envCheck = {
      SUPABASE_URL: !!SUPABASE_URL,
      SUPABASE_ANON_KEY: !!SUPABASE_ANON_KEY,
      URL_FORMAT: false,
      KEY_LENGTH: SUPABASE_ANON_KEY?.length || 0
    };
    
    try {
      new URL(SUPABASE_URL);
      envCheck.URL_FORMAT = true;
    } catch (e) {
      // URL形式エラー
    }
    
    const envSuccess = envCheck.SUPABASE_URL && envCheck.SUPABASE_ANON_KEY && envCheck.URL_FORMAT;
    
    results.push({
      test: '環境変数',
      success: envSuccess,
      error: envSuccess ? undefined : '環境変数が正しく設定されていません',
      details: envCheck
    });
    
    console.log(envSuccess ? '✅ 環境変数: OK' : '❌ 環境変数: エラー');
    
    if (!envSuccess) {
      console.log('詳細:', envCheck);
      return results; // 環境変数がなければ続行しない
    }
  } catch (error) {
    results.push({
      test: '環境変数',
      success: false,
      error: error instanceof Error ? error.message : String(error)
    });
  }
  
  // 2. ネットワーク接続テスト
  try {
    console.log('\n2️⃣ ネットワーク接続テスト...');
    const testUrl = 'https://www.google.com';
    const response = await fetch(testUrl);
    const networkSuccess = response.ok;
    
    results.push({
      test: 'インターネット接続',
      success: networkSuccess,
      error: networkSuccess ? undefined : 'インターネット接続に問題があります',
      details: { status: response.status }
    });
    
    console.log(networkSuccess ? '✅ インターネット接続: OK' : '❌ インターネット接続: エラー');
  } catch (error) {
    results.push({
      test: 'インターネット接続',
      success: false,
      error: 'ネットワーク接続エラー: ' + (error instanceof Error ? error.message : String(error))
    });
    console.log('❌ インターネット接続: エラー');
  }
  
  // 3. Supabase URL到達性テスト
  try {
    console.log('\n3️⃣ Supabase URLアクセステスト...');
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'HEAD',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
      },
    });
    
    const urlSuccess = response.ok || response.status === 401;
    
    results.push({
      test: 'Supabase URL到達性',
      success: urlSuccess,
      error: urlSuccess ? undefined : `Supabase URLにアクセスできません (Status: ${response.status})`,
      details: { 
        status: response.status, 
        statusText: response.statusText,
        url: SUPABASE_URL
      }
    });
    
    console.log(urlSuccess ? '✅ Supabase URL: OK' : '❌ Supabase URL: エラー');
  } catch (error) {
    results.push({
      test: 'Supabase URL到達性',
      success: false,
      error: 'Supabase URLアクセスエラー: ' + (error instanceof Error ? error.message : String(error))
    });
    console.log('❌ Supabase URL: エラー');
  }
  
  // 4. Supabaseクライアント接続テスト
  try {
    console.log('\n4️⃣ Supabaseクライアント接続テスト...');
    const clientSuccess = await testSupabaseConnection();
    
    results.push({
      test: 'Supabaseクライアント',
      success: clientSuccess,
      error: clientSuccess ? undefined : 'Supabaseクライアントの初期化に失敗'
    });
    
    console.log(clientSuccess ? '✅ Supabaseクライアント: OK' : '❌ Supabaseクライアント: エラー');
  } catch (error) {
    results.push({
      test: 'Supabaseクライアント',
      success: false,
      error: 'クライアントエラー: ' + (error instanceof Error ? error.message : String(error))
    });
    console.log('❌ Supabaseクライアント: エラー');
  }
  
  // 5. メモリ使用量チェック（React Native環境）
  try {
    console.log('\n5️⃣ メモリ使用量チェック...');
    const memoryInfo = (global as any).performance?.memory;
    
    if (memoryInfo) {
      const usedMB = Math.round(memoryInfo.usedJSHeapSize / 1048576);
      const totalMB = Math.round(memoryInfo.totalJSHeapSize / 1048576);
      const limitMB = Math.round(memoryInfo.jsHeapSizeLimit / 1048576);
      
      results.push({
        test: 'メモリ使用量',
        success: true,
        details: {
          used: `${usedMB}MB`,
          total: `${totalMB}MB`,
          limit: `${limitMB}MB`,
          percentage: Math.round((usedMB / limitMB) * 100) + '%'
        }
      });
      
      console.log(`✅ メモリ使用量: ${usedMB}MB / ${limitMB}MB (${Math.round((usedMB / limitMB) * 100)}%)`);
    } else {
      results.push({
        test: 'メモリ使用量',
        success: true,
        details: { message: 'メモリ情報は利用できません' }
      });
      console.log('ℹ️  メモリ使用量: 情報なし');
    }
  } catch (error) {
    results.push({
      test: 'メモリ使用量',
      success: true,
      details: { error: error instanceof Error ? error.message : String(error) }
    });
  }
  
  // 結果サマリー
  console.log('\n📊 診断結果サマリー:');
  console.log('===================');
  const successCount = results.filter(r => r.success).length;
  const errorCount = results.filter(r => !r.success).length;
  console.log(`✅ 成功: ${successCount}/${results.length}`);
  console.log(`❌ エラー: ${errorCount}/${results.length}`);
  console.log('===================\n');
  
  // エラー詳細
  if (errorCount > 0) {
    console.log('❌ エラー詳細:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`\n- ${r.test}: ${r.error}`);
      if (r.details) {
        console.log('  詳細:', r.details);
      }
    });
  } else {
    console.log('🎉 すべての診断テストが成功しました！');
  }
  
  return results;
};

/**
 * 詳細なSupabase接続テスト（既存の関数を再利用）
 */
export const runDetailedSupabaseTest = async () => {
  console.log('\n🔧 詳細なSupabase接続テストを実行します...\n');
  return await runSupabaseTests();
};

/**
 * 診断結果をJSON形式で出力
 */
export const exportDiagnosticsAsJSON = (results: DiagnosticResult[]): string => {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    platform: 'React Native',
    results: results,
    summary: {
      total: results.length,
      success: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    }
  };
  
  return JSON.stringify(diagnostics, null, 2);
};

/**
 * 統合診断ツール
 * すべての診断機能を1つのファイルに統合
 */

import { Platform } from 'react-native';
import { testSupabaseConnection, supabase } from '../services/supabase';
import { SUPABASE_URL, SUPABASE_ANON_KEY, RAKUTEN_APP_ID, RAKUTEN_AFFILIATE_ID } from '../utils/env';

interface DiagnosticsResult {
  environment: {
    platform: string;
    supabaseUrl: string;
    hasSupabaseKeys: boolean;
  };
  connectivity: {
    supabaseConnection: boolean;
    supabaseAuth: boolean;
    rakutenAPI: boolean;
  };
  errors: string[];
}

/**
 * 統合診断を実行
 */
export const runDiagnostics = async (): Promise<DiagnosticsResult> => {
  const result: DiagnosticsResult = {
    environment: {
      platform: Platform.OS,
      supabaseUrl: SUPABASE_URL,
      hasSupabaseKeys: !!(SUPABASE_URL && SUPABASE_ANON_KEY),
    },
    connectivity: {
      supabaseConnection: false,
      supabaseAuth: false,
      rakutenAPI: false,
    },
    errors: [],
  };

  console.log('🔍 診断開始...');

  // 1. 環境変数チェック
  if (!result.environment.hasSupabaseKeys) {
    result.errors.push('Supabase環境変数が設定されていません');
  }

  // 2. Supabase接続テスト
  try {
    result.connectivity.supabaseConnection = await testSupabaseConnection();
    
    if (result.connectivity.supabaseConnection) {
      // 認証状態確認
      const { data: { session } } = await supabase.auth.getSession();
      result.connectivity.supabaseAuth = !!session;
    }
  } catch (error) {
    result.errors.push(`Supabase接続エラー: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // 3. 楽天API接続テスト（簡易版）
  if (RAKUTEN_APP_ID && RAKUTEN_AFFILIATE_ID) {
    try {
      const response = await fetch(
        `https://app.rakuten.co.jp/services/api/IchibaItem/Search/20220601?format=json&keyword=test&applicationId=${RAKUTEN_APP_ID}&affiliateId=${RAKUTEN_AFFILIATE_ID}`,
        { method: 'GET' }
      );
      result.connectivity.rakutenAPI = response.ok;
    } catch (error) {
      result.errors.push(`楽天API接続エラー: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // 結果を表示
  console.log('📊 診断結果:', {
    ...result,
    summary: {
      totalErrors: result.errors.length,
      allTestsPassed: result.errors.length === 0 && 
        result.connectivity.supabaseConnection && 
        result.environment.hasSupabaseKeys,
    }
  });

  return result;
};

/**
 * 簡易診断（接続のみ）
 */
export const quickCheck = async (): Promise<boolean> => {
  try {
    return await testSupabaseConnection();
  } catch {
    return false;
  }
};

/**
 * 診断結果をテキストで出力
 */
export const formatDiagnosticsResult = (result: DiagnosticsResult): string => {
  const lines = [
    '=== Stilya 診断結果 ===',
    '',
    '【環境情報】',
    `Platform: ${result.environment.platform}`,
    `Supabase URL: ${result.environment.supabaseUrl}`,
    `環境変数: ${result.environment.hasSupabaseKeys ? '✅ 正常' : '❌ 不足'}`,
    '',
    '【接続状態】',
    `Supabase接続: ${result.connectivity.supabaseConnection ? '✅' : '❌'}`,
    `認証状態: ${result.connectivity.supabaseAuth ? '✅ ログイン中' : '⚪ 未ログイン'}`,
    `楽天API: ${result.connectivity.rakutenAPI ? '✅' : '❌'}`,
    '',
  ];

  if (result.errors.length > 0) {
    lines.push('【エラー】');
    result.errors.forEach(error => lines.push(`- ${error}`));
  } else {
    lines.push('✨ すべてのテストに合格しました');
  }

  return lines.join('\\n');
};

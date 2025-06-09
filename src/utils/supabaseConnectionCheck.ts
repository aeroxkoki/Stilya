/**
 * Supabase接続の検証と診断ヘルパー
 * 実機テストでの接続問題を診断するためのユーティリティ
 */

import { SUPABASE_URL, SUPABASE_ANON_KEY, IS_LOCAL_SUPABASE } from '../utils/env';

interface ConnectionInfo {
  isLocal: boolean;
  url: string;
  hasCredentials: boolean;
  expectedUrl: string;
  actualUrl: string;
}

/**
 * 現在のSupabase接続設定を確認
 */
export const getSupabaseConnectionInfo = (): ConnectionInfo => {
  const expectedOnlineUrl = 'https://ddypgpljprljqrblpuli.supabase.co';
  const localUrl = 'http://localhost:54321';
  
  return {
    isLocal: IS_LOCAL_SUPABASE,
    url: SUPABASE_URL,
    hasCredentials: !!(SUPABASE_URL && SUPABASE_ANON_KEY),
    expectedUrl: IS_LOCAL_SUPABASE ? localUrl : expectedOnlineUrl,
    actualUrl: SUPABASE_URL,
  };
};

/**
 * 接続設定を診断して問題を特定
 */
export const diagnoseSupabaseConnection = (): {
  status: 'ok' | 'warning' | 'error';
  message: string;
  details: ConnectionInfo;
} => {
  const info = getSupabaseConnectionInfo();
  
  // ローカル設定で実機テストの場合は警告
  if (info.isLocal) {
    return {
      status: 'error',
      message: '実機テストではローカルSupabaseに接続できません。オンラインのSupabaseを使用してください。',
      details: info,
    };
  }
  
  // 認証情報がない場合
  if (!info.hasCredentials) {
    return {
      status: 'error',
      message: 'Supabase認証情報が設定されていません。',
      details: info,
    };
  }
  
  // URLが期待値と異なる場合
  if (info.actualUrl !== info.expectedUrl) {
    return {
      status: 'warning',
      message: `Supabase URLが期待値と異なります。期待: ${info.expectedUrl}, 実際: ${info.actualUrl}`,
      details: info,
    };
  }
  
  // 正常な場合
  return {
    status: 'ok',
    message: `オンラインのSupabase (${info.actualUrl}) に接続する設定になっています。`,
    details: info,
  };
};

/**
 * 接続設定をコンソールに出力
 */
export const logSupabaseConnectionInfo = (): void => {
  const diagnosis = diagnoseSupabaseConnection();
  const info = diagnosis.details;
  
  console.log('\n========== Supabase接続設定 ==========');
  console.log(`状態: ${diagnosis.status === 'ok' ? '✅' : diagnosis.status === 'warning' ? '⚠️' : '❌'} ${diagnosis.status.toUpperCase()}`);
  console.log(`メッセージ: ${diagnosis.message}`);
  console.log('\n詳細情報:');
  console.log(`- IS_LOCAL_SUPABASE: ${info.isLocal ? 'true (ローカル)' : 'false (オンライン)'}`);
  console.log(`- 実際のURL: ${info.actualUrl}`);
  console.log(`- 期待されるURL: ${info.expectedUrl}`);
  console.log(`- 認証情報: ${info.hasCredentials ? '設定済み' : '未設定'}`);
  console.log('=====================================\n');
  
  if (diagnosis.status === 'error') {
    console.error('🚨 エラー: 実機テストを行う場合は、以下のコマンドでサーバーを起動してください:');
    console.error('npm run start (オンラインSupabase接続)');
    console.error('※ npm run start:local はローカル開発用です');
  }
};

/**
 * Supabase接続テストスクリプト
 * 実行方法: npx ts-node src/tests/checkSupabaseConnection.ts
 */

import { supabase, testSupabaseConnection } from '../services/supabase';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../utils/env';

// 色付きコンソール出力用のユーティリティ
const log = {
  info: (msg: string) => console.log(`\x1b[36m[INFO]\x1b[0m ${msg}`),
  success: (msg: string) => console.log(`\x1b[32m[SUCCESS]\x1b[0m ${msg}`),
  error: (msg: string) => console.log(`\x1b[31m[ERROR]\x1b[0m ${msg}`),
  warn: (msg: string) => console.log(`\x1b[33m[WARN]\x1b[0m ${msg}`),
};

const checkSupabaseStatus = async () => {
  console.log('\n=== Supabase 接続状況チェック ===\n');

  // 1. 環境変数の確認
  log.info('環境変数の確認中...');
  console.log(`  SUPABASE_URL: ${SUPABASE_URL ? '✅ 設定済み' : '❌ 未設定'}`);
  console.log(`  SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY ? '✅ 設定済み' : '❌ 未設定'}`);
  
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    log.error('環境変数が設定されていません。.envファイルを確認してください。');
    return;
  }

  // 2. Supabaseインスタンスの状態確認
  log.info('\nSupabaseクライアントの状態確認中...');
  console.log(`  URL: ${SUPABASE_URL}`);
  console.log(`  Key length: ${SUPABASE_ANON_KEY.length} 文字`);

  // 3. 接続テスト
  log.info('\nSupabaseへの接続テスト中...');
  try {
    const isConnected = await testSupabaseConnection();
    if (isConnected) {
      log.success('Supabaseへの接続に成功しました！');
    } else {
      log.error('Supabaseへの接続に失敗しました。');
    }
  } catch (error) {
    log.error(`接続エラー: ${error}`);
  }

  // 4. テーブル存在確認
  log.info('\nテーブルの存在確認中...');
  const tables = ['users', 'products', 'swipes', 'favorites', 'click_logs'];
  
  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        log.error(`  ${table}: ❌ アクセスエラー - ${error.message}`);
      } else {
        log.success(`  ${table}: ✅ アクセス可能 (${count ?? 0}件)`);
      }
    } catch (err) {
      log.error(`  ${table}: ❌ エラー - ${err}`);
    }
  }

  // 5. 認証状態の確認
  log.info('\n認証状態の確認中...');
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      log.success('現在のセッション: アクティブ');
      console.log(`  ユーザーID: ${session.user.id}`);
      console.log(`  メール: ${session.user.email}`);
    } else {
      log.info('現在のセッション: なし（未ログイン）');
    }
  } catch (error) {
    log.error(`認証エラー: ${error}`);
  }

  // 6. プロジェクトの稼働状態確認
  log.info('\nSupabaseプロジェクトの稼働状態確認中...');
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
      },
    });
    
    if (response.ok) {
      log.success('Supabaseプロジェクトは正常に稼働しています！');
    } else if (response.status === 401) {
      log.warn('認証は必要ですが、プロジェクトは稼働しています。');
    } else {
      log.error(`プロジェクトのステータス: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    log.error(`プロジェクト確認エラー: ${error}`);
  }

  console.log('\n=== チェック完了 ===\n');
};

// メイン実行
(async () => {
  try {
    await checkSupabaseStatus();
  } catch (error) {
    log.error(`予期しないエラー: ${error}`);
  }
})();

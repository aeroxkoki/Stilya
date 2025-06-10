/**
 * 認証機能のテストファイル
 * Supabase v2 APIの動作確認用
 */

import { supabase } from '../services/supabase';
import { AuthService } from '../services/authService';

export async function testAuthFunctions() {
  console.log('[AuthTest] 認証機能のテスト開始');
  
  try {
    // 1. Supabase接続テスト
    console.log('[AuthTest] 1. Supabase接続テスト');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('[AuthTest] セッション取得エラー:', sessionError);
    } else {
      console.log('[AuthTest] セッション取得成功:', sessionData ? 'セッションあり' : 'セッションなし');
    }
    
    // 2. AuthService.signInメソッドの存在確認
    console.log('[AuthTest] 2. AuthService.signInメソッドの存在確認');
    console.log('[AuthTest] AuthService.signIn:', typeof AuthService.signIn);
    
    // 3. Supabase auth オブジェクトの確認
    console.log('[AuthTest] 3. Supabase authオブジェクトの確認');
    console.log('[AuthTest] supabase.auth:', typeof supabase.auth);
    console.log('[AuthTest] supabase.auth.signInWithPassword:', typeof supabase.auth.signInWithPassword);
    
    // 4. 実際のサインインテスト（エラーが予想される）
    console.log('[AuthTest] 4. サインインメソッドのテスト実行');
    try {
      // テスト用の無効な認証情報で試す
      const result = await AuthService.signIn('test@example.com', 'testpassword');
      console.log('[AuthTest] サインイン結果:', result);
    } catch (error: any) {
      console.log('[AuthTest] サインインエラー（予想通り）:', error.message);
    }
    
    console.log('[AuthTest] テスト完了');
    
  } catch (error: any) {
    console.error('[AuthTest] テスト中にエラーが発生:', error);
    console.error('[AuthTest] エラースタック:', error.stack);
  }
}

// 即座に実行
if (__DEV__) {
  testAuthFunctions();
}

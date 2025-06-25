#!/usr/bin/env node

/**
 * Supabase接続とクエリの問題を詳細に調査
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ 環境変数が設定されていません');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function investigateSupabaseIssue() {
  console.log('🔍 Supabase接続とクエリの詳細調査\n');
  
  // 1. 基本的な接続テスト
  console.log('=== 1. 基本接続テスト ===');
  try {
    const { data, error } = await supabase
      .from('external_products')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('❌ 接続エラー:', error);
    } else {
      console.log('✅ 接続成功');
    }
  } catch (e) {
    console.error('❌ 予期しないエラー:', e);
  }
  
  // 2. カウント取得の各種パターンをテスト
  console.log('\n=== 2. カウント取得テスト ===');
  
  // パターン1: シンプルなカウント
  try {
    const { count, error } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true });
    
    console.log('パターン1 (全件カウント):', count, error ? `エラー: ${error.message}` : '');
  } catch (e) {
    console.error('パターン1 エラー:', e.message);
  }
  
  // パターン2: フィルター付きカウント
  try {
    const { count, error } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);
    
    console.log('パターン2 (is_active=true):', count, error ? `エラー: ${error.message}` : '');
  } catch (e) {
    console.error('パターン2 エラー:', e.message);
  }
  
  // パターン3: 複数フィルター
  try {
    const { count, error } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .eq('is_used', false);
    
    console.log('パターン3 (is_active=true, is_used=false):', count, error ? `エラー: ${error.message}` : '');
  } catch (e) {
    console.error('パターン3 エラー:', e.message);
  }
  
  // 3. データ取得のテスト
  console.log('\n=== 3. データ取得テスト ===');
  
  // 通常のデータ取得
  try {
    const { data, error } = await supabase
      .from('external_products')
      .select('*')
      .eq('is_active', true)
      .limit(20);
    
    console.log('通常取得:', data ? `${data.length}件` : 'なし', error ? `エラー: ${error.message}` : '');
  } catch (e) {
    console.error('通常取得エラー:', e.message);
  }
  
  // range使用
  try {
    const { data, error } = await supabase
      .from('external_products')
      .select('*')
      .eq('is_active', true)
      .range(0, 19);
    
    console.log('range取得:', data ? `${data.length}件` : 'なし', error ? `エラー: ${error.message}` : '');
  } catch (e) {
    console.error('range取得エラー:', e.message);
  }
  
  // 4. RLSとアクセス権限の確認
  console.log('\n=== 4. RLS（Row Level Security）確認 ===');
  try {
    // RLSが有効かどうかを確認するために、異なるクエリパターンを試す
    const queries = [
      { name: 'SELECT権限', query: supabase.from('external_products').select('id').limit(1) },
      { name: 'COUNT権限', query: supabase.from('external_products').select('id', { count: 'exact', head: true }) },
    ];
    
    for (const { name, query } of queries) {
      const result = await query;
      console.log(`${name}:`, result.error ? `❌ ${result.error.message}` : '✅ OK');
    }
  } catch (e) {
    console.error('RLS確認エラー:', e);
  }
  
  // 5. 環境変数の内容確認（一部マスク）
  console.log('\n=== 5. 環境変数確認 ===');
  console.log('SUPABASE_URL:', supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : '未設定');
  console.log('SUPABASE_ANON_KEY:', supabaseAnonKey ? supabaseAnonKey.substring(0, 20) + '...' : '未設定');
}

// 実行
investigateSupabaseIssue()
  .then(() => {
    console.log('\n✅ 調査完了');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ エラー:', error);
    process.exit(1);
  });

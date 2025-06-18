#!/usr/bin/env node

/**
 * Supabase RLS（Row Level Security）の診断スクリプト
 * external_productsテーブルのRLS設定を確認します
 */

require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://ddypgpljprljqrblpuli.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

async function checkRLS() {
  console.log('🔍 Supabase RLS診断を開始します...\n');
  
  if (!SUPABASE_ANON_KEY) {
    console.error('❌ SUPABASE_ANON_KEYが設定されていません');
    process.exit(1);
  }
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  try {
    // 1. 通常のクエリでデータ取得
    console.log('1️⃣ 通常のクエリでデータ取得テスト');
    const { data: normalData, error: normalError, count: normalCount } = await supabase
      .from('external_products')
      .select('*', { count: 'exact' })
      .limit(5);
    
    if (normalError) {
      console.error('   ❌ エラー:', normalError.message);
      console.log('\n   💡 RLSが有効でアクセスが制限されている可能性があります');
    } else {
      console.log(`   ✅ 成功: ${normalCount}件の商品が取得可能`);
      if (normalData && normalData.length > 0) {
        console.log('   サンプル:', normalData[0].title);
      }
    }
    
    // 2. RLSの状態確認（システムテーブルから）
    console.log('\n2️⃣ RLSの状態確認');
    const { data: rlsStatus, error: rlsError } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public')
      .eq('tablename', 'external_products')
      .single();
    
    if (rlsError) {
      console.log('   ⚠️ システムテーブルへのアクセス制限');
    } else {
      console.log('   ✅ テーブルが存在することを確認');
    }
    
    // 3. 認証なしでのアクセステスト
    console.log('\n3️⃣ 認証なしでのアクセステスト');
    const { data: anonData, error: anonError } = await supabase
      .from('external_products')
      .select('id, title')
      .limit(1);
    
    if (anonError) {
      console.error('   ❌ 認証なしアクセスエラー:', anonError.message);
    } else {
      console.log('   ✅ 認証なしでもアクセス可能');
    }
    
    // 4. アプリケーションからのアクセスをシミュレート
    console.log('\n4️⃣ アプリケーションからのアクセスをシミュレート');
    const { data: appData, error: appError } = await supabase
      .from('external_products')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: true })
      .limit(10);
    
    if (appError) {
      console.error('   ❌ アプリクエリエラー:', appError.message);
      console.log('\n   考えられる原因:');
      console.log('   - RLSポリシーが厳しすぎる');
      console.log('   - is_activeカラムが存在しない');
      console.log('   - priorityカラムが存在しない');
    } else {
      console.log(`   ✅ アプリクエリ成功: ${appData?.length || 0}件取得`);
    }
    
    // 5. 推奨される解決策
    console.log('\n📋 推奨される解決策:');
    console.log('1. SupabaseダッシュボードでRLSポリシーを確認');
    console.log('2. 以下のSQLを実行してRLSを適切に設定:');
    console.log(getRLSFixSQL());
    
  } catch (error) {
    console.error('\n❌ 予期しないエラー:', error);
  }
}

function getRLSFixSQL() {
  return `
-- RLSを無効化する場合（開発環境のみ推奨）
ALTER TABLE external_products DISABLE ROW LEVEL SECURITY;

-- または、適切なRLSポリシーを設定する場合
ALTER TABLE external_products ENABLE ROW LEVEL SECURITY;

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Allow public read access" ON external_products;

-- 新しい読み取り専用ポリシーを作成
CREATE POLICY "Allow public read access" ON external_products
  FOR SELECT
  USING (true);

-- is_activeがtrueの商品のみ表示する場合
CREATE POLICY "Allow active products only" ON external_products
  FOR SELECT
  USING (is_active = true);
`;
}

// スクリプトの実行
checkRLS().catch(console.error);

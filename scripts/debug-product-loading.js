#!/usr/bin/env node

/**
 * 商品読み込みの詳細デバッグスクリプト
 * アプリケーションコードの挙動を再現して問題を特定します
 */

require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

// 環境変数（アプリと同じ方法で読み込み）
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 商品読み込みデバッグを開始します...\n');

// 環境変数の確認
console.log('1️⃣ 環境変数チェック');
console.log(`   SUPABASE_URL: ${SUPABASE_URL ? '✅ 設定済み' : '❌ 未設定'}`);
console.log(`   SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY ? '✅ 設定済み' : '❌ 未設定'}`);

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('\n❌ 環境変数が設定されていません');
  process.exit(1);
}

// Supabaseクライアントの作成（アプリと同じ設定）
const supabase = createClient(SUPABASE_URL.trim(), SUPABASE_ANON_KEY.trim(), {
  auth: {
    autoRefreshToken: true,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

async function debugProductLoading() {
  try {
    console.log('\n2️⃣ 基本的なクエリテスト');
    
    // 1. シンプルなクエリ
    const { data: simpleData, error: simpleError } = await supabase
      .from('external_products')
      .select('*')
      .limit(1);
    
    if (simpleError) {
      console.error('   ❌ シンプルクエリエラー:', simpleError);
    } else {
      console.log('   ✅ シンプルクエリ成功:', simpleData?.length || 0, '件');
    }
    
    // 2. アプリと同じクエリ（fetchProducts の再現）
    console.log('\n3️⃣ アプリケーションクエリの再現');
    
    let query = supabase
      .from('external_products')
      .select('*')
      .eq('is_active', true);
    
    const { data, error, count } = await query
      .select('*', { count: 'exact' })
      .order('priority', { ascending: true, nullsFirst: false })
      .order('last_synced', { ascending: false })
      .range(0, 19);
    
    if (error) {
      console.error('   ❌ アプリクエリエラー:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      
      // エラーの詳細分析
      if (error.message.includes('column')) {
        console.log('\n   💡 カラムが存在しない可能性があります');
        console.log('   必要なカラム: is_active, priority, last_synced');
      }
    } else {
      console.log('   ✅ アプリクエリ成功');
      console.log(`   - 総件数: ${count}件`);
      console.log(`   - 取得件数: ${data?.length || 0}件`);
      
      if (data && data.length > 0) {
        console.log('\n   取得したデータのサンプル:');
        const sample = data[0];
        console.log(`   - ID: ${sample.id}`);
        console.log(`   - Title: ${sample.title}`);
        console.log(`   - Brand: ${sample.brand}`);
        console.log(`   - Price: ¥${sample.price}`);
        console.log(`   - Is Active: ${sample.is_active}`);
        console.log(`   - Priority: ${sample.priority}`);
        console.log(`   - Tags: ${sample.tags?.join(', ') || 'なし'}`);
      }
    }
    
    // 3. カラムの存在確認
    console.log('\n4️⃣ テーブル構造の確認');
    const { data: schemaData, error: schemaError } = await supabase
      .from('external_products')
      .select('*')
      .limit(0);
    
    if (!schemaError && schemaData !== null) {
      console.log('   ✅ テーブルへのアクセス成功');
    }
    
    // 4. 特定のフィルターテスト
    console.log('\n5️⃣ フィルターテスト');
    
    // is_activeフィルターなし
    const { data: noFilterData, error: noFilterError, count: noFilterCount } = await supabase
      .from('external_products')
      .select('*', { count: 'exact' })
      .limit(10);
    
    if (!noFilterError) {
      console.log(`   ✅ フィルターなし: ${noFilterCount}件`);
    }
    
    // is_active = trueのみ
    const { data: activeData, error: activeError, count: activeCount } = await supabase
      .from('external_products')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .limit(10);
    
    if (!activeError) {
      console.log(`   ✅ is_active = true: ${activeCount}件`);
    }
    
    // is_active = falseのみ
    const { data: inactiveData, error: inactiveError, count: inactiveCount } = await supabase
      .from('external_products')
      .select('*', { count: 'exact' })
      .eq('is_active', false)
      .limit(10);
    
    if (!inactiveError) {
      console.log(`   ✅ is_active = false: ${inactiveCount}件`);
    }
    
    // 5. ネットワーク接続確認
    console.log('\n6️⃣ ネットワーク接続確認');
    try {
      const response = await fetch(SUPABASE_URL + '/rest/v1/', {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });
      console.log(`   ✅ Supabase API応答: ${response.status} ${response.statusText}`);
    } catch (error) {
      console.error('   ❌ ネットワークエラー:', error.message);
    }
    
    // 6. 解決策の提案
    console.log('\n📋 分析結果と解決策:');
    
    if (count === 0 && noFilterCount > 0) {
      console.log('⚠️ is_active = trueの商品が存在しません');
      console.log('💡 解決方法:');
      console.log('1. すべての商品をアクティブにする:');
      console.log('   UPDATE external_products SET is_active = true;');
      console.log('2. またはアプリ側でis_activeフィルターを削除');
    }
    
    if (error && error.message.includes('column')) {
      console.log('⚠️ 必要なカラムが存在しない可能性があります');
      console.log('💡 解決方法:');
      console.log('1. テーブル構造を更新する:');
      console.log(getTableUpdateSQL());
    }
    
  } catch (error) {
    console.error('\n❌ 予期しないエラー:', error);
  }
}

function getTableUpdateSQL() {
  return `
-- is_activeカラムが存在しない場合
ALTER TABLE external_products 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- priorityカラムが存在しない場合
ALTER TABLE external_products 
ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 999;

-- last_syncedカラムが存在しない場合
ALTER TABLE external_products 
ADD COLUMN IF NOT EXISTS last_synced TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- 既存データをアクティブにする
UPDATE external_products 
SET is_active = true 
WHERE is_active IS NULL;
`;
}

// スクリプトの実行
debugProductLoading().catch(console.error);

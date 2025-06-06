#!/usr/bin/env node
/**
 * RLSポリシーを確認してテーブルに直接データを挿入するテスト
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// 環境変数の読み込み
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Supabaseクライアントの作成
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('環境変数が設定されていません: SUPABASE_URL, SUPABASE_SERVICE_KEY');
  process.exit(1);
}

console.log('Supabase URL:', supabaseUrl);
console.log('Using service key:', supabaseKey.startsWith('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkeXBncGxqcHJsanFyYmxwdWxpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSI') ? 'Yes' : 'No');

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

async function testRLSBypass() {
  console.log('=== RLS バイパステスト ===');
  
  // テスト用データ
  const testProduct = {
    id: 'rls-test-' + Date.now(),
    title: 'RLSテスト商品',
    price: 1000,
    brand: 'テストブランド',
    image_url: 'https://example.com/test.jpg',
    description: 'RLSテスト用商品',
    tags: ['テスト'],
    category: 'テストカテゴリ',
    genre_id: 100001,
    affiliate_url: 'https://example.com/affiliate',
    source: 'rakuten',
    is_active: true,
    last_synced: new Date().toISOString()
  };

  console.log('挿入するデータ:');
  console.log(JSON.stringify(testProduct, null, 2));

  try {
    // RLSをバイパスしてテーブルに直接アクセス
    console.log('\n1. RPC呼び出しで挿入を試行...');
    const { data: rpcData, error: rpcError } = await supabase
      .rpc('insert_external_product', {
        product_data: testProduct
      });

    if (rpcError) {
      console.log('RPC関数が存在しない可能性があります:', rpcError.message);
    } else {
      console.log('RPC結果:', rpcData);
    }

    // 通常の挿入を再試行（デバッグ情報付き）
    console.log('\n2. 通常の挿入を再試行（詳細ログ付き）...');
    const { data, error, status, statusText } = await supabase
      .from('external_products')
      .insert([testProduct])
      .select();

    console.log('Response status:', status);
    console.log('Response statusText:', statusText);
    
    if (error) {
      console.error('エラー詳細:');
      console.error('  Full error object:', error);
      console.error('  Error keys:', Object.keys(error));
      console.error('  Error type:', typeof error);
      console.error('  Error constructor:', error.constructor.name);
    } else if (data) {
      console.log('✅ 挿入成功！');
      console.log('返されたデータ:', data);
    } else {
      console.log('⚠️ エラーもデータもnull');
    }

    // 挿入後の確認（別の方法）
    console.log('\n3. データの存在確認...');
    const { data: checkData, error: checkError } = await supabase
      .from('external_products')
      .select('id, title, price')
      .eq('id', testProduct.id)
      .single();
      
    if (!checkError && checkData) {
      console.log('✅ データベースで確認できました:', checkData);
    } else if (checkError) {
      console.log('確認エラー:', checkError.message);
    } else {
      console.log('❌ データベースで確認できませんでした');
    }

    // 全データの件数を確認
    console.log('\n4. テーブル全体の件数確認...');
    const { count, error: countError } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true });
      
    if (!countError) {
      console.log('テーブル内の総商品数:', count);
    }

  } catch (error) {
    console.error('予期しないエラー:', error);
  }
}

testRLSBypass().then(() => {
  console.log('\nテスト完了');
  process.exit(0);
}).catch((error) => {
  console.error('エラーが発生しました:', error);
  process.exit(1);
});

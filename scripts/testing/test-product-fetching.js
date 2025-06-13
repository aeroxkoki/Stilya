#!/usr/bin/env node

/**
 * 商品取得のデバッグスクリプト
 * 5つで商品が出なくなる問題の調査
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// 環境変数の読み込み
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase環境変数が設定されていません');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testProductFetching() {
  console.log('=== 商品取得のテスト ===\n');
  
  try {
    const limit = 20;
    
    // 複数のoffsetでテスト
    for (let page = 0; page < 3; page++) {
      const offset = page * limit;
      
      console.log(`\n--- ページ${page + 1} (offset: ${offset}, limit: ${limit}) ---`);
      
      // productServiceと同じクエリ
      const { data, error, count } = await supabase
        .from('external_products')
        .select('*', { count: 'exact' })
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (error) {
        console.error('❌ エラー:', error);
        continue;
      }
      
      console.log(`✅ 取得した商品数: ${data?.length || 0}件`);
      console.log(`✅ 総商品数: ${count}件`);
      
      if (data && data.length > 0) {
        console.log('取得した商品ID:');
        data.slice(0, 5).forEach((product, i) => {
          console.log(`  ${i + 1}. ${product.id}`);
        });
        if (data.length > 5) {
          console.log(`  ... 他${data.length - 5}件`);
        }
      }
    }
    
    // range()の仕様を確認
    console.log('\n--- range()メソッドの仕様確認 ---');
    console.log('range(0, 4) で5件取得されるはず:');
    const { data: rangeTest } = await supabase
      .from('external_products')
      .select('id')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(0, 4);
    
    console.log(`実際の取得数: ${rangeTest?.length || 0}件`);
    
    // limit()を使った場合
    console.log('\nlimit(5) で5件取得されるはず:');
    const { data: limitTest } = await supabase
      .from('external_products')
      .select('id')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(5);
    
    console.log(`実際の取得数: ${limitTest?.length || 0}件`);
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
  }
}

// 実行
testProductFetching().then(() => {
  console.log('\nテスト完了');
  process.exit(0);
}).catch(error => {
  console.error('エラー:', error);
  process.exit(1);
});

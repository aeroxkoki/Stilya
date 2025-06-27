/**
 * Supabaseクエリのテストスクリプト
 * Bad Requestエラーの根本原因を特定するためのテスト
 */

import { supabase, TABLES } from '../services/supabase';

async function testSupabaseNotQuery() {
  console.log('=== Supabase NOT Query Test ===\n');

  try {
    // テスト用のIDリストを作成
    const testIds = ['test-id-1', 'test-id-2', 'test-id-3'];
    
    console.log('Testing NOT IN query with array...');
    
    // 正しい構文：配列を直接渡す
    const { data: data1, error: error1 } = await supabase
      .from(TABLES.EXTERNAL_PRODUCTS)
      .select('id, title')
      .not('id', 'in', testIds)
      .limit(5);
    
    if (error1) {
      console.error('❌ Error with array syntax:', error1);
    } else {
      console.log('✅ Array syntax worked! Found', data1?.length, 'products');
    }

    // 大量のIDでテスト
    console.log('\nTesting with large ID array (1000 items)...');
    const largeIdArray = Array.from({ length: 1000 }, (_, i) => `test-id-${i}`);
    
    const { data: data2, error: error2 } = await supabase
      .from(TABLES.EXTERNAL_PRODUCTS)
      .select('id, title')
      .not('id', 'in', largeIdArray)
      .limit(5);
    
    if (error2) {
      console.error('❌ Error with large array:', error2);
    } else {
      console.log('✅ Large array worked! Found', data2?.length, 'products');
    }

    // overlapsクエリのテスト
    console.log('\nTesting overlaps query...');
    const testTags = ['メンズ', 'カジュアル'];
    
    const { data: data3, error: error3 } = await supabase
      .from(TABLES.EXTERNAL_PRODUCTS)
      .select('id, title, tags')
      .overlaps('tags', testTags)
      .limit(5);
    
    if (error3) {
      console.error('❌ Error with overlaps:', error3);
    } else {
      console.log('✅ Overlaps worked! Found', data3?.length, 'products');
      if (data3 && data3.length > 0) {
        console.log('Sample tags:', data3[0].tags);
      }
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// テストを実行
if (require.main === module) {
  testSupabaseNotQuery().then(() => {
    console.log('\n=== Test completed ===');
    process.exit(0);
  }).catch((error) => {
    console.error('Test failed:', error);
    process.exit(1);
  });
}

export { testSupabaseNotQuery };

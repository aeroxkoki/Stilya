// Supabase Bad Requestエラーのデバッグスクリプト
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// .envファイルの読み込み
dotenv.config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('環境変数が設定されていません');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testQueries() {
  console.log('=== Supabase Query Debug ===');
  console.log('URL:', supabaseUrl);
  console.log('');

  try {
    // 1. 基本的なクエリテスト
    console.log('1. 基本的なクエリテスト...');
    const { data: basicData, error: basicError } = await supabase
      .from('external_products')
      .select('*')
      .eq('is_active', true)
      .limit(5);

    if (basicError) {
      console.error('基本クエリエラー:', basicError);
    } else {
      console.log('✓ 基本クエリ成功:', basicData?.length, '件');
    }

    // 2. not演算子のテスト
    console.log('\n2. not演算子のテスト...');
    const testIds = ['test-id-1', 'test-id-2'];
    
    // 方法1: 配列を直接渡す
    const { error: notError1 } = await supabase
      .from('external_products')
      .select('*')
      .not('id', 'in', testIds)
      .limit(1);

    if (notError1) {
      console.error('not演算子エラー (配列):', notError1);
    } else {
      console.log('✓ not演算子成功 (配列)');
    }

    // 3. overlaps演算子のテスト
    console.log('\n3. overlaps演算子のテスト...');
    const testTags = ['カジュアル', 'ストリート'];
    
    const { error: overlapsError } = await supabase
      .from('external_products')
      .select('*')
      .overlaps('tags', testTags)
      .limit(1);

    if (overlapsError) {
      console.error('overlaps演算子エラー:', overlapsError);
      
      // contains演算子を試す
      const { error: containsError } = await supabase
        .from('external_products')
        .select('*')
        .contains('tags', testTags)
        .limit(1);

      if (containsError) {
        console.error('contains演算子もエラー:', containsError);
      } else {
        console.log('✓ contains演算子は成功');
      }
    } else {
      console.log('✓ overlaps演算子成功');
    }

    // 4. テーブル構造の確認
    console.log('\n4. テーブル構造の確認...');
    const { data: sampleData, error: sampleError } = await supabase
      .from('external_products')
      .select('*')
      .limit(1);

    if (sampleError) {
      console.error('サンプルデータ取得エラー:', sampleError);
    } else if (sampleData && sampleData.length > 0) {
      console.log('サンプルデータ構造:');
      console.log('- カラム:', Object.keys(sampleData[0]));
      console.log('- IDの型:', typeof sampleData[0].id);
      console.log('- tagsの型:', Array.isArray(sampleData[0].tags) ? 'array' : typeof sampleData[0].tags);
    }

    // 5. RLSポリシーのテスト
    console.log('\n5. RLSポリシーのテスト...');
    const { data: authData } = await supabase.auth.getSession();
    console.log('認証状態:', authData?.session ? '認証済み' : '未認証');

  } catch (error) {
    console.error('予期せぬエラー:', error);
  }
}

// 実行
testQueries().then(() => {
  console.log('\n=== デバッグ完了 ===');
  process.exit(0);
});

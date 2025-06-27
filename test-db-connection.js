// Supabaseデータベース接続テストとデバッグ
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

console.log('環境変数チェック:');
console.log('SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
console.log('SUPABASE_ANON_KEY:', supabaseAnonKey ? '✓' : '✗');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('環境変数が設定されていません');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDatabaseConnection() {
  try {
    console.log('\n=== データベース接続テスト開始 ===\n');
    
    // 1. 問題のある商品を取得
    console.log('1. 問題のある商品の確認...');
    const problemProductIds = [
      'rakuten_shoplistselect:10300598',
      'rakuten_shoplistselect:10277277',
      'rakuten_fleume:10786796',
      'rakuten_locondo:12995701'
    ];
    
    const { data: problemProducts, error: problemError } = await supabase
      .from('external_products')
      .select('*')
      .in('id', problemProductIds);
    
    if (problemError) {
      console.error('エラー:', problemError);
      return;
    }
    
    console.log(`問題のある商品数: ${problemProducts?.length || 0}`);
    problemProducts?.forEach((product, index) => {
      console.log(`\n商品 ${index + 1}:`);
      console.log('ID:', product.id);
      console.log('タイトル:', product.title?.substring(0, 50) + '...');
      console.log('image_url:', product.image_url || 'NULL/UNDEFINED');
      console.log('imageUrl:', product.imageUrl || 'フィールドなし');
      console.log('image:', product.image || 'フィールドなし');
      console.log('ソース:', product.source);
    });
    
    // 2. image_urlがnullまたは空の商品をカウント
    console.log('\n2. image_urlに問題がある商品の統計...');
    const { count: nullImageCount, error: countError } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true })
      .or('image_url.is.null,image_url.eq.');
    
    if (!countError) {
      console.log(`image_urlがNULLまたは空の商品数: ${nullImageCount}`);
    }
    
    // 3. テーブルのカラム情報を確認
    console.log('\n3. テーブル構造の確認...');
    const { data: sampleProduct, error: sampleError } = await supabase
      .from('external_products')
      .select('*')
      .limit(1)
      .single();
    
    if (!sampleError && sampleProduct) {
      console.log('カラム一覧:', Object.keys(sampleProduct));
    }
    
    // 4. 正常な商品の例
    console.log('\n4. 正常な商品の例...');
    const { data: normalProducts, error: normalError } = await supabase
      .from('external_products')
      .select('*')
      .not('image_url', 'is', null)
      .not('image_url', 'eq', '')
      .limit(3);
    
    if (!normalError && normalProducts) {
      normalProducts.forEach((product, index) => {
        console.log(`\n正常な商品 ${index + 1}:`);
        console.log('ID:', product.id);
        console.log('image_url:', product.image_url?.substring(0, 100) + '...');
      });
    }
    
    console.log('\n=== テスト完了 ===\n');
    
  } catch (error) {
    console.error('予期しないエラー:', error);
  }
}

testDatabaseConnection();

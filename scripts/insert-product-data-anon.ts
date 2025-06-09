import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { sampleProducts } from '../src/data/sampleProducts';

dotenv.config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Anonキーでクライアントを作成
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function insertProductDataWithAnon() {
  console.log('🚀 商品データの挿入を開始します（Anonキー使用）...');
  console.log('📊 挿入する商品数:', sampleProducts.length);

  try {
    // テーブルの存在確認
    const { data: testData, error: testError } = await supabase
      .from('external_products')
      .select('id')
      .limit(1);

    if (testError) {
      console.error('❌ external_productsテーブルへのアクセスエラー:', testError);
      console.log('💡 RLSが有効な場合、管理画面から直接データを挿入するか、RLSを無効化してください。');
      
      // SQLエディタで実行するためのSQLを生成
      console.log('\n📝 以下のSQLをSupabaseのSQLエディタで実行してください:\n');
      console.log('-- RLSを無効化');
      console.log('ALTER TABLE external_products DISABLE ROW LEVEL SECURITY;');
      console.log('\n-- サンプルデータを挿入');
      
      sampleProducts.slice(0, 5).forEach((product, index) => {
        console.log(`INSERT INTO external_products (title, image_url, price, brand, category, tags, description, affiliate_url, source)
VALUES ('${product.name.replace(/'/g, "''")}', '${product.image}', ${product.price}, '${product.brand}', '${product.category}', 
ARRAY[${product.tags?.map(tag => `'${tag}'`).join(', ') || ''}], '${product.description?.replace(/'/g, "''") || ''}', 
'${product.affiliateUrl || `https://example.com/product/${index}`}', 'sample_data');`);
      });
      
      console.log('\n-- 残りの商品も同様に挿入してください');
      return;
    }

    // データ挿入を試行
    const productsToInsert = sampleProducts.map((product, index) => ({
      title: product.name,
      image_url: product.image,
      price: product.price,
      brand: product.brand,
      category: product.category,
      tags: product.tags || [],
      description: product.description || '',
      affiliate_url: product.affiliateUrl || `https://example.com/product/${index}`,
      source: 'sample_data'
    }));

    // 1件ずつ挿入してエラーを詳しく確認
    let successCount = 0;
    for (const product of productsToInsert.slice(0, 3)) {
      const { data, error } = await supabase
        .from('external_products')
        .insert(product)
        .select();

      if (error) {
        console.error(`❌ 商品挿入エラー (${product.title}):`, error.message);
        break;
      } else {
        successCount++;
        console.log(`✅ 商品を挿入しました: ${product.title}`);
      }
    }

    if (successCount === 0) {
      console.log('\n⚠️ データ挿入に失敗しました。');
      console.log('💡 Supabaseダッシュボードで以下を確認してください:');
      console.log('1. external_productsテーブルのRLSが無効になっているか');
      console.log('2. テーブルの列定義が正しいか');
      console.log('3. 認証トークンが有効か');
    } else {
      console.log(`\n✅ ${successCount}件のデータ挿入に成功しました！`);
    }

  } catch (error) {
    console.error('❌ 予期しないエラーが発生しました:', error);
  }
}

// 実行
insertProductDataWithAnon();

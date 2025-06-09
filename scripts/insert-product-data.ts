import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { sampleProducts } from '../src/data/sampleProducts';

dotenv.config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

// サービスロールキーでクライアントを作成（RLSをバイパス）
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function insertProductData() {
  console.log('🚀 商品データの挿入を開始します...');
  console.log('📊 挿入する商品数:', sampleProducts.length);

  try {
    // 既存データを削除（オプション）
    const { error: deleteError } = await supabase
      .from('external_products')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // 存在しないIDで全削除

    if (deleteError) {
      console.log('⚠️ 既存データ削除時の警告（無視して続行）:', deleteError.message);
    }

    // サンプル商品データを external_products テーブルに挿入
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

    // バッチで挿入
    const batchSize = 10;
    for (let i = 0; i < productsToInsert.length; i += batchSize) {
      const batch = productsToInsert.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('external_products')
        .insert(batch)
        .select();

      if (error) {
        console.error(`❌ バッチ ${i / batchSize + 1} の挿入エラー:`, error);
      } else {
        console.log(`✅ バッチ ${i / batchSize + 1} を挿入しました (${data?.length || 0}件)`);
      }
    }

    // 挿入結果を確認
    const { count, error: countError } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ カウント取得エラー:', countError);
    } else {
      console.log('📊 external_products テーブルの総商品数:', count);
    }

    // productsテーブルにも同じデータを挿入（互換性のため）
    console.log('\n🔄 productsテーブルへのデータコピーを開始...');
    
    for (let i = 0; i < productsToInsert.length; i += batchSize) {
      const batch = productsToInsert.slice(i, i + batchSize);
      
      const { error } = await supabase
        .from('products')
        .insert(batch);

      if (error) {
        // テーブルが存在しない場合はスキップ
        if (error.code === '42P01') {
          console.log('ℹ️ productsテーブルが存在しません。スキップします。');
          break;
        }
        console.error(`⚠️ productsテーブルへの挿入エラー（続行）:`, error.message);
      }
    }

    console.log('\n✅ データ挿入が完了しました！');
    console.log('📱 アプリを再起動して商品を確認してください。');

  } catch (error) {
    console.error('❌ 予期しないエラーが発生しました:', error);
  }
}

// 実行
insertProductData();

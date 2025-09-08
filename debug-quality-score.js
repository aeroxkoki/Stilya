#!/usr/bin/env node

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugQualityScoreUpdate() {
  console.log('🔍 品質スコア更新のデバッグを開始...\n');

  try {
    // 1. 現在のテーブル構造確認
    console.log('📋 1. テーブル構造の確認...');
    const { data: columns, error: columnsError } = await supabase
      .rpc('get_table_columns', { table_name: 'external_products' });
    
    if (columnsError) {
      console.log('⚠️ カスタムRPCが利用できません。直接確認します。');
    }

    // 2. priority, review_count, review_averageカラムの存在確認
    console.log('\n📊 2. 関連カラムの確認...');
    const { data: sampleData, error: sampleError } = await supabase
      .from('external_products')
      .select('id, title, priority, review_count, review_average')
      .limit(3);

    if (sampleError) {
      console.error('❌ サンプルデータ取得エラー:', sampleError);
      return;
    }

    console.log('サンプルデータ:');
    sampleData.forEach((product, i) => {
      console.log(`  ${i + 1}. ID: ${product.id}`);
      console.log(`     title: ${product.title?.substring(0, 50)}...`);
      console.log(`     priority: ${product.priority}`);
      console.log(`     review_count: ${product.review_count}`);
      console.log(`     review_average: ${product.review_average}\n`);
    });

    // 3. priority更新のテスト実行
    console.log('🧪 3. 小規模な更新テスト...');
    
    // priority=nullまたは10未満の商品を1件取得
    const { data: testProducts, error: testError } = await supabase
      .from('external_products')
      .select('id, title, review_count, review_average, priority')
      .or('priority.is.null,priority.lt.10')
      .limit(1);

    if (testError) {
      console.error('❌ テスト用商品取得エラー:', testError);
      return;
    }

    if (!testProducts || testProducts.length === 0) {
      console.log('ℹ️ priority更新が必要な商品がありません');
      return;
    }

    const testProduct = testProducts[0];
    console.log('テスト対象商品:');
    console.log(`  ID: ${testProduct.id}`);
    console.log(`  title: ${testProduct.title?.substring(0, 50)}...`);
    console.log(`  現在のpriority: ${testProduct.priority}`);

    // Wilson Score計算
    const reviewCount = testProduct.review_count || 0;
    const reviewAverage = testProduct.review_average || 0;
    
    let score;
    if (reviewCount === 0) {
      score = 30; // ベースラインスコア
    } else {
      const z = 1.96; // 95%信頼区間
      const n = reviewCount;
      const p = reviewAverage / 5;
      const wilson = (p + z*z/(2*n) - z * Math.sqrt(p*(1-p)/n + z*z/(4*n*n))) / (1 + z*z/n);
      score = Math.round(wilson * 100);
    }

    console.log(`  計算された新しいスコア: ${score}`);

    // 更新実行
    const { error: updateError } = await supabase
      .from('external_products')
      .update({ priority: score })
      .eq('id', testProduct.id);

    if (updateError) {
      console.error('❌ 更新エラー:', updateError);
      console.log('\n🔍 詳細なエラー分析:');
      console.log(`  message: ${updateError.message}`);
      console.log(`  details: ${updateError.details}`);
      console.log(`  hint: ${updateError.hint}`);
      console.log(`  code: ${updateError.code}`);
    } else {
      console.log('✅ 更新成功！');
      
      // 更新結果確認
      const { data: updatedProduct } = await supabase
        .from('external_products')
        .select('id, priority')
        .eq('id', testProduct.id)
        .single();
      
      console.log(`  更新後のpriority: ${updatedProduct?.priority}`);
    }

  } catch (error) {
    console.error('❌ デバッグ中にエラーが発生しました:', error);
  }
}

debugQualityScoreUpdate();

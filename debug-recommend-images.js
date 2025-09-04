#!/usr/bin/env node
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase環境変数が設定されていません');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugRecommendImages() {
  console.log('🔍 おすすめ画面の画像問題をデバッグ中...\n');

  try {
    // 最新の20商品を取得
    console.log('📦 最新の商品を取得中...');
    const { data: products, error: fetchError } = await supabase
      .from('external_products')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (fetchError) {
      console.error('❌ 商品取得エラー:', fetchError);
      return;
    }

    if (!products || products.length === 0) {
      console.log('⚠️ 商品が見つかりません');
      return;
    }

    console.log(`✅ ${products.length}個の商品を取得しました\n`);

    // 画像URL分析
    console.log('📸 画像URLの分析:');
    console.log('================================');

    const imageAnalysis = {
      totalProducts: products.length,
      hasImage: 0,
      noImage: 0,
      imageUrls: [],
      brokenUrls: [],
      patterns: {}
    };

    products.forEach((product, index) => {
      const imageUrl = product.image_url || product.imageUrl || '';
      
      console.log(`\n${index + 1}. ${product.title?.substring(0, 50)}...`);
      console.log(`   ID: ${product.id}`);
      console.log(`   価格: ¥${product.price?.toLocaleString()}`);
      
      if (imageUrl) {
        imageAnalysis.hasImage++;
        imageAnalysis.imageUrls.push(imageUrl);
        
        console.log(`   画像URL: ✅ ${imageUrl.substring(0, 100)}...`);
        
        // URLパターン分析
        if (imageUrl.includes('rakuten')) {
          imageAnalysis.patterns.rakuten = (imageAnalysis.patterns.rakuten || 0) + 1;
          
          // 楽天画像URLの形式チェック
          if (imageUrl.includes('cabinet')) {
            console.log('   タイプ: 楽天 (cabinet形式)');
          } else if (imageUrl.includes('image.rakuten.co.jp')) {
            console.log('   タイプ: 楽天 (image形式)');
          }
        } else if (imageUrl.includes('placeholder')) {
          imageAnalysis.patterns.placeholder = (imageAnalysis.patterns.placeholder || 0) + 1;
          console.log('   タイプ: プレースホルダー');
        } else {
          imageAnalysis.patterns.other = (imageAnalysis.patterns.other || 0) + 1;
          console.log('   タイプ: その他');
        }
        
        // HTTPSチェック
        if (!imageUrl.startsWith('https://')) {
          console.log('   ⚠️ 警告: HTTPSではありません');
          imageAnalysis.brokenUrls.push(imageUrl);
        }
        
        // 画像サイズパラメータのチェック
        if (imageUrl.includes('_ex=')) {
          const sizeMatch = imageUrl.match(/_ex=(\d+x\d+)/);
          if (sizeMatch) {
            console.log(`   サイズ指定: ${sizeMatch[1]}`);
          }
        }
        
      } else {
        imageAnalysis.noImage++;
        console.log('   画像URL: ❌ なし');
      }
    });

    // サマリー表示
    console.log('\n\n📊 分析結果サマリー:');
    console.log('================================');
    console.log(`総商品数: ${imageAnalysis.totalProducts}`);
    console.log(`画像あり: ${imageAnalysis.hasImage} (${(imageAnalysis.hasImage / imageAnalysis.totalProducts * 100).toFixed(1)}%)`);
    console.log(`画像なし: ${imageAnalysis.noImage} (${(imageAnalysis.noImage / imageAnalysis.totalProducts * 100).toFixed(1)}%)`);
    
    console.log('\n画像URLパターン:');
    Object.entries(imageAnalysis.patterns).forEach(([pattern, count]) => {
      console.log(`  ${pattern}: ${count}件`);
    });

    if (imageAnalysis.brokenUrls.length > 0) {
      console.log('\n⚠️ 問題のあるURL:');
      imageAnalysis.brokenUrls.forEach(url => {
        console.log(`  - ${url.substring(0, 100)}...`);
      });
    }

    // テーブル構造の確認
    console.log('\n\n🔍 テーブル構造の確認:');
    const { data: columns, error: columnsError } = await supabase
      .rpc('get_table_columns', { table_name: 'external_products' });

    if (!columnsError && columns) {
      const imageColumns = columns.filter(col => 
        col.column_name.toLowerCase().includes('image') || 
        col.column_name.toLowerCase().includes('url')
      );
      
      console.log('画像関連カラム:');
      imageColumns.forEach(col => {
        console.log(`  - ${col.column_name} (${col.data_type})`);
      });
    }

    // 最新のスワイプデータ確認
    console.log('\n\n📱 最新のスワイプデータを確認:');
    const { data: swipes, error: swipeError } = await supabase
      .from('swipes')
      .select(`
        *,
        external_products (
          id,
          title,
          image_url,
          price
        )
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    if (!swipeError && swipes) {
      console.log(`最新${swipes.length}件のスワイプデータ:`);
      swipes.forEach((swipe, index) => {
        const product = swipe.external_products;
        console.log(`\n${index + 1}. ${product?.title?.substring(0, 30)}...`);
        console.log(`   画像: ${product?.image_url ? '✅' : '❌'}`);
      });
    }

  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
  }
}

// RPCファンクションが存在しない場合のフォールバック
async function createGetTableColumnsFunction() {
  const query = `
    CREATE OR REPLACE FUNCTION get_table_columns(table_name text)
    RETURNS TABLE(column_name text, data_type text)
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      RETURN QUERY
      SELECT 
        c.column_name::text,
        c.data_type::text
      FROM information_schema.columns c
      WHERE c.table_name = $1
        AND c.table_schema = 'public';
    END;
    $$;
  `;
  
  try {
    const { error } = await supabase.rpc('query', { query });
    if (error) {
      console.log('ℹ️ RPC関数は既に存在するか、作成できませんでした');
    }
  } catch (e) {
    // 無視
  }
}

// 実行
createGetTableColumnsFunction().then(() => {
  debugRecommendImages().then(() => {
    console.log('\n✅ デバッグ完了');
    process.exit(0);
  });
});

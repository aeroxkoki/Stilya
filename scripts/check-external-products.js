#!/usr/bin/env node
/**
 * external_productsテーブルの存在と内容を確認するスクリプト
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// 環境変数の読み込み
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Supabaseクライアントの作成
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('環境変数が設定されていません: SUPABASE_URL, SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTable() {
  console.log('=== external_productsテーブルの確認 ===');
  console.log(`Supabase URL: ${supabaseUrl}`);
  console.log(`Using key: ${supabaseKey.substring(0, 20)}...`);

  try {
    // テーブルの存在確認と行数の取得
    const { count, error: countError } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      if (countError.message.includes('relation') && countError.message.includes('does not exist')) {
        console.error('❌ external_productsテーブルが存在しません');
        console.log('\n次のSQLを実行してテーブルを作成してください:');
        console.log('cd /Users/koki_air/Documents/GitHub/Stilya');
        console.log('psql -h ddypgpljprljqrblpuli.supabase.co -p 5432 -U postgres -d postgres -f supabase/migrations/003_create_external_products_table.sql');
        return;
      }
      console.error('カウントエラー:', countError);
      return;
    }

    console.log(`✅ external_productsテーブルが存在します`);
    console.log(`現在の商品数: ${count || 0}件`);

    // 最新の5件を取得して表示
    if (count > 0) {
      const { data, error } = await supabase
        .from('external_products')
        .select('id, title, price, source, is_active, last_synced')
        .order('last_synced', { ascending: false })
        .limit(5);

      if (!error && data) {
        console.log('\n最新の5件:');
        data.forEach((product, index) => {
          console.log(`${index + 1}. ${product.title} (¥${product.price}) - ${product.source} - Active: ${product.is_active}`);
        });
      }
    }

    // アクティブな商品数の確認
    const { count: activeCount } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    console.log(`\nアクティブな商品数: ${activeCount || 0}件`);

  } catch (error) {
    console.error('エラー:', error);
  }
}

checkTable().then(() => {
  console.log('\n確認完了');
  process.exit(0);
}).catch((error) => {
  console.error('エラーが発生しました:', error);
  process.exit(1);
});

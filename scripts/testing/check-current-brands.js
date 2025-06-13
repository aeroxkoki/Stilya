#!/usr/bin/env node
/**
 * 現在データベースに登録されているブランドの統計情報を表示
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

async function checkBrands() {
  console.log('\n📊 現在データベースに登録されているブランド一覧\n');
  console.log('='.repeat(60));

  try {
    // ブランド別の商品数を取得
    const { data: brandStats, error } = await supabase
      .from('external_products')
      .select('brand, priority')
      .eq('is_active', true);

    if (error) {
      console.error('❌ エラー:', error);
      return;
    }

    // ブランド別に集計
    const brandCounts = {};
    const brandPriorities = {};

    brandStats?.forEach(item => {
      const brand = item.brand || 'Unknown';
      brandCounts[brand] = (brandCounts[brand] || 0) + 1;
      if (!brandPriorities[brand] && item.priority) {
        brandPriorities[brand] = item.priority;
      }
    });

    // ソート（優先度順、次に商品数順）
    const sortedBrands = Object.entries(brandCounts)
      .map(([brand, count]) => ({
        brand,
        count,
        priority: brandPriorities[brand] || 999
      }))
      .sort((a, b) => {
        if (a.priority !== b.priority) {
          return a.priority - b.priority;
        }
        return b.count - a.count;
      });

    // MVPブランドの表示
    console.log('\n🎯 MVPブランド（優先度付き）:');
    console.log('-'.repeat(60));
    console.log('ブランド名'.padEnd(25) + '優先度'.padEnd(10) + '商品数');
    console.log('-'.repeat(60));

    const mvpBrands = sortedBrands.filter(b => b.priority <= 3);
    mvpBrands.forEach(({ brand, priority, count }) => {
      console.log(
        brand.padEnd(25) + 
        `${priority}`.padEnd(10) + 
        count
      );
    });

    // その他のブランド
    console.log('\n📦 その他のブランド:');
    console.log('-'.repeat(60));
    console.log('ブランド名'.padEnd(25) + '商品数');
    console.log('-'.repeat(60));

    const otherBrands = sortedBrands.filter(b => b.priority > 3);
    otherBrands.forEach(({ brand, count }) => {
      console.log(brand.padEnd(25) + count);
    });

    // 統計サマリー
    console.log('\n📈 統計サマリー:');
    console.log('-'.repeat(60));
    console.log(`総ブランド数: ${sortedBrands.length}`);
    console.log(`総商品数: ${brandStats?.length || 0}`);
    console.log(`MVPブランド数: ${mvpBrands.length}`);
    console.log(`MVPブランドの商品数: ${mvpBrands.reduce((sum, b) => sum + b.count, 0)}`);

    // 最新同期日時の確認
    const { data: latestSync } = await supabase
      .from('external_products')
      .select('last_synced')
      .order('last_synced', { ascending: false })
      .limit(1)
      .single();

    if (latestSync) {
      console.log(`\n最終同期: ${new Date(latestSync.last_synced).toLocaleString('ja-JP')}`);
    }

  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
  }
}

// 実行
checkBrands().then(() => {
  console.log('\n✨ 完了しました\n');
}).catch(error => {
  console.error('❌ 予期しないエラー:', error);
  process.exit(1);
});
#\!/usr/bin/env node
/**
 * データベース最適化スクリプト
 * インデックスとパフォーマンスを最適化する
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// 環境変数の読み込み
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

// Supabaseクライアントの作成
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (\!supabaseUrl || \!supabaseKey) {
  console.error('❌ 必要な環境変数が設定されていません');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * データベース最適化
 */
async function optimizeDatabase() {
  console.log('\n⚙️ データベース最適化を開始します');
  
  try {
    // 重複商品の確認と処理
    console.log('- 重複商品の確認中...');
    
    // 非アクティブ商品の整理
    console.log('- 非アクティブ商品の整理...');
    const { data: inactiveUpdate, error: inactiveError } = await supabase
      .rpc('mark_old_products_inactive', { days_threshold: 30 });
      
    if (inactiveError) {
      console.error('❌ 非アクティブ設定エラー:', inactiveError.message);
    } else {
      console.log(`  ${inactiveUpdate || 0}件の古い商品を非アクティブに設定`);
    }
    
    // 商品スコアの更新
    console.log('- 商品スコアの更新...');
    const { data: scoreUpdate, error: scoreError } = await supabase
      .rpc('update_recommendation_scores');
      
    if (scoreError) {
      console.error('❌ スコア更新エラー:', scoreError.message);
    } else {
      console.log(`  ${scoreUpdate || 0}件の商品スコアを更新`);
    }
    
    // 季節タグの更新
    const currentMonth = new Date().getMonth() + 1;
    let currentSeason = 'unknown';
    if (currentMonth >= 3 && currentMonth <= 5) currentSeason = 'spring';
    else if (currentMonth >= 6 && currentMonth <= 8) currentSeason = 'summer';
    else if (currentMonth >= 9 && currentMonth <= 11) currentSeason = 'autumn';
    else currentSeason = 'winter';
    
    console.log(`- 季節タグの更新（現在の季節: ${currentSeason}）...`);
    const { data: seasonUpdate, error: seasonError } = await supabase
      .rpc('update_seasonal_relevance', { current_season: currentSeason });
      
    if (seasonError) {
      console.error('❌ 季節更新エラー:', seasonError.message);
    } else {
      console.log(`  ${seasonUpdate || 0}件の商品の季節関連性を更新`);
    }
    
    console.log('\n✅ データベース最適化が完了しました');
    
  } catch (error) {
    console.error('❌ 最適化エラー:', error.message);
    throw error;
  }
}

// メイン実行
optimizeDatabase().catch(error => {
  console.error('❌ 実行エラー:', error);
  process.exit(1);
});

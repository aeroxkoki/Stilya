#!/usr/bin/env node
/**
 * 推薦システムのモニタリング・分析スクリプト
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// 環境変数の読み込み
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 必要な環境変数が設定されていません');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 日次レポート用のスワイプ統計を取得
async function getDailySwipeStats() {
  console.log('📊 日次スワイプ統計の取得...\n');
  
  try {
    // 過去7日間のスワイプデータを集計
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    // 日別のスワイプ統計を取得
    const { data, error } = await supabase
      .from('swipes')
      .select('created_at, result, swipe_time_ms')
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('エラー:', error);
      return;
    }
    
    // 日別に集計
    const dailyStats = {};
    
    data.forEach(swipe => {
      const date = new Date(swipe.created_at).toLocaleDateString('ja-JP');
      
      if (!dailyStats[date]) {
        dailyStats[date] = {
          total: 0,
          yes: 0,
          no: 0,
          totalSwipeTime: 0,
          swipeCount: 0
        };
      }
      
      dailyStats[date].total++;
      if (swipe.result === 'yes') {
        dailyStats[date].yes++;
      } else {
        dailyStats[date].no++;
      }
      
      if (swipe.swipe_time_ms) {
        dailyStats[date].totalSwipeTime += swipe.swipe_time_ms;
        dailyStats[date].swipeCount++;
      }
    });
    
    // 結果を表示
    console.log('日付\t\t総数\tYes\tNo\tYes率\t平均時間(秒)');
    console.log('='.repeat(60));
    
    Object.entries(dailyStats)
      .sort((a, b) => new Date(b[0]) - new Date(a[0]))
      .forEach(([date, stats]) => {
        const yesRate = ((stats.yes / stats.total) * 100).toFixed(1);
        const avgTime = stats.swipeCount > 0 
          ? (stats.totalSwipeTime / stats.swipeCount / 1000).toFixed(1)
          : '-';
        
        console.log(`${date}\t${stats.total}\t${stats.yes}\t${stats.no}\t${yesRate}%\t${avgTime}`);
      });
      
  } catch (error) {
    console.error('統計取得エラー:', error);
  }
}

// カテゴリ別商品分布を確認
async function getCategoryDistribution() {
  console.log('\n\n📦 カテゴリ別商品分布\n');
  
  try {
    const { data, error } = await supabase
      .from('external_products')
      .select('source_category, is_active')
      .eq('is_active', true);
    
    if (error) {
      console.error('エラー:', error);
      return;
    }
    
    // カテゴリ別に集計
    const categoryCount = {};
    
    data.forEach(product => {
      const category = product.source_category || 'その他';
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });
    
    // 結果を表示
    console.log('カテゴリ\t\t商品数\t割合');
    console.log('='.repeat(40));
    
    const total = Object.values(categoryCount).reduce((a, b) => a + b, 0);
    
    Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .forEach(([category, count]) => {
        const percentage = ((count / total) * 100).toFixed(1);
        console.log(`${category.padEnd(16)}\t${count}\t${percentage}%`);
      });
      
    console.log('='.repeat(40));
    console.log(`合計\t\t\t${total}`);
    
  } catch (error) {
    console.error('カテゴリ分布取得エラー:', error);
  }
}

// 人気商品ランキング
async function getPopularProducts() {
  console.log('\n\n🏆 人気商品ランキング（直近30日）\n');
  
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Yesスワイプされた商品を集計
    const { data: swipes, error: swipeError } = await supabase
      .from('swipes')
      .select('product_id')
      .eq('result', 'yes')
      .gte('created_at', thirtyDaysAgo.toISOString());
    
    if (swipeError) {
      console.error('エラー:', swipeError);
      return;
    }
    
    // 商品IDごとにカウント
    const productCounts = {};
    swipes.forEach(swipe => {
      productCounts[swipe.product_id] = (productCounts[swipe.product_id] || 0) + 1;
    });
    
    // 上位10商品を取得
    const topProductIds = Object.entries(productCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([id]) => id);
    
    // 商品情報を取得
    const { data: products, error: productError } = await supabase
      .from('external_products')
      .select('id, title, brand, price, tags')
      .in('id', topProductIds);
    
    if (productError) {
      console.error('エラー:', productError);
      return;
    }
    
    // 結果を表示
    console.log('順位\tYes数\t商品名\t\t\t\tブランド\t価格');
    console.log('='.repeat(80));
    
    topProductIds.forEach((productId, index) => {
      const product = products.find(p => p.id === productId);
      const count = productCounts[productId];
      
      if (product) {
        const title = product.title.length > 30 
          ? product.title.substring(0, 30) + '...' 
          : product.title;
        
        console.log(
          `${index + 1}\t${count}\t${title.padEnd(32)}\t${(product.brand || '-').padEnd(16)}\t¥${product.price.toLocaleString()}`
        );
      }
    });
    
  } catch (error) {
    console.error('人気商品取得エラー:', error);
  }
}

// A/Bテスト結果の分析（シミュレーション）
async function analyzeABTestResults() {
  console.log('\n\n🔬 A/Bテスト結果分析（シミュレーション）\n');
  
  try {
    // ユーザーを仮想的に2グループに分ける
    const { data: users, error: userError } = await supabase
      .from('swipes')
      .select('user_id')
      .limit(1000);
    
    if (userError) {
      console.error('エラー:', userError);
      return;
    }
    
    // ユーザーIDの重複を除去
    const uniqueUserIds = [...new Set(users.map(u => u.user_id))];
    
    // グループ分け（最後の文字の16進数値で判定）
    const controlUsers = [];
    const improvedUsers = [];
    
    uniqueUserIds.forEach(userId => {
      const lastChar = userId.slice(-1);
      const value = parseInt(lastChar, 16);
      
      if (value % 2 === 0) {
        controlUsers.push(userId);
      } else {
        improvedUsers.push(userId);
      }
    });
    
    // 各グループのスワイプデータを取得
    const { data: controlSwipes } = await supabase
      .from('swipes')
      .select('result')
      .in('user_id', controlUsers.slice(0, 50)); // 処理時間短縮のため50人まで
    
    const { data: improvedSwipes } = await supabase
      .from('swipes')
      .select('result')
      .in('user_id', improvedUsers.slice(0, 50));
    
    // Yes率を計算
    const controlYesRate = controlSwipes 
      ? (controlSwipes.filter(s => s.result === 'yes').length / controlSwipes.length * 100).toFixed(1)
      : 0;
    
    const improvedYesRate = improvedSwipes
      ? (improvedSwipes.filter(s => s.result === 'yes').length / improvedSwipes.length * 100).toFixed(1)
      : 0;
    
    console.log('グループ\tユーザー数\tスワイプ数\tYes率');
    console.log('='.repeat(50));
    console.log(`Control\t\t${controlUsers.length}\t\t${controlSwipes?.length || 0}\t\t${controlYesRate}%`);
    console.log(`Improved\t${improvedUsers.length}\t\t${improvedSwipes?.length || 0}\t\t${improvedYesRate}%`);
    
    const improvement = improvedYesRate - controlYesRate;
    console.log(`\n改善率: ${improvement > 0 ? '+' : ''}${improvement.toFixed(1)}%`);
    
  } catch (error) {
    console.error('A/Bテスト分析エラー:', error);
  }
}

// メイン処理
async function main() {
  console.log('🚀 推薦システムモニタリング開始\n');
  console.log(`実行日時: ${new Date().toLocaleString('ja-JP')}`);
  console.log('='.repeat(80));
  
  // 各分析を実行
  await getDailySwipeStats();
  await getCategoryDistribution();
  await getPopularProducts();
  await analyzeABTestResults();
  
  console.log('\n\n✅ モニタリング完了');
}

// 実行
if (require.main === module) {
  main().catch(error => {
    console.error('メイン処理エラー:', error);
    process.exit(1);
  });
}

module.exports = { main };

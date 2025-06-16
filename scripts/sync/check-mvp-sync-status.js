#!/usr/bin/env node
/**
 * MVPブランド同期の詳細状況を確認
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// 環境変数の読み込み
dotenv.config({ path: path.join(__dirname, '../../.env') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase環境変数が設定されていません');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// MVPブランド定義
const MVP_BRANDS = [
  { name: 'UNIQLO', target: 50, priority: 1 },
  { name: 'GU', target: 50, priority: 1 },
  { name: 'coca', target: 30, priority: 2 },
  { name: 'pierrot', target: 30, priority: 2 },
  { name: 'URBAN RESEARCH', target: 20, priority: 3 }
];

async function checkMVPSync() {
  console.log('\n🎯 MVPブランド同期状況の詳細確認\n');
  console.log('='.repeat(80));

  try {
    // 各MVPブランドの状況を確認
    console.log('\n📊 ブランド別の詳細状況:\n');
    console.log('ブランド名'.padEnd(20) + '優先度'.padEnd(8) + '現在数'.padEnd(8) + '目標数'.padEnd(8) + '達成率'.padEnd(10) + 'ステータス');
    console.log('-'.repeat(80));

    let totalCurrent = 0;
    let totalTarget = 0;

    for (const mvpBrand of MVP_BRANDS) {
      // ブランド名の各種パターンで検索
      const brandPatterns = [mvpBrand.name];
      if (mvpBrand.name === 'UNIQLO') brandPatterns.push('ユニクロ');
      if (mvpBrand.name === 'GU') brandPatterns.push('ジーユー');
      if (mvpBrand.name === 'URBAN RESEARCH') brandPatterns.push('アーバンリサーチ');

      let count = 0;
      for (const pattern of brandPatterns) {
        const { data } = await supabase
          .from('external_products')
          .select('id', { count: 'exact' })
          .eq('brand', pattern)
          .eq('is_active', true);
        
        count += data?.length || 0;
      }

      const achievementRate = (count / mvpBrand.target * 100).toFixed(0) + '%';
      const status = count >= mvpBrand.target ? '✅ 完了' : count > 0 ? '🔄 進行中' : '❌ 未同期';

      console.log(
        mvpBrand.name.padEnd(20) +
        `${mvpBrand.priority}`.padEnd(8) +
        `${count}`.padEnd(8) +
        `${mvpBrand.target}`.padEnd(8) +
        achievementRate.padEnd(10) +
        status
      );

      totalCurrent += count;
      totalTarget += mvpBrand.target;
    }

    console.log('-'.repeat(80));
    console.log(
      '合計'.padEnd(20) +
      ''.padEnd(8) +
      `${totalCurrent}`.padEnd(8) +
      `${totalTarget}`.padEnd(8) +
      `${(totalCurrent / totalTarget * 100).toFixed(0)}%`.padEnd(10) +
      (totalCurrent >= totalTarget ? '✅' : '🔄')
    );

    // 最新の同期時刻を確認
    console.log('\n📅 同期履歴:\n');
    const { data: syncHistory } = await supabase
      .from('external_products')
      .select('brand, last_synced')
      .in('brand', MVP_BRANDS.map(b => b.name))
      .order('last_synced', { ascending: false })
      .limit(5);

    if (syncHistory && syncHistory.length > 0) {
      console.log('ブランド'.padEnd(25) + '最終同期日時');
      console.log('-'.repeat(60));
      syncHistory.forEach(item => {
        console.log(
          item.brand.padEnd(25) +
          new Date(item.last_synced).toLocaleString('ja-JP')
        );
      });
    }

    // 推奨アクション
    console.log('\n💡 推奨アクション:\n');
    
    const incompleteB = MVP_BRANDS.filter(async (brand) => {
      const { count } = await supabase
        .from('external_products')
        .select('*', { count: 'exact', head: true })
        .eq('brand', brand.name)
        .eq('is_active', true);
      return (count || 0) < brand.target;
    });

    if (totalCurrent < totalTarget) {
      console.log('同期が完了していません。以下のコマンドを実行してください：\n');
      console.log('  node scripts/sync-mvp-brands.js\n');
      console.log('特に以下のブランドが不足しています：');
      console.log('  - UNIQLO（残り48件）');
      console.log('  - GU（残り50件）');
    } else {
      console.log('✅ すべてのMVPブランドの同期が完了しています！');
      console.log('\n次のステップ：');
      console.log('  1. アプリでスワイプ機能を確認');
      console.log('  2. GitHub Actionsの自動同期を有効化');
    }

  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
  }
}

// 実行
checkMVPSync().then(() => {
  console.log('\n✨ 確認完了\n');
}).catch(error => {
  console.error('❌ 予期しないエラー:', error);
  process.exit(1);
});
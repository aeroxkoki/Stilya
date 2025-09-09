#!/usr/bin/env node

/**
 * GitHub Actions 日次パッチ実行状況モニター
 * 最新の実行状況と次回実行予定を表示
 */

const https = require('https');

function fetchWorkflowRuns() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: '/repos/aeroxkoki/Stilya/actions/workflows/171534460/runs?per_page=10',
      method: 'GET',
      headers: {
        'User-Agent': 'Stilya-Monitor',
        'Accept': 'application/vnd.github.v3+json'
      }
    };

    https.get(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function monitorDailyPatch() {
  console.log('=====================================');
  console.log('📊 GitHub Actions 日次パッチモニター');
  console.log('=====================================\n');

  try {
    const data = await fetchWorkflowRuns();
    const runs = data.workflow_runs || [];
    
    // 現在時刻と次回実行予定
    const now = new Date();
    const nextRun = new Date();
    nextRun.setUTCHours(17, 0, 0, 0); // 17:00 UTC
    if (nextRun < now) {
      nextRun.setDate(nextRun.getDate() + 1);
    }
    
    console.log(`現在時刻: ${now.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })} (JST)`);
    console.log(`次回実行予定: ${nextRun.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })} (JST)\n`);
    
    // 最新の実行状況
    if (runs.length > 0) {
      const latest = runs[0];
      const latestDate = new Date(latest.created_at);
      const hoursAgo = Math.floor((now - latestDate) / (1000 * 60 * 60));
      
      console.log('📈 最新の実行:');
      console.log(`  実行番号: #${latest.run_number}`);
      console.log(`  状態: ${latest.conclusion === 'success' ? '✅ 成功' : latest.conclusion === 'failure' ? '❌ 失敗' : '⏳ 実行中'}`);
      console.log(`  実行日時: ${latestDate.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}`);
      console.log(`  経過時間: ${hoursAgo}時間前`);
      console.log(`  トリガー: ${latest.event === 'schedule' ? '定期実行' : latest.event}`);
      console.log(`  詳細URL: ${latest.html_url}\n`);
      
      // 実行履歴
      console.log('📋 直近の実行履歴:');
      console.log('─'.repeat(50));
      
      runs.slice(0, 5).forEach(run => {
        const runDate = new Date(run.created_at);
        const icon = run.conclusion === 'success' ? '✅' : 
                    run.conclusion === 'failure' ? '❌' : '⏳';
        console.log(`${icon} #${run.run_number} - ${runDate.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })} - ${run.event}`);
      });
      
      // 統計
      const successCount = runs.filter(r => r.conclusion === 'success').length;
      const failureCount = runs.filter(r => r.conclusion === 'failure').length;
      
      console.log('\n📊 成功率（直近10回）:');
      console.log(`  成功: ${successCount}回`);
      console.log(`  失敗: ${failureCount}回`);
      console.log(`  成功率: ${((successCount / (successCount + failureCount)) * 100).toFixed(1)}%`);
      
      // 推奨事項
      console.log('\n💡 推奨事項:');
      if (hoursAgo > 24) {
        console.log('  ⚠️ 24時間以上実行されていません。手動実行を検討してください。');
      } else if (latest.conclusion === 'failure') {
        console.log('  ⚠️ 最新の実行が失敗しています。ログを確認してください。');
      } else {
        console.log('  ✅ 日次パッチは正常に動作しています。');
      }
      
    } else {
      console.log('❌ 実行履歴が取得できませんでした。');
    }
    
    console.log('\n🔗 関連リンク:');
    console.log('  ワークフロー: https://github.com/aeroxkoki/Stilya/actions/workflows/daily-patch.yml');
    console.log('  手動実行: 上記URLから「Run workflow」ボタンをクリック');
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
  
  console.log('\n=====================================');
}

// 実行
if (require.main === module) {
  monitorDailyPatch();
}

module.exports = { monitorDailyPatch };

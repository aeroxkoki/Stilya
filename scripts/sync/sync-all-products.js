#!/usr/bin/env node
/**
 * 全商品データ同期スクリプト
 * 楽天APIとバリューコマースAPI（準備中）からデータを取得
 */

const path = require('path');
const dotenv = require('dotenv');

// 環境変数の読み込み
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function syncRakutenProducts() {
  console.log('📦 楽天商品の同期を開始...');
  try {
    // 楽天同期スクリプトを実行
    const { main } = require('./sync-rakuten-products');
    await main();
    console.log('✅ 楽天商品の同期完了');
  } catch (error) {
    console.error('❌ 楽天商品の同期エラー:', error);
    throw error;
  }
}

async function syncValueCommerceProducts() {
  const vcEnabled = process.env.VALUECOMMERCE_ENABLED === 'true';
  
  if (!vcEnabled) {
    console.log('⏭️ バリューコマース同期はスキップされました（無効）');
    return;
  }
  
  console.log('📦 バリューコマース商品の同期を開始...');
  try {
    // バリューコマース同期スクリプトを実行
    const { main } = require('./sync-valuecommerce-products');
    await main();
    console.log('✅ バリューコマース商品の同期完了');
  } catch (error) {
    console.error('❌ バリューコマース商品の同期エラー:', error);
    throw error;
  }
}

async function syncAllProducts() {
  console.log('🔄 全商品データ同期開始...');
  console.log(`📅 実行時刻: ${new Date().toLocaleString('ja-JP')}\n`);

  const startTime = Date.now();
  let rakutenSuccess = false;
  let valueCommerceSuccess = false;

  try {
    // 1. 楽天商品の同期
    console.log('===== 1/2: 楽天API =====');
    try {
      await syncRakutenProducts();
      rakutenSuccess = true;
    } catch (error) {
      console.error('楽天同期エラー:', error.message);
    }

    console.log('\n');

    // 2. バリューコマース商品の同期（環境変数で制御）
    console.log('===== 2/2: バリューコマースAPI =====');
    try {
      await syncValueCommerceProducts();
      valueCommerceSuccess = true;
    } catch (error) {
      console.error('バリューコマース同期エラー:', error.message);
    }

    console.log('\n=====================================');
    console.log('📊 同期結果サマリー');
    console.log('=====================================');
    console.log(`楽天API: ${rakutenSuccess ? '✅ 成功' : '❌ 失敗'}`);
    console.log(`バリューコマースAPI: ${valueCommerceSuccess ? '✅ 成功' : '⏭️ スキップ'}`);
    console.log(`実行時間: ${((Date.now() - startTime) / 1000).toFixed(2)}秒`);
    console.log('\n✅ 全同期処理が完了しました！');

  } catch (error) {
    console.error('\n❌ 同期処理中に予期しないエラーが発生しました:', error);
    process.exit(1);
  }
}

// エラーハンドリング
process.on('unhandledRejection', (error) => {
  console.error('未処理のエラー:', error);
  process.exit(1);
});

// メイン実行
if (require.main === module) {
  syncAllProducts().catch(error => {
    console.error('致命的なエラー:', error);
    process.exit(1);
  });
}

module.exports = { syncAllProducts };

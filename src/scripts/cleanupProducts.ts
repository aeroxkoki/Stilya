/**
 * 画像URLが欠落している商品をクリーンアップして再取得するスクリプト
 */

import { fixMissingImageUrls } from '../utils/fixImageUrls';

console.log('🔧 商品データのクリーンアップと再取得を開始します...');

async function runCleanup() {
  try {
    await fixMissingImageUrls();
    console.log('✅ クリーンアップが完了しました');
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
  }
}

// 実行
runCleanup();

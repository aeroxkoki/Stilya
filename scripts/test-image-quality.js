#!/usr/bin/env node
/**
 * 画像品質修正のテストスクリプト
 * 
 * 使用方法:
 * node scripts/test-image-quality.js
 */

const { diagnoseImageQuality, generateOptimalRakutenImageUrl, testImageUrlConversion } = require('../src/utils/imageQualityFix');

console.log('=== Stilya 画像品質修正テスト ===\n');

// 楽天画像URLの変換テスト
console.log('1. 楽天画像URL変換テスト');
console.log('==========================');
testImageUrlConversion();

console.log('\n2. 実際の画像品質診断');
console.log('==========================');
console.log('※ このテストは実際のSupabaseデータベースに接続します');
console.log('※ アプリ起動後に実行してください\n');

// 手動テストケース
const testCases = [
  {
    name: '低解像度サムネイルURL',
    url: 'https://thumbnail.image.rakuten.co.jp/@0_mall/example/cabinet/128x128/item.jpg?_ex=128x128',
    expected: 'https://image.rakuten.co.jp/@0_mall/example/cabinet/item.jpg'
  },
  {
    name: '中解像度URL',
    url: 'https://image.rakuten.co.jp/@0_mall/example/cabinet/pc/item.jpg?_ex=640x640',
    expected: 'https://image.rakuten.co.jp/@0_mall/example/cabinet/item.jpg'
  },
  {
    name: 'パス内サイズ指定',
    url: 'https://thumbnail.image.rakuten.co.jp/@0_mall/example/cabinet/64x64/item.jpg',
    expected: 'https://image.rakuten.co.jp/@0_mall/example/cabinet/item.jpg'
  }
];

console.log('3. 個別テストケース');
console.log('====================');
testCases.forEach((testCase, index) => {
  console.log(`\nケース ${index + 1}: ${testCase.name}`);
  console.log(`入力: ${testCase.url}`);
  
  const result = generateOptimalRakutenImageUrl(testCase.url);
  console.log(`出力: ${result}`);
  console.log(`期待: ${testCase.expected}`);
  console.log(`結果: ${result === testCase.expected ? '✅ 成功' : '❌ 失敗'}`);
});

console.log('\n=== テスト完了 ===');
console.log('\n次のステップ:');
console.log('1. アプリを起動して実機で画像品質を確認');
console.log('2. おすすめ画面とスワイプ画面の両方で高画質画像が表示されることを確認');
console.log('3. 画像読み込みエラーが発生しても低画質に戻らないことを確認');

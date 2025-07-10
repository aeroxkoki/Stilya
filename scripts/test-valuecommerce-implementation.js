#!/usr/bin/env node
/**
 * バリューコマースAPI実装のテストスクリプト
 * 環境変数と実装の確認用
 */

const path = require('path');
const dotenv = require('dotenv');

// 環境変数の読み込み
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('🧪 バリューコマースAPI実装テスト\n');

// 1. 環境変数の確認
console.log('===== 環境変数チェック =====');
const vcToken = process.env.VALUECOMMERCE_TOKEN;
const vcEnabled = process.env.VALUECOMMERCE_ENABLED;

console.log(`VALUECOMMERCE_TOKEN: ${vcToken ? '✅ 設定済み' : '❌ 未設定'}`);
console.log(`VALUECOMMERCE_ENABLED: ${vcEnabled || 'false'} (${vcEnabled === 'true' ? '有効' : '無効'})`);

// 2. 必要なファイルの存在確認
console.log('\n===== ファイル存在チェック =====');
const requiredFiles = [
  'scripts/sync/sync-valuecommerce-products.js',
  'scripts/sync/enhanced-tag-extractor.js',
  'scripts/sync/sync-all-products.js',
  'docs/VALUECOMMERCE_API_GUIDE.md'
];

const fs = require('fs');
requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  const exists = fs.existsSync(filePath);
  console.log(`${file}: ${exists ? '✅' : '❌'}`);
});

// 3. TypeScript型定義の確認
console.log('\n===== TypeScript型定義チェック =====');
try {
  const productTypePath = path.join(__dirname, '../src/types/product.ts');
  const content = fs.readFileSync(productTypePath, 'utf8');
  const hasAdTag = content.includes('adTag?:');
  const hasMetadata = content.includes('metadata?:');
  
  console.log(`Product.adTag: ${hasAdTag ? '✅' : '❌'}`);
  console.log(`Product.metadata: ${hasMetadata ? '✅' : '❌'}`);
} catch (error) {
  console.error('❌ TypeScript型定義の確認に失敗:', error.message);
}

// 4. 実装状態の確認
console.log('\n===== 実装状態 =====');
if (vcEnabled === 'true') {
  console.log('⚠️ バリューコマースAPIが有効になっています！');
  console.log('実際に使用する前に、以下を確認してください：');
  console.log('1. Supabaseテーブルにmetadataカラムが追加されているか');
  console.log('2. APIトークンが正しく設定されているか');
  console.log('3. adTag実行の実装が完了しているか');
} else {
  console.log('✅ バリューコマースAPIは無効状態です（安全）');
  console.log('有効にするには、.envファイルで VALUECOMMERCE_ENABLED=true を設定してください');
}

console.log('\n===== テスト完了 =====');
console.log('詳細な使用方法は docs/VALUECOMMERCE_API_GUIDE.md を参照してください');

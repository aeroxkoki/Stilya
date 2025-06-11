#!/usr/bin/env node
/**
 * 日次処理のヘルスチェックスクリプト
 * GitHub Actions環境と同じ条件でテスト実行
 */

const fs = require('fs');
const path = require('path');

console.log('🏥 日次処理ヘルスチェック\n');
console.log('='.repeat(60));

// 1. 環境変数のチェック
console.log('\n📋 環境変数チェック');
const requiredEnvVars = [
  'EXPO_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_KEY',
  'RAKUTEN_APP_ID',
  'RAKUTEN_AFFILIATE_ID'
];

const envStatus = {};
requiredEnvVars.forEach(varName => {
  const isSet = !!process.env[varName];
  envStatus[varName] = isSet;
  console.log(`  ${isSet ? '✅' : '❌'} ${varName}: ${isSet ? '設定済み' : '未設定'}`);
});

// 2. 必要なファイルの存在チェック
console.log('\n📁 ファイル存在チェック');
const requiredFiles = [
  'scripts/sync-rakuten-products-ci.js',
  'scripts/enhanced-tag-extractor.js',
  '.github/workflows/daily-product-sync.yml'
];

const fileStatus = {};
requiredFiles.forEach(filePath => {
  const fullPath = path.join(__dirname, '..', filePath);
  const exists = fs.existsSync(fullPath);
  fileStatus[filePath] = exists;
  console.log(`  ${exists ? '✅' : '❌'} ${filePath}`);
});

// 3. モジュールの読み込みテスト
console.log('\n📦 モジュール読み込みテスト');
const modules = [
  '@supabase/supabase-js',
  'axios',
  'dotenv'
];

const moduleStatus = {};
modules.forEach(moduleName => {
  try {
    require.resolve(moduleName);
    moduleStatus[moduleName] = true;
    console.log(`  ✅ ${moduleName}`);
  } catch (error) {
    moduleStatus[moduleName] = false;
    console.log(`  ❌ ${moduleName}: ${error.message}`);
  }
});

// 4. enhanced-tag-extractorモジュールのテスト
console.log('\n🏷️ タグ抽出モジュールテスト');
try {
  const { extractEnhancedTags } = require('./enhanced-tag-extractor');
  const testProduct = {
    itemName: 'テストワンピース',
    itemPrice: 3000,
    shopName: 'TestShop'
  };
  const tags = extractEnhancedTags(testProduct);
  console.log(`  ✅ タグ抽出成功: ${tags.length}個のタグを生成`);
  console.log(`  生成されたタグ: ${tags.slice(0, 5).join(', ')}...`);
} catch (error) {
  console.log(`  ❌ タグ抽出エラー: ${error.message}`);
}

// 5. Supabase接続テスト（環境変数が設定されている場合のみ）
console.log('\n🔌 Supabase接続テスト');
if (envStatus['EXPO_PUBLIC_SUPABASE_URL'] && envStatus['SUPABASE_SERVICE_KEY']) {
  const { createClient } = require('@supabase/supabase-js');
  try {
    const supabase = createClient(
      process.env.EXPO_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );
    
    const { count, error } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.log(`  ❌ データベース接続エラー: ${error.message}`);
    } else {
      console.log(`  ✅ データベース接続成功: ${count}件の商品`);
    }
  } catch (error) {
    console.log(`  ❌ 接続エラー: ${error.message}`);
  }
} else {
  console.log('  ⚠️  環境変数が不足しているためスキップ');
}

// 6. 楽天API接続テスト（簡易版）
console.log('\n🛍️ 楽天API接続テスト');
if (envStatus['RAKUTEN_APP_ID'] && envStatus['RAKUTEN_AFFILIATE_ID']) {
  const axios = require('axios');
  try {
    const response = await axios.get('https://app.rakuten.co.jp/services/api/IchibaItem/Search/20170706', {
      params: {
        applicationId: process.env.RAKUTEN_APP_ID,
        affiliateId: process.env.RAKUTEN_AFFILIATE_ID,
        genreId: '100371',
        hits: 1,
        page: 1,
        format: 'json'
      }
    });
    
    if (response.data && response.data.Items) {
      console.log(`  ✅ 楽天API接続成功: ${response.data.Items.length}件取得`);
    }
  } catch (error) {
    if (error.response?.status === 429) {
      console.log('  ⚠️  楽天APIレート制限に到達');
    } else {
      console.log(`  ❌ 楽天APIエラー: ${error.message}`);
    }
  }
} else {
  console.log('  ⚠️  環境変数が不足しているためスキップ');
}

// 7. 結果サマリー
console.log('\n' + '='.repeat(60));
console.log('📊 チェック結果サマリー\n');

const allEnvVarsSet = Object.values(envStatus).every(v => v);
const allFilesExist = Object.values(fileStatus).every(v => v);
const allModulesAvailable = Object.values(moduleStatus).every(v => v);

console.log(`環境変数: ${allEnvVarsSet ? '✅ 全て設定済み' : '❌ 一部未設定'}`);
console.log(`ファイル: ${allFilesExist ? '✅ 全て存在' : '❌ 一部不足'}`);
console.log(`モジュール: ${allModulesAvailable ? '✅ 全て利用可能' : '❌ 一部不足'}`);

if (allEnvVarsSet && allFilesExist && allModulesAvailable) {
  console.log('\n✅ 日次処理は正常に実行可能です！');
} else {
  console.log('\n⚠️  日次処理の実行に問題がある可能性があります。');
  console.log('上記のエラーを確認して修正してください。');
}

// 8. GitHub Actions用の推奨事項
console.log('\n💡 GitHub Actions設定の推奨事項:');
console.log('1. GitHub Secretsに全ての環境変数を設定');
console.log('2. SUPABASE_SERVICE_KEYは必須（RLSバイパス用）');
console.log('3. 手動実行でテストしてから定期実行を有効化');
console.log('4. エラー時の通知設定を検討（Slack、メール等）');

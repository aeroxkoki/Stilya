#!/usr/bin/env node
/**
 * GitHub Actions環境変数チェックスクリプト
 */

console.log('=== GitHub Actions 環境変数チェック ===\n');

const requiredEnvVars = [
  'EXPO_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_KEY',
  'EXPO_PUBLIC_SUPABASE_ANON_KEY',
  'RAKUTEN_APP_ID',
  'RAKUTEN_AFFILIATE_ID'
];

const envStatus = {
  set: [],
  notSet: []
};

requiredEnvVars.forEach(varName => {
  if (process.env[varName]) {
    envStatus.set.push(varName);
    console.log(`✅ ${varName}: 設定済み`);
  } else {
    envStatus.notSet.push(varName);
    console.log(`❌ ${varName}: 未設定`);
  }
});

console.log('\n=== サマリー ===');
console.log(`✅ 設定済み: ${envStatus.set.length}個`);
console.log(`❌ 未設定: ${envStatus.notSet.length}個`);

if (envStatus.notSet.length > 0) {
  console.log('\n⚠️  以下の環境変数をGitHub Secretsに設定してください:');
  envStatus.notSet.forEach(varName => {
    console.log(`   - ${varName}`);
  });
  console.log('\n📚 設定方法:');
  console.log('   1. GitHubリポジトリの Settings > Secrets and variables > Actions');
  console.log('   2. "New repository secret" をクリック');
  console.log('   3. Name と Value を入力して保存');
  process.exit(1);
} else {
  console.log('\n✨ すべての必須環境変数が設定されています！');
  process.exit(0);
}

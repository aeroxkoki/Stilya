/**
 * Pre-EAS Build Script
 * このスクリプトはEASビルドサーバー上で実行され、ビルド環境を準備します
 */

console.log('📦 Pre-EAS Build: Preparing build environment...');

// プラットフォーム情報を取得
const os = require('os');
console.log(`Platform: ${os.platform()}, Release: ${os.release()}, Arch: ${os.arch()}`);
console.log(`Node Version: ${process.version}`);

// メモリ情報をログ
const totalMem = Math.round(os.totalmem() / (1024 * 1024 * 1024));
const freeMem = Math.round(os.freemem() / (1024 * 1024 * 1024));
console.log(`Memory: ${freeMem}GB free of ${totalMem}GB total`);

// ビルド環境の確認
console.log('Environment variables:');
const relevantVars = [
  'CI', 'EXPO_NO_CACHE', 'EAS_BUILD', 'EAS_NO_VCS', 
  'EAS_NO_METRO', 'EAS_SKIP_JAVASCRIPT_BUNDLING'
];

relevantVars.forEach(varName => {
  console.log(`  ${varName}: ${process.env[varName] || 'not set'}`);
});

// パッケージバージョンの確認
try {
  const pkg = require('../package.json');
  console.log(`Expo SDK: ${pkg.dependencies.expo}`);
  console.log(`React Native: ${pkg.dependencies['react-native']}`);
  console.log(`Metro Config: ${pkg.devDependencies['@expo/metro-config']}`);
} catch (error) {
  console.error('Failed to read package.json:', error.message);
}

// プリビルド成功のログ
console.log('✅ Pre-EAS Build: Environment prepared successfully');

/**
 * export-direct-patch.js
 * 
 * Expo/GitHub Actions互換性を改善するためのスクリプト
 * GitHub Actions環境でのExpoビルドプロセスをサポートします
 * 
 * 使用方法: node export-direct-patch.js --platform [android|ios] --dev [true|false]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// コマンドライン引数の解析
const args = process.argv.slice(2);
const options = {
  platform: 'android', // デフォルトはandroid
  dev: false           // デフォルトは本番ビルド
};

// 引数解析
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--platform' && args[i + 1]) {
    options.platform = args[i + 1];
    i++;
  } else if (args[i] === '--dev' && args[i + 1]) {
    options.dev = args[i + 1].toLowerCase() === 'true';
    i++;
  }
}

console.log(`Preparing Expo environment for ${options.platform} build...`);

// 環境変数設定
process.env.EAS_NO_METRO = 'true';
process.env.EXPO_NO_CACHE = 'true';
process.env.EAS_SKIP_JAVASCRIPT_BUNDLING = '1';
process.env.EXPO_NO_BUNDLER = '1';

// キャッシュクリア
try {
  console.log('Cleaning caches...');
  fs.rmSync(path.join(__dirname, 'node_modules', '.cache'), { recursive: true, force: true });
  fs.rmSync(path.join(process.env.HOME || process.env.USERPROFILE || '.', '.expo', 'cache'), { recursive: true, force: true });
  fs.rmSync(path.join(__dirname, '.expo'), { recursive: true, force: true });
  fs.rmSync(path.join(__dirname, '.expo-shared'), { recursive: true, force: true });
  console.log('✅ Caches cleaned');
} catch (error) {
  console.log('⚠️ Error cleaning caches:', error.message);
}

// Metro依存関係の修正
try {
  console.log('Fixing Metro dependencies...');
  execSync('node ./scripts/fix-metro-dependencies.sh', { stdio: 'inherit' });
  console.log('✅ Metro dependencies fixed');
} catch (error) {
  console.log('⚠️ Error fixing Metro dependencies:', error.message);
}

// 実際のExpoエクスポートコマンドを実行
try {
  console.log(`Running Expo export for ${options.platform}...`);
  let exportCmd = `npx expo export`;
  exportCmd += ` --platform ${options.platform}`;
  exportCmd += ` --dev ${options.dev}`;
  exportCmd += ` --dump-sourcemap`;
  exportCmd += ` --dump-assetmap`;
  exportCmd += ` --output-dir dist`;
  
  console.log(`Executing: ${exportCmd}`);
  execSync(exportCmd, { stdio: 'inherit' });
  console.log('✅ Expo export completed successfully');
} catch (error) {
  console.error('❌ Error in Expo export:', error.message);
  process.exit(1);
}

console.log('✅ Build preparation completed');

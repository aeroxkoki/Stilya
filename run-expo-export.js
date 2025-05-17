/**
 * expo export:embed実行用のヘルパースクリプト
 */
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 現在の環境変数を保存
const env = process.env;

// GitHub Actionsで実行中かどうか
const isGithubActions = env.GITHUB_ACTIONS === 'true';

// パッチを適用したかどうかのフラグファイル
const patchFlagFile = path.join(__dirname, '.metro-patched');

/**
 * メトロバンドラーの修正が必要か確認
 */
async function checkAndPrepare() {
  console.log('====== Expoビルドヘルパー ======');
  
  // パッチ済みかチェック
  if (fs.existsSync(patchFlagFile)) {
    const patchDate = fs.readFileSync(patchFlagFile, 'utf8');
    console.log(`既にパッチ適用済み (${patchDate})`);
  } else {
    console.log('パッチを適用します...');
    
    // OSに応じてスクリプトを実行
    const isWindows = process.platform === 'win32';
    const scriptCommand = isWindows ? 'cmd' : 'bash';
    const scriptArgs = isWindows 
      ? ['/c', 'fix-metro-serializer-direct.sh'] 
      : ['./fix-metro-serializer-direct.sh'];
    
    // スクリプト実行
    const result = spawnSync(scriptCommand, scriptArgs, { 
      stdio: 'inherit', 
      env: { ...env, NODE_OPTIONS: '--no-warnings' }
    });
    
    if (result.status !== 0) {
      console.error('パッチの適用に失敗しました');
      process.exit(1);
    }
    
    // パッチ適用フラグを保存
    fs.writeFileSync(patchFlagFile, new Date().toISOString());
    console.log('パッチを適用しました');
  }
}

/**
 * expo export:embedを実行
 */
async function runExpoExport() {
  const args = process.argv.slice(2);
  const defaultArgs = ['export:embed', '--eager', '--platform', 'android', '--dev', 'false'];
  const finalArgs = args.length > 0 ? args : defaultArgs;
  
  console.log(`実行: expo ${finalArgs.join(' ')}`);
  
  // グローバルJSONパッチをロード
  try {
    require('./patches/expo-monkey-patch/json-serializer-patch');
    console.log('JSONパーサーパッチをロードしました');
  } catch (e) {
    console.warn('JSONパーサーパッチのロードに失敗しました:', e);
  }
  
  // メモリ使用量を増やす
  const nodeOptions = env.NODE_OPTIONS || '';
  const updatedNodeOptions = nodeOptions.includes('max-old-space-size')
    ? nodeOptions
    : `${nodeOptions} --max-old-space-size=8192 --no-warnings`;
  
  // expo export:embedを実行
  const result = spawnSync('expo', finalArgs, {
    stdio: 'inherit',
    env: {
      ...env,
      NODE_OPTIONS: updatedNodeOptions,
      EXPO_METRO_PATCHED: 'true',
      EXPO_NO_CACHE: 'true'
    }
  });
  
  return result.status;
}

// メイン実行
async function main() {
  try {
    await checkAndPrepare();
    const exitCode = await runExpoExport();
    process.exit(exitCode);
  } catch (error) {
    console.error('エラーが発生しました:', error);
    process.exit(1);
  }
}

// スクリプト実行
main();

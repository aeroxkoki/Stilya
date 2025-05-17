/**
 * パッチ適用済みのExpoアプリを起動するスクリプト
 */
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// JSONパーサーパッチをグローバルに適用
try {
  require('./patches/expo-monkey-patch/json-serializer-patch');
  console.log('JSON.parseのモンキーパッチを適用しました');
} catch (e) {
  console.error('モンキーパッチの適用に失敗しました:', e);
}

// Expoのプロセスを起動（パッチ適用済み環境で）
const startExpo = (command, args) => {
  console.log(`実行: ${command} ${args.join(' ')}`);
  
  const child = spawn(command, args, {
    stdio: 'inherit',
    env: {
      ...process.env,
      EXPO_PATCHED: 'true'
    }
  });
  
  child.on('close', (code) => {
    console.log(`プロセスが終了しました (コード: ${code})`);
    process.exit(code);
  });
};

// コマンドライン引数の解析
const args = process.argv.slice(2);
if (args.length === 0 || args[0] === 'help') {
  console.log(`
使用方法:
  node start-patched-expo.js export:embed [オプション]
  node start-patched-expo.js start [オプション]
  `);
  process.exit(0);
}

// Expoコマンドの実行
startExpo('expo', args);

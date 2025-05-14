#!/usr/bin/env node

/**
 * Stilya - シンプル起動スクリプト (初期化バージョン)
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// 開始メッセージ
console.log('📱 Stilya 初期化スクリプト');
console.log('🔄 Node.js バージョン:', process.version);
console.log('📂 作業ディレクトリ:', process.cwd());

// node_modules が存在するか確認
const nodeModulesPath = path.join(process.cwd(), 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('⚠️ node_modules フォルダが見つかりません。依存関係をインストールします...');
  
  // 依存関係のインストール
  console.log('📦 npm install を実行しています...');
  const npmInstall = spawn('npm', ['install'], { stdio: 'inherit' });
  
  npmInstall.on('close', (code) => {
    if (code !== 0) {
      console.error('❌ 依存関係のインストールに失敗しました。');
      console.log('📋 修正方法:');
      console.log('  1. 手動で npm install を実行してください');
      console.log('  2. Node.jsをLTSバージョン(v20.x)にダウングレードすることを検討してください');
      process.exit(1);
    } else {
      console.log('✅ 依存関係のインストールが完了しました。');
      console.log('🚀 アプリを起動します...');
      startExpo();
    }
  });
} else {
  // node_modules が存在する場合は直接起動
  startExpo();
}

// Expoを起動する関数
function startExpo() {
  const expoStart = spawn('npx', ['expo', 'start', '--no-dev'], { 
    stdio: 'inherit',
    env: {
      ...process.env,
      EXPO_NO_TYPESCRIPT_TRANSPILE: "true"
    }
  });
  
  expoStart.on('close', (code) => {
    if (code !== 0) {
      console.error('❌ Expoの起動に失敗しました。');
      
      // 代替の起動方法を試す
      console.log('🔄 代替方法で起動します...');
      const altStart = spawn('npx', ['expo-cli', 'start', '--no-dev'], { 
        stdio: 'inherit',
        env: {
          ...process.env,
          EXPO_NO_TYPESCRIPT_TRANSPILE: "true"
        }
      });
      
      altStart.on('close', (altCode) => {
        if (altCode !== 0) {
          console.error('❌ 代替方法でも起動に失敗しました。');
          console.log('📋 修正方法:');
          console.log('  1. Node.jsをLTSバージョン(v20.x)にダウングレードしてください');
          console.log('  2. npm install expo expo-cli を手動で実行してください');
          process.exit(1);
        }
      });
    }
  });
}

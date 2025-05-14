#!/usr/bin/env node

/**
 * Stilya カスタム起動ユーティリティ
 * 
 * このスクリプトは、Node.js v23の新しいバージョンでTypeScriptパースに問題が
 * あるため、Expoアプリを安定的に起動するための回避策です。
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// 現在の作業ディレクトリを確認
const cwd = process.cwd();
console.log(`📍 Working directory: ${cwd}`);

// Node.jsバージョンを確認
const nodeVersion = process.version;
console.log(`🔍 Node.js Version: ${nodeVersion}`);

// 環境変数を設定
process.env.EXPO_NO_TYPESCRIPT_TRANSPILE = "true";
process.env.NODE_OPTIONS = "--no-warnings";

console.log(`\n🚀 Starting Stilya app in simplified mode...\n`);

// アプリを起動する関数
function startApp() {
  try {
    // ローカルの node_modules から expo を実行
    const command = 'node ./node_modules/expo/bin/cli.js start --clear --no-dev';
    console.log(`⚙️  Executing: ${command}`);
    
    execSync(command, { 
      stdio: 'inherit',
      env: {
        ...process.env,
        EXPO_NO_TYPESCRIPT_TRANSPILE: "true",
        NODE_OPTIONS: "--no-warnings"
      }
    });
  } catch (error) {
    console.error(`\n❌ Failed to start with primary method: ${error.message}`);
    console.log('\n🔄 Trying alternate method...');
    
    try {
      // npx を使用する代替手段
      const altCommand = 'npx expo start --clear --no-dev';
      console.log(`⚙️  Executing: ${altCommand}`);
      
      execSync(altCommand, { 
        stdio: 'inherit',
        env: {
          ...process.env,
          EXPO_NO_TYPESCRIPT_TRANSPILE: "true",
          NODE_OPTIONS: "--no-warnings"
        }
      });
    } catch (err) {
      console.error(`\n❌ Both methods failed. Error: ${err.message}`);
      console.log('\n📋 Troubleshooting suggestions:');
      console.log('  1. Try downgrading Node.js to an LTS version (v20.x)');
      console.log('  2. Clear node_modules and reinstall dependencies');
      console.log('  3. Check if .env file exists and contains valid settings');
      process.exit(1);
    }
  }
}

// アプリを起動
startApp();

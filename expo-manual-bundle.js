#!/usr/bin/env node
/**
 * Expoエクスポート問題を回避するための独自実装スクリプト
 * 
 * このスクリプトは通常のexpoコマンドの代わりに使用します。
 * export:embedコマンドを実行する際のシリアライズエラーを回避し、
 * 手動でバンドルを取得してJSONに変換します。
 */

const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

// 設定
const BUNDLE_SAVE_PATH = path.join(process.cwd(), 'dist');
const BUNDLE_FILE = path.join(BUNDLE_SAVE_PATH, 'bundle.js');
const JSON_BUNDLE_FILE = path.join(BUNDLE_SAVE_PATH, 'bundle.json');

// ディレクトリを作成
if (!fs.existsSync(BUNDLE_SAVE_PATH)) {
  fs.mkdirSync(BUNDLE_SAVE_PATH, { recursive: true });
}

/**
 * Expoサーバーを起動する関数
 */
async function startExpoServer() {
  console.log('Expoサーバーを起動中...');
  
  // メトロサーバーを起動
  const metro = spawn('expo', ['start', '--no-dev', '--minify', '--port', '19000'], {
    stdio: 'pipe', // 出力をキャプチャするためpipeに設定
    env: { ...process.env }
  });
  
  // 出力を処理
  let output = '';
  metro.stdout.on('data', (data) => {
    const chunk = data.toString();
    output += chunk;
    process.stdout.write(chunk);
    
    // サーバーが起動したかチェック
    if (chunk.includes('Metro waiting on')) {
      console.log('メトロサーバーが起動しました。');
    }
  });
  
  metro.stderr.on('data', (data) => {
    process.stderr.write(data.toString());
  });
  
  // サーバーが起動するまで待機
  await new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 10000); // 10秒待機
  });
  
  return metro;
}

/**
 * メトロサーバーからバンドルを取得する関数
 */
async function fetchBundle(platform = 'android') {
  console.log(`${platform}用のバンドルを取得中...`);
  
  // バンドルURLを構築
  const bundleUrl = `http://localhost:19000/index.bundle?platform=${platform}&dev=false&minify=true`;
  
  // バンドルを取得
  const bundle = await new Promise((resolve, reject) => {
    http.get(bundleUrl, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve(data);
      });
      res.on('error', (err) => {
        reject(err);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
  
  console.log(`バンドルの取得が完了しました（サイズ: ${bundle.length} バイト）`);
  
  // バンドルをファイルに保存
  fs.writeFileSync(BUNDLE_FILE, bundle);
  console.log(`バンドルを保存しました: ${BUNDLE_FILE}`);
  
  return bundle;
}

/**
 * バンドルをJSONに変換する関数
 */
function convertBundleToJson(bundle) {
  console.log('バンドルをJSON形式に変換中...');
  
  // JSON形式に変換
  const jsonBundle = {
    code: bundle,
    map: null,
    dependencies: []
  };
  
  // JSONを保存
  fs.writeFileSync(JSON_BUNDLE_FILE, JSON.stringify(jsonBundle));
  console.log(`JSON形式のバンドルを保存しました: ${JSON_BUNDLE_FILE}`);
  
  return jsonBundle;
}

/**
 * EASビルドを実行する関数
 */
function runEasBuild(profile = 'development') {
  console.log(`EASビルドを実行中... (プロファイル: ${profile})`);
  
  // バンドルファイルがEASビルドで使用されるようにする
  const easProcess = spawn('npx', ['eas-cli', 'build', '--profile', profile, '--non-interactive'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      // カスタム環境変数を設定して、EASビルドに事前生成されたバンドルを使用するよう指示
      EAS_BUILD_BUNDLE_PATH: JSON_BUNDLE_FILE
    }
  });
  
  return new Promise((resolve, reject) => {
    easProcess.on('close', (code) => {
      if (code === 0) {
        console.log('EASビルドが成功しました！');
        resolve();
      } else {
        console.error(`EASビルドが失敗しました (コード: ${code})`);
        reject(new Error(`EASビルドエラー（コード: ${code}）`));
      }
    });
  });
}

/**
 * メインの実行関数
 */
async function main() {
  console.log('==== Expoエクスポート問題回避スクリプト ====');
  
  try {
    // 1. メトロサーバーを起動
    const metroServer = await startExpoServer();
    
    // 2. バンドルを取得
    const bundle = await fetchBundle('android');
    
    // 3. バンドルをJSONに変換
    const jsonBundle = convertBundleToJson(bundle);
    
    // 4. メトロサーバーを終了
    metroServer.kill();
    
    console.log('手動バンドル処理が完了しました！');
    console.log(`JSONバンドルファイル: ${JSON_BUNDLE_FILE}`);
    
    // 5. EASビルドを実行する場合（オプション）
    if (process.argv.includes('--eas-build')) {
      const profile = process.argv.find(arg => arg.startsWith('--profile='))?.split('=')[1] || 'development';
      await runEasBuild(profile);
    } else {
      console.log('\nビルドするには以下のコマンドを実行:');
      console.log('  node expo-manual-bundle.js --eas-build [--profile=<profile>]');
    }
    
  } catch (err) {
    console.error('エラーが発生しました:', err);
    process.exit(1);
  }
}

// スクリプトを実行
main();

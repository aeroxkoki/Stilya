#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

/**
 * スクリプトファイル内の環境変数設定パスを修正するユーティリティ
 */
async function fixEnvPaths() {
  console.log('=== dotenvパス修正ユーティリティ ===');
  
  // scriptsディレクトリ内のすべてのJSファイルを取得
  const scriptDir = path.join(__dirname);
  
  // 修正対象の検索パターン
  const searchPattern = `dotenv.config({ path: path.join(__dirname, '..', '.env') });`;
  const replacement = `dotenv.config({ path: path.join(__dirname, '../../.env') });`;
  
  // 再帰的にディレクトリを検索
  await processDirectory(scriptDir, searchPattern, replacement);
  
  console.log('=== 処理完了 ===');
}

/**
 * ディレクトリを再帰的に処理
 */
async function processDirectory(dir, searchPattern, replacement) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      await processDirectory(fullPath, searchPattern, replacement);
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      await processFile(fullPath, searchPattern, replacement);
    }
  }
}

/**
 * 個別ファイルを処理
 */
async function processFile(filePath, searchPattern, replacement) {
  try {
    // 自分自身（このスクリプト）は処理しない
    if (filePath === __filename) {
      return;
    }
    
    const content = await readFileAsync(filePath, 'utf8');
    
    // 検索パターンがあるかチェック
    if (content.includes(searchPattern)) {
      // 置換
      const updatedContent = content.replace(searchPattern, replacement);
      
      // 変更があれば保存
      if (content !== updatedContent) {
        await writeFileAsync(filePath, updatedContent);
        console.log(`✅ 修正しました: ${path.relative(__dirname, filePath)}`);
      }
    }
  } catch (error) {
    console.error(`❌ エラー (${path.relative(__dirname, filePath)}):`, error.message);
  }
}

// スクリプト実行
fixEnvPaths().catch(console.error);

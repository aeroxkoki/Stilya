/**
 * Expoの内部コードを直接パッチするスクリプト
 * Expo CLIのMetroBundlerDevServerのbundle処理を修正
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 色付きログ出力用関数
const log = {
  info: (msg) => console.log(`\x1b[36m[INFO]\x1b[0m ${msg}`),
  warn: (msg) => console.log(`\x1b[33m[WARN]\x1b[0m ${msg}`),
  error: (msg) => console.log(`\x1b[31m[ERROR]\x1b[0m ${msg}`),
  success: (msg) => console.log(`\x1b[32m[SUCCESS]\x1b[0m ${msg}`)
};

// Expoのnode_modules内のパスを見つける
const findExpoCliFile = (filename) => {
  const basePaths = [
    path.join(process.cwd(), 'node_modules', '@expo', 'cli'),
    path.join(process.cwd(), 'node_modules', '@expo', 'cli', 'build'),
    path.join(process.cwd(), 'node_modules', '@expo', 'cli', 'src'),
    path.join(process.cwd(), 'node_modules', '@expo', 'cli', 'build', 'src')
  ];

  // ファイルを探す
  for (const basePath of basePaths) {
    try {
      const files = execSync(`find "${basePath}" -name "${filename}" -type f 2>/dev/null`, { encoding: 'utf8' });
      const filesList = files.trim().split('\n').filter(Boolean);
      if (filesList.length > 0) {
        return filesList[0];
      }
    } catch (e) {
      // 検索エラーは無視
    }
  }

  // より広い範囲で検索
  try {
    log.info(`ファイルを拡張検索中: ${filename}`);
    const files = execSync(`find "node_modules" -path "*/@expo/cli*" -name "${filename}" -type f 2>/dev/null`, { encoding: 'utf8' });
    const filesList = files.trim().split('\n').filter(Boolean);
    if (filesList.length > 0) {
      return filesList[0];
    }
  } catch (e) {
    // 検索エラーは無視
  }

  return null;
};

// メソッドのパッチ用関数
const patchMethodInFile = (filePath, methodName, patchFunction) => {
  if (!fs.existsSync(filePath)) {
    log.error(`ファイルが見つかりません: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  
  // バックアップ作成
  const backupPath = `${filePath}.backup`;
  if (!fs.existsSync(backupPath)) {
    fs.writeFileSync(backupPath, content);
    log.info(`バックアップ作成: ${backupPath}`);
  }

  // メソッドを見つけてパッチ
  const patchedContent = patchFunction(content, methodName);
  
  if (patchedContent === content) {
    log.warn(`メソッド ${methodName} が見つからないか、すでにパッチされています`);
    return false;
  }

  fs.writeFileSync(filePath, patchedContent);
  log.success(`メソッド ${methodName} をパッチしました`);
  return true;
};

// パッチ関数
const patchBundleDirectAsync = (content) => {
  // _bundleDirectAsync メソッドを探す
  const methodRegex = /async\s+_bundleDirectAsync\s*\([^)]*\)\s*{[^}]*}/gs;
  const methodMatch = content.match(methodRegex);
  
  if (!methodMatch) {
    log.error('_bundleDirectAsync メソッドが見つかりません');
    return content;
  }

  const originalMethod = methodMatch[0];
  
  // JSON.parse の呼び出しを探して修正
  let patchedMethod = originalMethod;

  // SerializerのJSON.parseを修正
  if (patchedMethod.includes('JSON.parse')) {
    patchedMethod = patchedMethod.replace(
      /const\s+module\s*=\s*JSON\.parse\s*\(([^)]+)\)/g,
      `const module = (() => {
        try {
          const data = $1;
          // JavaScriptコードかどうかチェック
          if (typeof data === 'string' && data.startsWith('var __BUNDLE')) {
            console.log('[Expo Patch] JavaScriptバンドルをJSONに変換しています');
            return { 
              code: data,
              map: null,
              dependencies: [] 
            };
          }
          // 通常のJSON解析を試行
          return JSON.parse(data);
        } catch (e) {
          console.error('[Expo Patch] JSON解析エラー:', e.message);
          // フォールバック: データをコードとして扱う
          const rawData = $1;
          return {
            code: typeof rawData === 'string' ? rawData : String(rawData),
            map: null,
            dependencies: []
          };
        }
      })()`
    );
  }

  return content.replace(originalMethod, patchedMethod);
};

// メインプロセス
const main = async () => {
  log.info('Expo CLIのメトロバンドラーを直接パッチします...');

  // 重要なファイルを探す
  const metroBundlerFile = findExpoCliFile('MetroBundlerDevServer.js');
  if (!metroBundlerFile) {
    log.error('MetroBundlerDevServer.js が見つかりません');
    return false;
  }
  
  log.info(`発見: ${metroBundlerFile}`);

  // exportEmbedAsync.js も見つけてパッチ
  const exportEmbedFile = findExpoCliFile('exportEmbedAsync.js');
  if (exportEmbedFile) {
    log.info(`発見: ${exportEmbedFile}`);
  }

  // パッチを適用
  const bundlerPatched = patchMethodInFile(
    metroBundlerFile,
    '_bundleDirectAsync',
    patchBundleDirectAsync
  );

  if (bundlerPatched) {
    log.success('メトロバンドラーのパッチが完了しました');
    return true;
  } else {
    log.warn('パッチの適用が部分的に失敗しました');
    return false;
  }
};

// スクリプト実行
main()
  .then(success => {
    if (success) {
      log.success('Expo CLIパッチ処理が完了しました');
      process.exit(0);
    } else {
      log.error('Expo CLIパッチ処理が失敗しました');
      process.exit(1);
    }
  })
  .catch(err => {
    log.error(`エラーが発生しました: ${err.message}`);
    process.exit(1);
  });
